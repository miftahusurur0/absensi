const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const NEON_DATABASE_URL = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;

if (!NEON_DATABASE_URL) {
  console.error('DATABASE_URL or POSTGRES_PRISMA_URL not set');
  process.exit(1);
}

const sql = neon(NEON_DATABASE_URL);

async function getColumnInfo(tableName, columnName) {
  const rows = await sql`
    SELECT data_type, udt_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${tableName}
      AND column_name = ${columnName}
    LIMIT 1;
  `;
  return rows[0] || null;
}

async function fixDatabase() {
  console.log('Starting safe schema migration for Neon...\n');

  try {
    await sql`CREATE TABLE IF NOT EXISTS volunteers (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(20),
      role VARCHAR(100),
      locker VARCHAR(50),
      qr_code_data TEXT,
      card_number VARCHAR(50) UNIQUE,
      photo TEXT,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;

    await sql`CREATE TABLE IF NOT EXISTS history (
      id SERIAL PRIMARY KEY,
      volunteer_id VARCHAR(50),
      name VARCHAR(255),
      role VARCHAR(100),
      locker VARCHAR(50),
      photo TEXT,
      status VARCHAR(50) NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;

    await sql`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;

    await sql`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS card_number VARCHAR(50);`;
    await sql`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS qr_code_data TEXT;`;
    await sql`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';`;
    await sql`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`;

    const volunteersIdInfo = await getColumnInfo('volunteers', 'id');
    if (volunteersIdInfo && volunteersIdInfo.data_type !== 'character varying') {
      console.log('Migrating volunteers.id to VARCHAR(50)...');
      await sql`ALTER TABLE history DROP CONSTRAINT IF EXISTS history_volunteer_id_fkey;`;
      await sql`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS id_new VARCHAR(50);`;
      await sql`UPDATE volunteers SET id_new = CONCAT('VOL', id::text) WHERE id_new IS NULL;`;
      await sql`ALTER TABLE volunteers DROP CONSTRAINT IF EXISTS volunteers_pkey;`;
      await sql`ALTER TABLE volunteers RENAME COLUMN id TO id_old;`;
      await sql`ALTER TABLE volunteers RENAME COLUMN id_new TO id;`;
      await sql`ALTER TABLE volunteers ALTER COLUMN id SET NOT NULL;`;
      await sql`ALTER TABLE volunteers ADD CONSTRAINT volunteers_pkey PRIMARY KEY (id);`;
    }

    const historyVolunteerIdInfo = await getColumnInfo('history', 'volunteer_id');
    if (historyVolunteerIdInfo && historyVolunteerIdInfo.data_type !== 'character varying') {
      console.log('Migrating history.volunteer_id to VARCHAR(50)...');
      await sql`ALTER TABLE history ADD COLUMN IF NOT EXISTS volunteer_id_new VARCHAR(50);`;

      const hasIdOld = await getColumnInfo('volunteers', 'id_old');
      if (hasIdOld) {
        await sql`
          UPDATE history h
          SET volunteer_id_new = COALESCE(v.id, h.volunteer_id::text)
          FROM volunteers v
          WHERE v.id_old::text = h.volunteer_id::text
            AND h.volunteer_id_new IS NULL;
        `;
      }

      await sql`
        UPDATE history
        SET volunteer_id_new = COALESCE(volunteer_id_new, volunteer_id::text)
        WHERE volunteer_id_new IS NULL;
      `;
      await sql`ALTER TABLE history DROP COLUMN volunteer_id;`;
      await sql`ALTER TABLE history RENAME COLUMN volunteer_id_new TO volunteer_id;`;
    }

    await sql`CREATE UNIQUE INDEX IF NOT EXISTS volunteers_card_number_key ON volunteers(card_number);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_volunteers_card_number ON volunteers(card_number);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_history_volunteer_id ON history(volunteer_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_history_timestamp ON history(timestamp DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);`;

    const existingAdmin = await sql`SELECT id FROM users WHERE username = 'admin' LIMIT 1;`;
    if (existingAdmin.length === 0) {
      await sql`INSERT INTO users (username, password, role) VALUES ('admin', 'admin', 'admin');`;
      console.log('Default admin user created: admin/admin');
    }

    console.log('\nSchema migration completed successfully.');
    console.log('Current app-compatible schema:');
    console.log('- volunteers.id: VARCHAR(50)');
    console.log('- history.volunteer_id: VARCHAR(50)');
  } catch (error) {
    console.error('\nMigration failed:', error.message);
    process.exit(1);
  }
}

fixDatabase();
