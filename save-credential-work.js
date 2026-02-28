const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function saveWork() {
  try {
    await client.connect();
    
    // Read the health monitor script
    const healthMonitorCode = fs.readFileSync('/data/workspace/credential-health-monitor.js', 'utf8');
    const tokenManagerCode = fs.readFileSync('/data/workspace/data/skills/bloomie-drive-delivery/scripts/token-manager.js', 'utf8');
    
    // Insert KB entries
    console.log('Inserting KB entries for credential health system...');
    
    const healthMonitorKB = await client.query(
      'INSERT INTO jaden_kb (title, content, category) VALUES ($1, $2, $3) RETURNING id',
      [
        'Credential Health Monitor - Automated Token Validation',
        healthMonitorCode,
        'MONITORING',
      ]
    );
    console.log('✓ Health monitor KB entry (id:', healthMonitorKB.rows[0].id + ')');
    
    const tokenManagerKB = await client.query(
      'INSERT INTO jaden_kb (title, content, category) VALUES ($1, $2, $3) RETURNING id',
      [
        'Token Manager - Google Drive OAuth2 Auto-Refresh Handler',
        tokenManagerCode,
        'DRIVE',
      ]
    );
    console.log('✓ Token manager KB entry (id:', tokenManagerKB.rows[0].id + ')');
    
    // Update tasks
    console.log('\nUpdating task status...');
    
    // Mark Drive refresh as completed
    const updateDrive = await client.query(
      'UPDATE jaden_tasks SET status = $1, completed_at = $2 WHERE task = $3',
      ['completed', new Date().toISOString(), 'Fix Drive auto token refresh']
    );
    console.log('✓ Task updated: Fix Drive auto token refresh -> completed');
    
    // Mark credential monitor as completed
    const updateMonitor = await client.query(
      'UPDATE jaden_tasks SET status = $1, completed_at = $2 WHERE task = $3',
      ['completed', new Date().toISOString(), 'Build credential health monitor with cron']
    );
    console.log('✓ Task updated: Build credential health monitor -> completed');
    
    console.log('\n✓ All credential health system work saved to Supabase');
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

saveWork();
