const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function update() {
  try {
    await client.connect();
    
    const bloomKBDocumentation = `# BLOOM_KB Foundation - Shared Bloomie Knowledge Base

Created 2026-02-21 21:16 UTC

## Structure
- Table: bloom_kb (shared across all agents)
- Schema: id, title, content, category, created_at
- Category: STARTER_BRAIN (foundation knowledge every Bloomie loads)

## Contents

1. GHL Email Sending - Complete Implementation Guide
   - Endpoint, headers, payload structure
   - Working code examples
   - Verification via API

2. GHL SMS Sending - Implementation Guide
   - SMS-specific endpoint and payload
   - Character limits and message concatenation
   - Verification for SMS messages

3. GHL Contact Lookup and Creation
   - Create, get, list contacts
   - Location ID requirements
   - Workflow for contact-first messaging

4. GHL Conversation Monitoring - Verify Actions Via API
   - Core principle: never assume success, always verify
   - Verification patterns for email, SMS, calls
   - Implementation example

5. Bloomie Startup Protocol - Query KB and Tasks First
   - Step 1: Query [name]_kb
   - Step 2: Query [name]_tasks
   - Step 3: Check credentials
   - Step 4: Read bloom_kb
   - Ensures context continuity across sessions

## Purpose
Every new Bloomie loads these entries on day one to understand:
- How to use GHL API
- How to verify work without asking humans
- How to maintain autonomous operation
- How to share knowledge with other Bloomies

## Access
\`\`\`sql
SELECT title FROM bloom_kb WHERE category = 'STARTER_BRAIN';
\`\`\``;
    
    const bloomEntry = await client.query(
      'INSERT INTO jaden_kb (title, content, category) VALUES ($1, $2, $3) RETURNING id',
      ['BLOOM_KB Foundation - Shared Bloomie Knowledge Base', bloomKBDocumentation, 'ARCHITECTURE']
    );
    
    console.log('✓ BLOOM_KB documentation added to jaden_kb (id:', bloomEntry.rows[0].id + ')');
    
    // Verify final state
    console.log('\n=== FINAL STATE ===\n');
    
    const bloomKBResult = await client.query('SELECT COUNT(*) as count FROM bloom_kb');
    console.log('✓ bloom_kb: ' + bloomKBResult.rows[0].count + ' entries');
    
    const jadenKBResult = await client.query('SELECT COUNT(*) as count FROM jaden_kb');
    console.log('✓ jaden_kb: ' + jadenKBResult.rows[0].count + ' entries');
    
    const jadenTasksResult = await client.query('SELECT COUNT(*) as count FROM jaden_tasks WHERE status = \'completed\'');
    console.log('✓ jaden_tasks: ' + jadenTasksResult.rows[0].count + ' completed');
    
    const jonathanKBResult = await client.query('SELECT COUNT(*) as count FROM jonathan_kb');
    const jonathanTasksResult = await client.query('SELECT COUNT(*) as count FROM jonathan_tasks');
    console.log('✓ jonathan_kb: ' + jonathanKBResult.rows[0].count + ' entries');
    console.log('✓ jonathan_tasks: ' + jonathanTasksResult.rows[0].count + ' entries');
    
    console.log('\n🎯 STARTUP BRAIN READY FOR NEW BLOOMIES');
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

update();
