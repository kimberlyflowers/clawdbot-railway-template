const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function update() {
  try {
    await client.connect();
    
    const content = `# Railway Authentication - Token Types & Setup

## Critical Distinction: Two Different Variable Names

### Project-Scoped Tokens
Use: \`RAILWAY_TOKEN\`
\`\`\`bash
export RAILWAY_TOKEN=$(cat /data/secrets/railway-api-token.txt)
railway whoami
\`\`\`

### Account-Level Tokens
Use: \`RAILWAY_API_TOKEN\` (NOT RAILWAY_TOKEN)
\`\`\`bash
export RAILWAY_API_TOKEN=$(cat /data/secrets/railway-api-token.txt)
railway whoami
\`\`\`

## Why This Matters
If you use the wrong variable name, Railway CLI will fail with "Unauthorized" even if the token is valid. This is a silent failure — the error message doesn't tell you it's a variable name issue.

**If you see:**
\`\`\`
Unauthorized. Please check that your RAILWAY_API_TOKEN is valid and has access to the resource you're trying to use.
\`\`\`

**Check:**
1. Are you using the right variable name?
   - Account-level? → \`RAILWAY_API_TOKEN\`
   - Project-scoped? → \`RAILWAY_TOKEN\`
2. Is the token in \`/data/secrets/railway-api-token.txt\`?
3. Are you exporting it? → \`export RAILWAY_API_TOKEN=...\`

## Current Setup
- Token type: Account-level (covers all projects)
- Variable: \`RAILWAY_API_TOKEN\`
- Storage: \`/data/secrets/railway-api-token.txt\`
- Usage: Access any BLOOM project (Bloomie-Yes, lucid-respect, etc.)

## Common Commands
\`\`\`bash
# Verify authentication
export RAILWAY_API_TOKEN=$(cat /data/secrets/railway-api-token.txt)
railway whoami

# Link to a project
railway link -p "Bloomie-Yes" -e production

# Set environment variables
railway variables set KEY=VALUE

# Redeploy
railway redeploy

# Check deployment status
railway status
\`\`\`

## Documentation Reference
- Railway CLI Docs: https://docs.railway.app/reference/cli-api
- Token Types: Account tokens grant access to all projects

## Discovered
2026-02-21T22:49:00Z by Kimberly (critical distinction for Bloomies)
This mistake wastes 15+ minutes of debugging. Now documented so it never happens again.`;

    const result = await client.query(
      'INSERT INTO bloom_kb (title, content, category) VALUES ($1, $2, $3) RETURNING id',
      ['Railway Authentication - Account vs Project Token Types', content, 'STARTER_BRAIN']
    );
    
    console.log('✓ Railway authentication distinction added to bloom_kb (id:', result.rows[0].id + ')');
    console.log('Future Bloomies will have this documented on day one.');
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

update();
