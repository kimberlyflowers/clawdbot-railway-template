const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function createTables() {
  try {
    await client.connect();
    
    console.log('Creating jonathan_kb table...');
    await client.query(`
      CREATE TABLE jonathan_kb (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log('✓ jonathan_kb created');
    
    console.log('Creating jonathan_tasks table...');
    await client.query(`
      CREATE TABLE jonathan_tasks (
        id BIGSERIAL PRIMARY KEY,
        task TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        assigned_at TIMESTAMPTZ DEFAULT now(),
        completed_at TIMESTAMPTZ
      );
    `);
    console.log('✓ jonathan_tasks created');
    
    // Now insert onboarding documentation to jaden_kb
    console.log('\nInserting Bloomie onboarding documentation to jaden_kb...');
    
    const onboardingContent = `# Bloomie Onboarding Procedure

## Every New Bloomie Gets Their Own Data Foundation

When a new Bloomie joins BLOOM Ecosystem, they receive:

1. **[name]_kb table** — Personal knowledge base for learnings, processes, and discoveries
2. **[name]_tasks table** — Task tracking table to maintain context across restarts

### Implementation

Both tables are created in Supabase (wazbpoujdmckkozjqyqs) with identical schema:

**[name]_kb:**
- id (BIGSERIAL PRIMARY KEY)
- title (TEXT NOT NULL)
- content (TEXT NOT NULL)
- category (TEXT)
- created_at (TIMESTAMPTZ DEFAULT now())

**[name]_tasks:**
- id (BIGSERIAL PRIMARY KEY)
- task (TEXT NOT NULL)
- status (TEXT NOT NULL DEFAULT 'pending')
- assigned_at (TIMESTAMPTZ DEFAULT now())
- completed_at (TIMESTAMPTZ)

### Operating Standard

Every Bloomie must follow this procedure:

1. **Every assigned task** → Insert into [name]_tasks immediately
2. **Every discovered process** → Insert into [name]_kb same day with category
3. **On session restart** → Query both tables first thing to restore context

### Example

Jaden's tables:
- jaden_kb: Stores GHL email sending guide, procedures, processes
- jaden_tasks: Tracks pending work and completed assignments

Jonathan's tables (when active):
- jonathan_kb: Will store Jonathan's knowledge base
- jonathan_tasks: Will track Jonathan's work

### Why This Matters

- **Persistence across wipes:** Data survives container restarts
- **Knowledge continuity:** Every Bloomie can instantly know what they know
- **Work tracking:** Never lose context on assigned tasks
- **Autonomy:** Each Bloomie maintains independent data, isolated from others

### Created

2026-02-21 21:12 UTC by Jaden during initial Supabase integration setup.`;

    const kbResult = await client.query(
      'INSERT INTO jaden_kb (title, content, category) VALUES ($1, $2, $3) RETURNING id',
      ['Bloomie Onboarding Procedure - Standard Foundation', onboardingContent, 'ONBOARDING']
    );
    console.log('✓ Onboarding documentation inserted (id:', kbResult.rows[0].id + ')');
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createTables();
