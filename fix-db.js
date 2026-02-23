const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const NEON_DATABASE_URL = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;

if (!NEON_DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(NEON_DATABASE_URL);

async function fixDatabase() {
  console.log('🔧 Fixing database schema...\n');

  try {
    // Drop and recreate history table with correct schema
    console.log('📋 Dropping and recreating history table...');
    await sql`DROP TABLE IF EXISTS history CASCADE;`;
    
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
    console.log('✓ history table recreated with VARCHAR volunteer_id');

    // Create indexes
    console.log('📋 Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_history_volunteer_id ON history(volunteer_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_history_timestamp ON history(timestamp DESC);`;
    console.log('✓ Indexes created');

    console.log('\n✅ Database fix completed!');
    
    // Test inserting data
    console.log('\n📝 Testing insert...');
    const result = await sql`
      INSERT INTO history (volunteer_id, name, role, locker, status, timestamp)
      VALUES ('STA001', 'Test User', 'Staff', '101', 'Masuk', NOW())
      RETURNING *;
    `;
    console.log('✓ Test insert successful:', result[0]);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

fixDatabase();
