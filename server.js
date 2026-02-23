const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const app = express();
app.use(cors());
app.use(express.json());
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
    const { volunteerId, name, role, locker, photo, status, timestamp } = req.body;

    if (!volunteerId || !status) {
      return res.status(400).json({ ok: false, error: 'volunteerId and status required' });
    }

    const result = await sql`
      INSERT INTO history (volunteer_id, name, role, locker, photo, status, timestamp)
      VALUES (${volunteerId}, ${name || null}, ${role || null}, ${locker || null}, ${photo || null}, ${status}, ${timestamp || new Date().toISOString()})
      RETURNING *;
    `;

    res.json({ ok: true, data: result[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Add/Create Volunteer (Neon)
app.post('/api/volunteers', async (req, res) => {
  try {
    const { name, email, phone, role, locker, qr_code_data, card_number, photo, status } = req.body;

    if (!name) {
      return res.status(400).json({ ok: false, error: 'name is required' });
    }

    const result = await sql`
      INSERT INTO volunteers (name, email, phone, role, locker, qr_code_data, card_number, photo, status)
      VALUES (${name}, ${email || null}, ${phone || null}, ${role || null}, ${locker || null}, ${qr_code_data || null}, ${card_number || null}, ${photo || null}, ${status || 'active'})
      RETURNING *;
    `;

    res.json({ ok: true, message: 'Volunteer created successfully', data: result[0] });
  } catch (err) {
    if (err.message.includes('duplicate key')) {
      return res.status(400).json({ ok: false, error: 'Card number already exists' });
    }
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Absensi Relawan Server running on http://localhost:${PORT}`);
  console.log(`\n📍 Available endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   GET  http://localhost:${PORT}/api/db-test`);
  console.log(`\n📊 Volunteers Endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/volunteers-count`);
  console.log(`   GET  http://localhost:${PORT}/api/volunteers`);
  console.log(`   GET  http://localhost:${PORT}/api/volunteers/:id`);
  console.log(`   POST http://localhost:${PORT}/api/volunteers`);
  console.log(`   PUT  http://localhost:${PORT}/api/volunteers/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/volunteers/:id`);
  console.log(`\n📋 History Endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/history-count`);
  console.log(`   GET  http://localhost:${PORT}/api/history`);
  console.log(`   POST http://localhost:${PORT}/api/history\n`);
});
