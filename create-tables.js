const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function createTables() {
  try {
    await client.connect();
    
    console.log('Creating jaden_kb table...');
    await client.query(`
      CREATE TABLE jaden_kb (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log('✓ jaden_kb created');
    
    console.log('Creating jaden_tasks table...');
    await client.query(`
      CREATE TABLE jaden_tasks (
        id BIGSERIAL PRIMARY KEY,
        task TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        assigned_at TIMESTAMPTZ DEFAULT now(),
        completed_at TIMESTAMPTZ
      );
    `);
    console.log('✓ jaden_tasks created');
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createTables();
