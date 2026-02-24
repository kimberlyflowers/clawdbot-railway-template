const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function update() {
  try {
    await client.connect();
    
    const content = `# Railway Account Token - FINAL CREDENTIAL RECORD

## Token Status - SECURE & VERIFIED
- **Token:** Stored at /data/secrets/railway-api-token.txt
- **Scope:** Account-level (access to all projects: Bloomie-Yes, lucid-respect, etc.)
- **Authenticated as:** flwrs_kmbrly@yahoo.com ✅
- **Save method:** printf (NOT echo - printf prevents trailing newline corruption)
- **Variable name:** RAILWAY_API_TOKEN (account tokens use RAILWAY_API_TOKEN, not RAILWAY_TOKEN)
- **Permissions:** 600 (owner read/write only)

## Critical Rules
1. Always use \`printf\` when saving to /data/secrets/ — never use \`echo\`
2. Always set permissions to 600 after saving
3. Use RAILWAY_API_TOKEN variable name for account-scoped tokens
4. Verify with: \`railway whoami\` must return flwrs_kmbrly@yahoo.com

## Usage
\`\`\`bash
export RAILWAY_API_TOKEN=$(cat /data/secrets/railway-api-token.txt)
railway whoami  # Should show: flwrs_kmbrly@yahoo.com
railway link -p "PROJECT_NAME" -e production
railway variables set KEY=VALUE
railway redeploy
\`\`\`

## Projects Accessible
- Bloomie-Yes (Jonathan's clawdbot-production-8b88)
- lucid-respect (Kimberly's OpenClaw)
- Any future BLOOM projects

## Loss Prevention
This token has been lost 3 times. It is now:
- Stored in /data/secrets/ with 600 permissions
- Backed up in jaden_kb (this entry)
- Documented in bloom_kb (Railway authentication guide)
- Saved with printf (no corruption)

**If lost again, update /data/secrets/railway-api-token.txt with printf immediately and verify with railway whoami.**

Created: 2026-02-21T23:13:00Z by Kimberly (final secure implementation)`;

    const result = await client.query(
      'INSERT INTO jaden_kb (title, content, category) VALUES ($1, $2, $3) RETURNING id',
      ['Railway Account Token - FINAL CREDENTIAL RECORD', content, 'CREDENTIALS']
    );
    
    console.log('✓ Final Railway credentials secured in jaden_kb (id:', result.rows[0].id + ')');
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

update();
