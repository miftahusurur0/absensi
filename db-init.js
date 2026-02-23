const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const NEON_DATABASE_URL = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;

if (!NEON_DATABASE_URL) {
  console.error('❌ DATABASE_URL or POSTGRES_PRISMA_URL not set in .env');
  process.exit(1);
}

const sql = neon(NEON_DATABASE_URL);

async function initializeDatabase() {
  console.log('🔧 Initializing Neon Postgres database...\n');

  try {
// Create volunteers table
    console.log('📋 Creating volunteers table...');
    await sql`
      CREATE TABLE IF NOT EXISTS volunteers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        role VARCHAR(100),
        locker VARCHAR(50),
        qr_code_data TEXT,
        photo TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ volunteers table created');

// Create history table
    console.log('📋 Creating history table...');
    await sql`
      CREATE TABLE IF NOT EXISTS history (
        id SERIAL PRIMARY KEY,
        volunteer_id VARCHAR(50),
        name VARCHAR(255),
        role VARCHAR(100),
        locker VARCHAR(50),
        photo TEXT,
        status VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ history table created');

// Create users table for admin login
    console.log('📋 Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ users table created');

    // Insert default admin user if not exists
    const existingAdmin = await sql`SELECT id FROM users WHERE username = 'admin';`;
    if (existingAdmin.length === 0) {
      // Default password: admin (in production, use hashed password)
      await sql`INSERT INTO users (username, password, role) VALUES ('admin', 'admin', 'admin');`;
      console.log('✓ Default admin user created (username: admin, password: admin)');
    }

    // Create indexes for better performance
    console.log('📋 Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_history_volunteer_id ON history(volunteer_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_history_timestamp ON history(timestamp DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_volunteers_card_number ON volunteers(card_number);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);`;
    console.log('✓ Indexes created');

    console.log('\n✅ Database initialization completed successfully!\n');
    console.log('Tables ready:');
    console.log('  - volunteers (for storing volunteer data and QR codes)');
    console.log('  - history (for attendance records)');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
