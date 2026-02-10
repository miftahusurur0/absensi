const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Supabase Client
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mbqizqdgcxmzpumddhlp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.warn('⚠️ SUPABASE_SERVICE_KEY not set in .env, some features may fail');
} else {
  console.log('✓ Supabase configured');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || '');

// Health Check
app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Absensi Relawan API Server Running',
    version: '1.0.0',
    endpoints: {
      health: 'GET /',
      volunteers_count: 'GET /api/volunteers-count',
      history_count: 'GET /api/history-count',
      pg_test: 'GET /api/pg-test',
      volunteers: 'GET /api/volunteers',
      history: 'GET /api/history'
    }
  });
});

// Test PG Connection (Direct PostgreSQL)
app.get('/api/pg-test', async (req, res) => {
  const PG_CONNECTION = process.env.PG_CONNECTION;
  if (!PG_CONNECTION) {
    return res.status(400).json({ ok: false, error: 'PG_CONNECTION not set in .env' });
  }

  const client = new Client({ connectionString: PG_CONNECTION });
  try {
    await client.connect();
    const result = await client.query('SELECT NOW() as current_time, 1 as ok;');
    await client.end();
    res.json({ ok: true, message: 'PostgreSQL connection successful', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get Volunteers Count (Supabase)
app.get('/api/volunteers-count', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('volunteers')
      .select('id', { count: 'exact', head: true });

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }
    res.json({ ok: true, count: count || 0 });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get History Count (Supabase)
app.get('/api/history-count', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('history')
      .select('id', { count: 'exact', head: true });

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }
    res.json({ ok: true, count: count || 0 });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get All Volunteers (Supabase)
app.get('/api/volunteers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }
    res.json({ ok: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get All History (Supabase)
app.get('/api/history', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }
    res.json({ ok: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Add History Entry (Supabase)
app.post('/api/history', async (req, res) => {
  try {
    const { volunteerId, name, role, locker, photo, status, timestamp } = req.body;

    if (!volunteerId || !status) {
      return res.status(400).json({ ok: false, error: 'volunteerId and status required' });
    }

    const { data, error } = await supabase
      .from('history')
      .insert([{
        volunteerId,
        name,
        role,
        locker,
        photo,
        status,
        timestamp: timestamp || new Date().toISOString()
      }])
      .select();

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }
    res.json({ ok: true, data: data[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ ok: false, error: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Absensi Relawan Server running on http://localhost:${PORT}`);
  console.log(`\n📍 Available endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/api/volunteers-count`);
  console.log(`   GET  http://localhost:${PORT}/api/history-count`);
  console.log(`   GET  http://localhost:${PORT}/api/pg-test`);
  console.log(`   GET  http://localhost:${PORT}/api/volunteers`);
  console.log(`   GET  http://localhost:${PORT}/api/history`);
  console.log(`   POST http://localhost:${PORT}/api/history\n`);
});
