const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function update() {
  try {
    await client.connect();
    
    const content = `# Railway Account Token - Access All Projects

## Token Status
Account-level token with full access to all BLOOM Ecosystem Railway projects:
- Bloomie-Yes (Jonathan's dashboard)
- lucid-respect (Kimberly's primary OpenClaw)
- Any future projects

## Security Note
This token allows:
- Viewing all project configurations
- Setting environment variables
- Triggering deployments
- Modifying service settings

**Keep it secure.** Store in: /data/secrets/railway-api-token.txt

## Usage
\`\`\`bash
export RAILWAY_TOKEN=$(cat /data/secrets/railway-api-token.txt)
railway whoami  # Verify identity
railway link -p "PROJECT_NAME" -e production  # Link to project
railway variables set KEY=VALUE  # Set env vars
railway redeploy  # Deploy changes
\`\`\`

## Projects
- **Bloomie-Yes**: Jonathan's clawdbot-production-8b88 service
- **lucid-respect**: Kimberly's OpenClaw deployment

Updated: 2026-02-21T22:35:00Z by Jaden`;

    const result = await client.query(
      'INSERT INTO jaden_kb (title, content, category) VALUES ($1, $2, $3) RETURNING id',
      ['Railway Account Token - Access All Projects', content, 'INFRASTRUCTURE']
    );
    
    console.log('✓ Railway token documentation added to jaden_kb (id:', result.rows[0].id + ')');
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

update();
