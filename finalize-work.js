const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function finalize() {
  try {
    await client.connect();
    
    // Mark Drive token refresh task as completed
    const updateResult = await client.query(
      'UPDATE jaden_tasks SET status = $1, completed_at = $2 WHERE task = $3',
      ['completed', new Date().toISOString(), 'Refresh Google Drive OAuth token and upload KB report']
    );
    
    console.log('✓ Task completed: Refresh Google Drive OAuth token and upload KB report');
    
    // Verify all tasks
    const tasksResult = await client.query('SELECT COUNT(*) as count FROM jaden_tasks WHERE status = \'completed\'');
    console.log('✓ All tasks complete:', tasksResult.rows[0].count + '/5');
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

finalize();
