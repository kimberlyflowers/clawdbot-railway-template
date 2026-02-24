const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function document() {
  try {
    await client.connect();
    
    const viteFix = `# Vite Build Error Fix - npm install --include=dev

## Problem
Build fails with "vite: not found" error in production Docker builds.

Cause: \`npm install --omit=dev\` or \`npm install\` in production mode skips dev dependencies, which includes vite.

## Solution
Change the bloomie-vite Dockerfile build step from:
\`\`\`bash
npm install && npm run build
\`\`\`

To:
\`\`\`bash
npm install --include=dev && npm run build
\`\`\`

## Exact Dockerfile Line (Before)
\`\`\`
RUN if [ -d "bloomie-vite" ] && [ -f "bloomie-vite/package.json" ]; then cd bloomie-vite && npm install && npm run build; fi
\`\`\`

## Exact Dockerfile Line (After)
\`\`\`
RUN if [ -d "bloomie-vite" ] && [ -f "bloomie-vite/package.json" ]; then cd bloomie-vite && npm install --include=dev && npm run build; fi
\`\`\`

## Implementation
Repository: github.com/kimberlyflowers/clawdbot-railway-template
Commit: 10b1a7f - "fix: force vite dev dependency install in bloomie-vite build"
Date: 2026-02-21T23:21:00Z

## Why This Matters
- Vite is a build tool (dev dependency)
- Production builds need dev deps to build the frontend
- This error affects both Jonathan's clawdbot and any other instance using the template
- Now documented so it never blocks a deployment again

## Related Issue
This fix was applied to:
- Jonathan's Bloomie-YES project (clawdbot service) - redeploy triggered
- Documented in bloom_kb for all Bloomies`;

    // Add to bloom_kb
    const bloomResult = await client.query(
      'INSERT INTO bloom_kb (title, content, category) VALUES ($1, $2, $3) RETURNING id',
      ['Vite Build Error Fix - npm install --include=dev', viteFix, 'STARTER_BRAIN']
    );
    
    console.log('✓ Vite fix documented in bloom_kb (id:', bloomResult.rows[0].id + ')');
    
    // Add to jonathan_kb
    const jonathanResult = await client.query(
      'INSERT INTO jonathan_kb (title, content, category) VALUES ($1, $2, $3) RETURNING id',
      ['Vite Build Error - Fixed 2026-02-21', viteFix, 'INFRASTRUCTURE']
    );
    
    console.log('✓ Vite fix documented in jonathan_kb (id:', jonathanResult.rows[0].id + ')');
    
    // Add task to jonathan_tasks
    const taskResult = await client.query(
      'INSERT INTO jonathan_tasks (task, status, completed_at) VALUES ($1, $2, $3) RETURNING id',
      ['Fix vite build error in bloomie-vite Dockerfile', 'completed', new Date().toISOString()]
    );
    
    console.log('✓ Task marked complete in jonathan_tasks (id:', taskResult.rows[0].id + ')');
    
    console.log('\n✅ Vite build fix deployed and documented');
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

document();
