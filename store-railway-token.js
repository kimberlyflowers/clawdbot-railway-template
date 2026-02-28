const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function store() {
  try {
    await client.connect();
    
    const result = await client.query(
      'INSERT INTO jaden_kb (title, content, category) VALUES ($1, $2, $3) RETURNING id',
      ['Railway Account Token', 'Stored at /data/secrets/railway-api-token.txt - Account scoped, use as RAILWAY_API_TOKEN', 'CREDENTIALS']
    );
    
    console.log('✓ Token stored in jaden_kb (id:', result.rows[0].id + ')');
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

store();
