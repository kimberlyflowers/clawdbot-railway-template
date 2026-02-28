const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function save() {
  try {
    await client.connect();
    
    const config = JSON.parse(fs.readFileSync('/data/secrets/jonathan-railway-config.json', 'utf8'));
    
    const configContent = `# Jonathan's Railway Configuration

Project: Bloomie-Yes
Service: clawdbot-production-8b88
Dashboard: https://clawdbot-production-8b88.up.railway.app
SSH Key: /data/secrets/johnathon-railway-key

## Quick Reference
\`\`\`json
{
  "name": "Jonathan",
  "project": "Bloomie-Yes",
  "service": "clawdbot-production-8b88",
  "dashboard_url": "https://clawdbot-production-8b88.up.railway.app",
  "ssh_key": "/data/secrets/johnathon-railway-key"
}
\`\`\`

## Gateway Token Management
Set new gateway token:
\`\`\`bash
export RAILWAY_TOKEN=$(cat /data/secrets/railway-api-token.txt)
railway link -p "Bloomie-Yes" -e production
railway variables set OPENCLAW_GATEWAY_TOKEN=$(openssl rand -hex 32)
railway redeploy
\`\`\`

Verify deployment:
\`\`\`bash
curl https://clawdbot-production-8b88.up.railway.app/healthz
\`\`\`

Created: 2026-02-21T22:29:00Z by Jaden`;
    
    const result = await client.query(
      'INSERT INTO jonathan_kb (title, content, category) VALUES ($1, $2, $3) RETURNING id',
      ['Jonathan Railway Configuration - Bloomie-Yes Project', configContent, 'INFRASTRUCTURE']
    );
    
    console.log('✓ Jonathan config saved to jonathan_kb (id:', result.rows[0].id + ')');
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

save();
