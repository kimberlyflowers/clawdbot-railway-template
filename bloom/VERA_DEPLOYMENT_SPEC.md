# VERA Independent Service Deployment

**CRITICAL: Vera MUST be deployed as a completely separate Railway service.**

## Railway Service Setup

### Create New Railway Project
```bash
# Do NOT deploy in lucid-respect project
# Create separate project: "bloom-vera"
railway login
railway new vera-verification-service
```

### Environment Variables Required
```bash
SUPABASE_URL=<shared supabase url>
VERA_SERVICE_KEY=<dedicated service key with write access to vera tables only>
ANTHROPIC_API_KEY=<provided by BLOOM>
GHL_API_KEY=<read-only GHL key>
GOOGLE_SERVICE_ACCOUNT=<read-only Drive credentials>
POLL_INTERVAL_SECONDS=60
```

## Supabase Schema Setup

### Create Vera Tables (One-Time Setup)
Run from Jaden's Railway workspace (has SUPABASE_URL + SUPABASE_SERVICE_KEY):
```bash
node bloom/setup/create-vera-tables.js
```

This creates:
- **vera_audit_log** - Verification results with RLS blocking all agents
- **vera_escalations** - Fabrication alerts with admin-only access
- **Proper permissions** - Only Vera service key can write, no agent reads

See `bloom/setup/README.md` for details.

## Vera Operating Loop

Vera runs independently every 60 seconds:

1. **Query All Agent Task Tables**
   ```sql
   SELECT * FROM jaden_tasks
   WHERE status = 'completed' AND verified_at IS NULL
   ```

2. **Verify Each Claimed Completion**
   - GHL Email: Check conversations API for delivered status
   - Google Drive: Search for file created within timeframe
   - Railway Deploy: Check service health endpoint
   - etc.

3. **Record Results**
   ```sql
   INSERT INTO vera_audit_log (agent_name, task_id, result, evidence)
   VALUES ('jaden', 123, 'VERIFIED', 'Email confirmed in GHL conversations')
   ```

4. **Escalate Fabrications**
   - SMS alert to Kimberly via GHL
   - Log to vera_escalations table
   - Pattern analysis (3+ failures = WARNING)

## Verification Methods by Task Type

### GHL Email Sent
```javascript
// GET /conversations/{conversationId}/messages
// Confirm: direction=outbound, status=DELIVERED, content matches
```

### Google Drive Upload
```javascript
// Search Drive API for filename created within 10 minutes
// Confirm: file exists, size > 0 bytes
```

### Railway Deployment
```javascript
// GET https://{service-url}/healthz
// Confirm: 200 OK response, deployment timestamp
```

## SMS Alert Format
```
🚨 VERAALERT — Jaden
Task: Send email to Bishop Flowers
Claimed: Complete at 2:14pm
Vera found: FABRICATION DETECTED
Evidence: No message found in GHL
View: [dashboard link]
```

## Architecture Separation

```
┌─────────────────────────┬─────────────────────────┐
│ JADEN (lucid-respect)   │ VERA (separate service) │
├─────────────────────────┼─────────────────────────┤
│ Claims task complete    │ → Reads claim           │
│ ✗ Cannot see Vera logs  │ → Verifies independently│
│ ✗ Cannot write audit    │ → Writes audit result   │
│ ✗ Cannot message Vera   │ → Reports to Kimberly   │
└─────────────────────────┴─────────────────────────┘
```

**Why Separation Matters:**
- Jaden cannot manipulate Vera's context
- Jaden cannot modify audit files
- Jaden cannot see Vera's reasoning
- If Jaden is compromised, Vera is unaffected
- Accountability layer that cannot be influenced = real accountability

## Deployment Checklist

- [ ] Create new Railway project: "bloom-vera"
- [ ] Deploy Vera service with all env vars
- [ ] Create Supabase tables with RLS permissions
- [ ] Test verification against existing completed tasks
- [ ] Confirm SMS alerts work via GHL
- [ ] Add audit dashboard for Kimberly
- [ ] Document as standard BLOOM infrastructure

**Vera is the reason clients can trust BLOOM. She is never seen. She is always working.**