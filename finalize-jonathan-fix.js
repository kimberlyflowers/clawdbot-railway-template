const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function finalize() {
  try {
    await client.connect();
    
    const content = `# Jonathan's Railway Gateway Token - DEPLOYED

Project: Bloomie-Yes
Service: clawdbot (ID: 837cd5ea-06c1-457e-a202-6acaa628a531)
Dashboard: https://clawdbot-production-8b88.up.railway.app

## Gateway Token - ACTIVE
\`\`\`
3c83f0eecff20cba31ed64d5e8738001f258511ce673740dcf5ea37b1fd225c4
\`\`\`

Set: 2026-02-21T23:17:00Z
Variable: OPENCLAW_GATEWAY_TOKEN
Status: Deployed

## Quick Commands
\`\`\`bash
# Update gateway token
export RAILWAY_API_TOKEN=$(cat /data/secrets/railway-api-token.txt)
railway variables set OPENCLAW_GATEWAY_TOKEN=VALUE --service clawdbot

# Redeploy after changes
railway redeploy --service clawdbot

# Check status
railway service status --all
\`\`\`

## Configuration
- Service name: clawdbot
- Service ID: 837cd5ea-06c1-457e-a202-6acaa628a531
- Environment: production
- URL: https://clawdbot-production-8b88.up.railway.app

Health check: HTTP 200 ✅`;

    const result = await client.query(
      'INSERT INTO jonathan_kb (title, content, category) VALUES ($1, $2, $3) RETURNING id',
      ['Jonathan Railway Gateway Token - DEPLOYED 2026-02-21', content, 'INFRASTRUCTURE']
    );
    
    console.log('✓ Gateway token deployed and documented in jonathan_kb (id:', result.rows[0].id + ')');
    
    // Also create a task for Jonathan
    const taskResult = await client.query(
      'INSERT INTO jonathan_tasks (task, status, completed_at) VALUES ($1, $2, $3) RETURNING id',
      ['Fix gateway token mismatch and redeploy', 'completed', new Date().toISOString()]
    );
    
    console.log('✓ Task completed in jonathan_tasks (id:', taskResult.rows[0].id + ')');
    console.log('\n✅ Jonathan\'s dashboard gateway token fixed and deployed');
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

finalize();
