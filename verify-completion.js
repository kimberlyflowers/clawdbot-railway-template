const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function verify() {
  try {
    await client.connect();
    
    console.log('=== JADEN_KB (KNOWLEDGE BASE) ===\n');
    const kbResult = await client.query('SELECT id, title, category FROM jaden_kb ORDER BY id');
    kbResult.rows.forEach(row => {
      console.log(`${row.id}. [${row.category}] ${row.title}`);
    });
    
    console.log('\n=== JADEN_TASKS (CURRENT STATUS) ===\n');
    const tasksResult = await client.query(
      'SELECT id, task, status FROM jaden_tasks ORDER BY id'
    );
    tasksResult.rows.forEach(row => {
      const statusIcon = row.status === 'completed' ? '✅' : '⏳';
      console.log(`${statusIcon} ${row.task}`);
      console.log(`   Status: ${row.status}\n`);
    });
    
    const completedCount = tasksResult.rows.filter(r => r.status === 'completed').length;
    console.log(`\n📊 SUMMARY: ${completedCount}/${tasksResult.rows.length} tasks completed`);
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

verify();
