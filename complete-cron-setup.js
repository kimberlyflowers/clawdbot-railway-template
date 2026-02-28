const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function complete() {
  try {
    await client.connect();
    
    // Document cron setup in jaden_kb
    const cronDocContent = fs.readFileSync('/data/workspace/credential-monitor-cron.sh', 'utf8');
    
    const cronEntry = await client.query(
      'INSERT INTO jaden_kb (title, content, category) VALUES ($1, $2, $3) RETURNING id',
      [
        'Credential Monitor Cron Job - Daily Health Checks',
        cronDocContent,
        'MONITORING'
      ]
    );
    console.log('✓ Cron setup documented in jaden_kb (id:', cronEntry.rows[0].id + ')');
    
    // Add new task: Drive token refresh (needs fresh auth code)
    const taskResult = await client.query(
      'INSERT INTO jaden_tasks (task, status) VALUES ($1, $2) RETURNING id',
      ['Refresh Google Drive OAuth token and upload KB report', 'pending']
    );
    console.log('✓ Task created: Drive token refresh (id:', taskResult.rows[0].id + ')');
    
    console.log('\n✓ Cron setup complete');
    console.log('  - Credential monitor will run daily at 09:00 UTC');
    console.log('  - Logs saved to /data/workspace/credentials-health/cron.log');
    console.log('  - Configuration: /data/workspace/credentials-health/CRON-CONFIG.txt');
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

complete();
