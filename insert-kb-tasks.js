const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function insertData() {
  try {
    await client.connect();
    
    // Read KB content
    const kbContent = fs.readFileSync('/data/workspace/email-monitor/KB-GHL-EMAIL-SENDING.md', 'utf8');
    
    // Insert KB doc
    console.log('Inserting KB document...');
    const kbResult = await client.query(
      'INSERT INTO jaden_kb (title, content, category) VALUES ($1, $2, $3) RETURNING id',
      ['GHL Email Sending - Complete Implementation Guide', kbContent, 'GHL']
    );
    console.log('✓ KB inserted (id:', kbResult.rows[0].id + ')');
    
    // Insert tasks
    console.log('\nInserting tasks...');
    
    const tasks = [
      { task: 'Fix Drive auto token refresh', status: 'pending' },
      { task: 'Build credential health monitor with cron', status: 'pending' },
      { task: 'Resend dad\'s email with full approved draft', status: 'completed' },
      { task: 'Verify resent email via GHL API', status: 'completed' }
    ];
    
    for (const t of tasks) {
      const completedAt = t.status === 'completed' ? new Date().toISOString() : null;
      const result = await client.query(
        'INSERT INTO jaden_tasks (task, status, completed_at) VALUES ($1, $2, $3) RETURNING id',
        [t.task, t.status, completedAt]
      );
      console.log('✓ Task inserted (id:', result.rows[0].id + '):', t.task);
    }
    
    console.log('\n=== SUMMARY ===');
    console.log('✓ 1 KB document stored');
    console.log('✓ 4 tasks tracked:');
    console.log('  - 2 pending (Drive refresh, Credential monitor)');
    console.log('  - 2 completed (Email resend, Email verify)');
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

insertData();
