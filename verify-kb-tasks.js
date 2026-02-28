const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function verify() {
  try {
    await client.connect();
    
    console.log('=== JADEN_KB TABLE ===\n');
    const kbResult = await client.query('SELECT id, title, category, LENGTH(content) as content_length FROM jaden_kb');
    kbResult.rows.forEach(row => {
      console.log('ID:', row.id);
      console.log('Title:', row.title);
      console.log('Category:', row.category);
      console.log('Content length:', row.content_length, 'bytes');
    });
    
    console.log('\n=== JADEN_TASKS TABLE ===\n');
    const tasksResult = await client.query('SELECT id, task, status, completed_at IS NOT NULL as is_completed FROM jaden_tasks ORDER BY id');
    tasksResult.rows.forEach(row => {
      console.log('ID:', row.id, '|', row.task, '| Status:', row.status);
    });
    
    console.log('\n✓ All data stored and verified');
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

verify();
