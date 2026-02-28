const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function verify() {
  try {
    await client.connect();
    
    console.log('=== JONATHAN_KB TABLE ===');
    const kb = await client.query('SELECT COUNT(*) as count FROM jonathan_kb');
    console.log('Rows:', kb.rows[0].count);
    
    console.log('\n=== JONATHAN_TASKS TABLE ===');
    const tasks = await client.query('SELECT COUNT(*) as count FROM jonathan_tasks');
    console.log('Rows:', tasks.rows[0].count);
    
    console.log('\n✓ Jonathan tables created and ready');
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

verify();
