# Neon Postgres Setup Guide

## Overview
Aplikasi ini sekarang menggunakan **Neon Postgres** (rekomendasi Vercel) untuk menyimpan data:
- **Data Relawan** - nama, email, phone, role, locker, QR code, dan kartu relawan
- **History Absensi** - attendance records dengan timestamp dan status

## Setup Steps

### 1. Create Neon Database on Vercel
1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Buka project Anda
3. Go to **Storage** → **Create New**
4. Pilih **Postgres** → **Create**
5. Pilih **Neon** sebagai provider
6. Follow instructions dan copy connection string

### 2. Setup Environment Variables
Tambahkan ke `.env.local`:

```env
# Neon Postgres (gunakan salah satu dari dua ini)
DATABASE_URL=postgresql://user:password@host/dbname
# atau
POSTGRES_PRISMA_URL=postgresql://user:password@host/dbname
```

### 3. Initialize Database
Run schema initialization and compatibility migration:

```bash
npm run db:init
npm run db:fix
```

Output yang diharapkan:
```
✅ Database initialization completed successfully!

Tables ready:
  - volunteers (for storing volunteer data and QR codes)
  - history (for attendance records)
```

### 4. Test Connection
```bash
npm start
```

Buka browser: `http://localhost:3001/api/db-test`
Seharusnya tampil:
```json
{
  "ok": true,
  "message": "Neon Postgres connection successful",
  "data": { "current_time": "...", "ok": 1 }
}
```

## Database Schema

### Volunteers Table
```sql
CREATE TABLE volunteers (
  id VARCHAR(50) PRIMARY KEY,     -- contoh: STA0180
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(100),
  locker VARCHAR(50),
  qr_code_data TEXT,              -- QR code content
  card_number VARCHAR(50) UNIQUE, -- Kartu relawan
  photo TEXT,                     -- Base64 photo
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### History Table
```sql
CREATE TABLE history (
  id SERIAL PRIMARY KEY,
  volunteer_id VARCHAR(50),       -- sama dengan volunteers.id
  name VARCHAR(255),
  role VARCHAR(100),
  locker VARCHAR(50),
  photo TEXT,
  status VARCHAR(50) NOT NULL,    -- 'check-in', 'check-out', etc
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Volunteers Management

#### Create Volunteer
```bash
curl -X POST http://localhost:3001/api/volunteers \
  -H "Content-Type: application/json" \
  -d '{
    "id": "STA0180",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "08123456789",
    "role": "Koordinator",
    "locker": "A-01",
    "qr_code_data": "VOLUNTEER_123",
    "card_number": "CARD-001",
    "photo": "base64_string_here",
    "status": "active"
  }'
```

Response:
```json
{
  "ok": true,
  "message": "Volunteer created successfully",
  "data": { "id": "STA0180", "name": "John Doe", ... }
}
```

#### Get All Volunteers
```bash
GET http://localhost:3001/api/volunteers
```

#### Get Specific Volunteer
```bash
GET http://localhost:3001/api/volunteers/STA0180
```

#### Update Volunteer
```bash
curl -X PUT http://localhost:3001/api/volunteers/STA0180 \
  -H "Content-Type: application/json" \
  -d '{ "status": "inactive" }'
```

#### Delete Volunteer
```bash
DELETE http://localhost:3001/api/volunteers/STA0180
```

### Attendance History

#### Record Attendance
```bash
curl -X POST http://localhost:3001/api/history \
  -H "Content-Type: application/json" \
  -d '{
    "volunteerId": "STA0180",
    "name": "John Doe",
    "role": "Koordinator",
    "locker": "A-01",
    "photo": "base64_string_here",
    "status": "check-in",
    "timestamp": "2026-02-23T10:30:00Z"
  }'
```

#### Get History
```bash
GET http://localhost:3001/api/history
```

### Statistics

#### Get Volunteer Count
```bash
GET http://localhost:3001/api/volunteers-count
```

#### Get History Count
```bash
GET http://localhost:3001/api/history-count
```

## Migration from Supabase (if needed)

### Export from Supabase
```bash
# Connect to Supabase database
pg_dump postgresql://user:password@host/database > backup.sql
```

### Import to Neon
```bash
# Connect to Neon database
psql postgresql://user:password@neon_host/neon_db < backup.sql
```

## Troubleshooting

### Connection Error
- Check DATABASE_URL di `.env.local`
- Pastikan Neon connection string benar
- Test dengan: `GET /api/db-test`

### Table Not Found
- Run: `npm run db:init`
- Pastikan database permissions OK

### Duplicate Key Error
- `card_number` harus unique
- Pastikan tidak ada duplicate saat insert

## Development vs Production

- **Local**: Gunakan `.env.local` dengan local connection string
- **Vercel**: Add environment variables di Vercel Dashboard
- Database akan auto-migrate saat deploy

## Next Steps

1. Setup environment variables di `.env.local`
2. Run `npm run db:init` untuk buat tables
3. Update front-end untuk call API endpoints baru
4. Test dengan `npm start`
5. Deploy ke Vercel

---

**Last Updated**: February 23, 2026
**Database**: Neon Postgres (Vercel)
