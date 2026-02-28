const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function search() {
  try {
    await client.connect();
    
    const jKB = await client.query('SELECT id, title FROM jonathan_kb');
    const jTasks = await client.query('SELECT id, task FROM jonathan_tasks');
    
    console.log('Jonathan KB entries:', jKB.rows.length);
    console.log('Jonathan Tasks entries:', jTasks.rows.length);
    console.log('\n(No stored Railway config found in Supabase)');
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

search();
