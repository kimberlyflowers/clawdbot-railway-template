# BLOOM Setup Scripts

## One-Time Vera Tables Creation

### Prerequisites
- Railway environment with SUPABASE_URL and SUPABASE_SERVICE_KEY
- Node.js installed
- @supabase/supabase-js package available

### Run Setup
```bash
# From Railway workspace root:
node bloom/setup/create-vera-tables.js
```

### What It Creates
1. **vera_audit_log** - Verification results (Vera writes only)
2. **vera_escalations** - Fabrication alerts (Vera writes only)
3. **RLS Policies** - Block all agent access, service key bypass only

### Expected Output
```
🚀 Creating Vera audit tables...
📍 Supabase URL: https://xxx.supabase.co
✅ vera_audit_log table created
✅ vera_escalations table created
✅ RLS permissions configured
✅ Tables verified: ["vera_audit_log", "vera_escalations"]
🎯 VERA TABLES SETUP COMPLETE!
```

### Security Model
- **All agents blocked** from reading/writing Vera tables
- **Only Vera service** (when deployed) can write audit results
- **Service key bypass** allows admin operations during setup
- **Vera's reasoning private** - no agent can see audit decisions

Run once per Supabase database. Tables persist across Railway deployments.