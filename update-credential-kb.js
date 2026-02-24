const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function update() {
  try {
    await client.connect();
    
    const content = `# Credential Storage Best Practice - printf vs echo

## Critical Rule: Never Use echo to Save Credentials

### ❌ WRONG - echo adds trailing newline
\`\`\`bash
echo "TOKEN_VALUE" > /data/secrets/file.txt
# Results in: TOKEN_VALUE\n (newline corrupts token)
\`\`\`

### ✅ CORRECT - printf has no trailing newline
\`\`\`bash
printf "TOKEN_VALUE" > /data/secrets/file.txt
# Results in: TOKEN_VALUE (clean, no corruption)
\`\`\`

## Why This Matters
Many APIs and services reject credentials with trailing whitespace:
- Railway API tokens fail with "Unauthorized" if newline is present
- SSH keys won't authenticate with extra characters
- API tokens with \n get rejected silently

The error message doesn't tell you it's whitespace — it just says "invalid" or "unauthorized".

## Standard Procedure for Saving Credentials
\`\`\`bash
# Always use printf, never echo
printf "VALUE" > /data/secrets/filename.txt

# Set restrictive permissions
chmod 600 /data/secrets/filename.txt

# Verify no corruption
cat /data/secrets/filename.txt | od -An -tx1 -c

# Export for use
VARIABLE=$(cat /data/secrets/filename.txt)
export VARIABLE
\`\`\`

## Applied Rule
2026-02-21T23:08:00Z - Railway token saved with printf after discovering echo was corrupting it with trailing newline. Now permanent practice.`;

    const result = await client.query(
      'INSERT INTO jaden_kb (title, content, category) VALUES ($1, $2, $3) RETURNING id',
      ['Credential Storage - Use printf Not echo', content, 'SECURITY']
    );
    
    console.log('✓ Credential storage best practice added to jaden_kb (id:', result.rows[0].id + ')');
    console.log('Never use echo for credentials again.');
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

update();
