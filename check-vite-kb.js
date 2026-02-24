const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    await client.connect();
    
    const result = await client.query(
      'SELECT id, title, content FROM bloom_kb WHERE content ILIKE \'%npm install --include=dev%\' OR title ILIKE \'%vite%\''
    );
    
    if (result.rows.length > 0) {
      console.log('✓ Found vite documentation in bloom_kb:\n');
      result.rows.forEach(row => {
        console.log(`ID: ${row.id}`);
        console.log(`Title: ${row.title}`);
        console.log(`Content (first 300 chars):\n${row.content.substring(0, 300)}\n`);
      });
    } else {
      console.log('No vite fix documentation found in bloom_kb');
    }
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();
