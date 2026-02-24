const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// Neon Postgres Client
const NEON_DATABASE_URL = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;

if (!NEON_DATABASE_URL) {
  console.warn('⚠️ DATABASE_URL not set in .env, database features may fail');
} else {
  console.log('✓ Neon Postgres configured');
}

const sql = neon(NEON_DATABASE_URL || '');

// Health Check - Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// API Health Check (for monitoring)
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Absensi Relawan API Server Running',
    version: '2.0.0',
    database: 'Neon Postgres',
    endpoints: {
      health: 'GET /api/health',
      db_test: 'GET /api/db-test',
      volunteers_count: 'GET /api/volunteers-count',
      history_count: 'GET /api/history-count',
      volunteers_list: 'GET /api/volunteers',
      volunteers_bulk_import: 'POST /api/volunteers/bulk',
      volunteer_get: 'GET /api/volunteers/:id',
      volunteer_create: 'POST /api/volunteers',
      volunteer_update: 'PUT /api/volunteers/:id',
      volunteer_delete: 'DELETE /api/volunteers/:id',
      history_list: 'GET /api/history',
      history_create: 'POST /api/history'
    }
  });
});

// Test Database Connection
app.get('/api/db-test', async (req, res) => {
  if (!NEON_DATABASE_URL) {
    return res.status(400).json({ ok: false, error: 'DATABASE_URL not set in .env' });
  }

  try {
    const result = await sql`SELECT NOW() as current_time, 1 as ok;`;
    res.json({ ok: true, message: 'Neon Postgres connection successful', data: result[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Login API - Check credentials against database
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'Username and password required' });
    }

    const result = await sql`
      SELECT id, username, role FROM users 
      WHERE username = ${username} AND password = ${password};
    `;

    if (result.length === 0) {
      return res.status(401).json({ ok: false, error: 'Invalid username or password' });
    }

    const user = result[0];
    res.json({ 
      ok: true, 
      message: 'Login successful',
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Register new user
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'Username and password required' });
    }

    const result = await sql`
      INSERT INTO users (username, password, role)
      VALUES (${username}, ${password}, ${role || 'admin'})
      RETURNING id, username, role;
    `;

    res.json({ ok: true, message: 'User created successfully', user: result[0] });
  } catch (err) {
    if (err.message.includes('duplicate key') || err.message.includes('unique')) {
      return res.status(400).json({ ok: false, error: 'Username already exists' });
    }
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const data = await sql`SELECT id, username, role, created_at FROM users ORDER BY created_at DESC;`;
    res.json({ ok: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get Volunteers Count (Neon)
app.get('/api/volunteers-count', async (req, res) => {
  try {
    const result = await sql`SELECT COUNT(*) as count FROM volunteers;`;
    const count = parseInt(result[0].count) || 0;
    res.json({ ok: true, count: count });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get History Count (Neon)
app.get('/api/history-count', async (req, res) => {
  try {
    const result = await sql`SELECT COUNT(*) as count FROM history;`;
    const count = parseInt(result[0].count) || 0;
    res.json({ ok: true, count: count });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get All Volunteers (Neon)
app.get('/api/volunteers', async (req, res) => {
  try {
    const data = await sql`
      SELECT * FROM volunteers 
      ORDER BY created_at DESC;
    `;
    res.json({ ok: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get All History (Neon)
app.get('/api/history', async (req, res) => {
  try {
    const data = await sql`
      SELECT * FROM history 
      ORDER BY timestamp DESC 
      LIMIT 100;
    `;
    res.json({ ok: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Add History Entry (Neon)
app.post('/api/history', async (req, res) => {
  try {
    let { volunteerId, name, role, locker, photo, status, timestamp } = req.body;

    // Validate required fields
    if (!volunteerId || !status || volunteerId === 'null' || volunteerId === 'undefined' || status === 'null' || status === 'undefined') {
      return res.status(400).json({ ok: false, error: 'volunteerId and status are required and must be valid' });
    }

    // Sanitize and convert to string
    volunteerId = String(volunteerId).trim();
    status = String(status).trim();
    name = (name && name !== 'null' && name !== 'undefined') ? String(name).trim() : null;
    role = (role && role !== 'null' && role !== 'undefined') ? String(role).trim() : null;
    locker = (locker && locker !== 'null' && locker !== 'undefined') ? String(locker).trim() : null;
    photo = (photo && photo !== 'null' && photo !== 'undefined') ? String(photo).trim() : null;
    timestamp = (timestamp && timestamp !== 'null' && timestamp !== 'undefined') ? String(timestamp).trim() : new Date().toISOString();

    // Validate volunteerId length
    if (volunteerId.length > 50) {
      return res.status(400).json({ ok: false, error: 'ID terlalu panjang' });
    }

    const result = await sql`
      INSERT INTO history (volunteer_id, name, role, locker, photo, status, timestamp)
      VALUES (${volunteerId}, ${name}, ${role}, ${locker}, ${photo}, ${status}, ${timestamp})
      RETURNING *;
    `;

    res.json({ ok: true, data: result[0] });
  } catch (err) {
    console.error('Error adding history:', err);
    if (err.message.includes('invalid input syntax')) {
      return res.status(400).json({ ok: false, error: 'Format data tidak valid' });
    }
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Add/Create Volunteer (Neon)
app.post('/api/volunteers', async (req, res) => {
  try {
    let { id, name, email, phone, role, locker, qr_code_data, card_number, photo, status } = req.body;

    // Validate required fields
    if (!id || !name || id === 'null' || id === 'undefined' || name === 'null' || name === 'undefined') {
      return res.status(400).json({ ok: false, error: 'id and name are required and must be valid' });
    }

    // Ensure id is a string and clean
    id = String(id).trim();
    name = String(name).trim();
    
    // Sanitize optional fields - convert undefined/empty string to null
    email = (email && email !== 'null' && email !== 'undefined') ? String(email).trim() : null;
    phone = (phone && phone !== 'null' && phone !== 'undefined') ? String(phone).trim() : null;
    role = (role && role !== 'null' && role !== 'undefined') ? String(role).trim() : null;
    locker = (locker && locker !== 'null' && locker !== 'undefined') ? String(locker).trim() : null;
    qr_code_data = (qr_code_data && qr_code_data !== 'null' && qr_code_data !== 'undefined') ? String(qr_code_data).trim() : null;
    card_number = (card_number && card_number !== 'null' && card_number !== 'undefined') ? String(card_number).trim() : null;
    photo = (photo && photo !== 'null' && photo !== 'undefined') ? String(photo).trim() : null;
    status = (status && status !== 'null' && status !== 'undefined') ? String(status).trim() : 'active';

    // Validate id length (max 50 chars for VARCHAR(50))
    if (id.length > 50) {
      return res.status(400).json({ ok: false, error: 'ID terlalu panjang (maksimal 50 karakter)' });
    }

    // Validate name length
    if (name.length > 255) {
      return res.status(400).json({ ok: false, error: 'Nama terlalu panjang (maksimal 255 karakter)' });
    }

    const result = await sql`
      INSERT INTO volunteers (id, name, email, phone, role, locker, qr_code_data, card_number, photo, status)
      VALUES (${id}, ${name}, ${email}, ${phone}, ${role}, ${locker}, ${qr_code_data}, ${card_number}, ${photo}, ${status})
      RETURNING *;
    `;

    res.json({ ok: true, message: 'Volunteer created successfully', data: result[0] });
  } catch (err) {
    console.error('Error creating volunteer:', err);
    if (err.message.includes('duplicate key') || err.message.includes('unique')) {
      return res.status(400).json({ ok: false, error: 'ID atau nomor kartu sudah terdaftar' });
    }
    if (err.message.includes('invalid input syntax')) {
      return res.status(400).json({ ok: false, error: 'Format data tidak valid. Periksa kembali input Anda.' });
    }
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Bulk Import Volunteers (Neon)
app.post('/api/volunteers/bulk', async (req, res) => {
  try {
    const incoming = Array.isArray(req.body?.volunteers) ? req.body.volunteers : [];

    if (incoming.length === 0) {
      return res.status(400).json({ ok: false, error: 'volunteers array is required' });
    }

    if (incoming.length > 5000) {
      return res.status(400).json({ ok: false, error: 'Too many rows. Maximum 5000 per request' });
    }

    const normalized = incoming
      .map((v) => ({
        id: String(v?.id || '').trim(),
        name: String(v?.name || '').trim(),
        email: v?.email || null,
        phone: v?.phone || null,
        role: v?.role || null,
        locker: v?.locker ? String(v.locker) : null,
        qr_code_data: v?.qr_code_data || null,
        card_number: v?.card_number || null,
        photo: v?.photo || null,
        status: v?.status || 'active'
      }))
      .filter((v) => v.id && v.name);

    if (normalized.length === 0) {
      return res.status(400).json({ ok: false, error: 'No valid rows (id and name are required)' });
    }

    const payload = JSON.stringify(normalized);

    try {
      const result = await sql`
        WITH src AS (
          SELECT *
          FROM jsonb_to_recordset(${payload}::jsonb) AS x(
            id text,
            name text,
            email text,
            phone text,
            role text,
            locker text,
            qr_code_data text,
            card_number text,
            photo text,
            status text
          )
        )
        INSERT INTO volunteers (id, name, email, phone, role, locker, qr_code_data, card_number, photo, status)
        SELECT
          id,
          name,
          NULLIF(email, ''),
          NULLIF(phone, ''),
          NULLIF(role, ''),
          NULLIF(locker, ''),
          NULLIF(qr_code_data, ''),
          NULLIF(card_number, ''),
          NULLIF(photo, ''),
          COALESCE(NULLIF(status, ''), 'active')
        FROM src
        ON CONFLICT (id)
        DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          role = EXCLUDED.role,
          locker = EXCLUDED.locker,
          qr_code_data = EXCLUDED.qr_code_data,
          card_number = EXCLUDED.card_number,
          photo = EXCLUDED.photo,
          status = EXCLUDED.status,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id;
      `;

      return res.json({
        ok: true,
        mode: 'batch',
        requested: incoming.length,
        valid: normalized.length,
        upserted: result.length,
        failed: 0,
        errors: []
      });
    } catch (batchErr) {
      const errors = [];
      let upserted = 0;

      for (const row of normalized) {
        try {
          const rowResult = await sql`
            INSERT INTO volunteers (id, name, email, phone, role, locker, qr_code_data, card_number, photo, status)
            VALUES (
              ${row.id},
              ${row.name},
              ${row.email},
              ${row.phone},
              ${row.role},
              ${row.locker},
              ${row.qr_code_data},
              ${row.card_number},
              ${row.photo},
              ${row.status}
            )
            ON CONFLICT (id)
            DO UPDATE SET
              name = EXCLUDED.name,
              email = EXCLUDED.email,
              phone = EXCLUDED.phone,
              role = EXCLUDED.role,
              locker = EXCLUDED.locker,
              qr_code_data = EXCLUDED.qr_code_data,
              card_number = EXCLUDED.card_number,
              photo = EXCLUDED.photo,
              status = EXCLUDED.status,
              updated_at = CURRENT_TIMESTAMP
            RETURNING id;
          `;
          if (rowResult.length > 0) upserted++;
        } catch (rowErr) {
          errors.push({ id: row.id, error: rowErr.message });
        }
      }

      return res.json({
        ok: true,
        mode: 'fallback-row-by-row',
        requested: incoming.length,
        valid: normalized.length,
        upserted,
        failed: errors.length,
        errors
      });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get Volunteer by ID (Neon)
app.get('/api/volunteers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql`
      SELECT * FROM volunteers WHERE id = ${id};
    `;

    if (result.length === 0) {
      return res.status(404).json({ ok: false, error: 'Volunteer not found' });
    }

    res.json({ ok: true, data: result[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Update Volunteer (Neon)
app.put('/api/volunteers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, locker, qr_code_data, photo, status } = req.body;

    const result = await sql`
      UPDATE volunteers 
      SET 
        name = COALESCE(${name || null}, name),
        email = COALESCE(${email || null}, email),
        phone = COALESCE(${phone || null}, phone),
        role = COALESCE(${role || null}, role),
        locker = COALESCE(${locker || null}, locker),
        qr_code_data = COALESCE(${qr_code_data || null}, qr_code_data),
        photo = COALESCE(${photo || null}, photo),
        status = COALESCE(${status || null}, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *;
    `;

    if (result.length === 0) {
      return res.status(404).json({ ok: false, error: 'Volunteer not found' });
    }

    res.json({ ok: true, message: 'Volunteer updated successfully', data: result[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Delete Volunteer (Neon)
app.delete('/api/volunteers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql`
      DELETE FROM volunteers WHERE id = ${id} RETURNING id;
    `;

    if (result.length === 0) {
      return res.status(404).json({ ok: false, error: 'Volunteer not found' });
    }

    res.json({ ok: true, message: 'Volunteer deleted successfully' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});


app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ ok: false, error: err.message });
});

module.exports = app;

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`\nAbsensi Relawan Server running on http://localhost:${PORT}`);
    console.log(`\nAvailable endpoints:`);
    console.log(`   GET  http://localhost:${PORT}/`);
    console.log(`   GET  http://localhost:${PORT}/api/health`);
    console.log(`   GET  http://localhost:${PORT}/api/db-test`);
    console.log(`\nVolunteers Endpoints:`);
    console.log(`   GET  http://localhost:${PORT}/api/volunteers-count`);
    console.log(`   GET  http://localhost:${PORT}/api/volunteers`);
    console.log(`   GET  http://localhost:${PORT}/api/volunteers/:id`);
    console.log(`   POST http://localhost:${PORT}/api/volunteers`);
    console.log(`   PUT  http://localhost:${PORT}/api/volunteers/:id`);
    console.log(`   DELETE http://localhost:${PORT}/api/volunteers/:id`);
    console.log(`\nHistory Endpoints:`);
    console.log(`   GET  http://localhost:${PORT}/api/history-count`);
    console.log(`   GET  http://localhost:${PORT}/api/history`);
    console.log(`   POST http://localhost:${PORT}/api/history\n`);
  });
}
