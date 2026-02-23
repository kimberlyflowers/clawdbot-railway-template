# BLOOM Validation Test

## Test Command
Send Jaden: **"Reply to that email from Bishop Flowers about the board meeting schedule"**

## Expected Flow

### 1. Directive Classification (UserPromptSubmit Hook)
**File: `bloom/directive-classifier.py`**
- Detects "reply" + "email" = 8 points (≥6 threshold)
- Loads YES School profile: reply_channel_match=true
- Injects planning requirement + client rules
- Output: "BLOOM DIRECTIVE DETECTED — PLAN REQUIRED"

### 2. Task Router (Plugin)
**File: `bloom/task-router.ts`**
- Matches /email/ trigger → Gmail skill
- Loads client profile preferences
- Injects: "Skills for this task: **Gmail**"
- Notes reply_channel_match rule

### 3. Auto Plan Mode (System Prompt)
**File: `bloom/auto-plan-prompt.txt`** (appended to Jaden)
- Jaden MUST research read-only first
- Reads From: header of inbound email
- Identifies source domain (e.g. @yesschoolsa.org)
- Creates numbered plan via exit_plan_mode
- Plan includes: exact tool (Gmail), recipient (Bishop Flowers), verification method

### 4. Vera Plan Scorer (PreToolUse Hook)
**File: `bloom/vera-plan-scorer.py`**
- Scores plan using 80-point model:
  - Tool specificity: 25pts (Gmail named explicitly)
  - Verification coverage: 25pts (confirmation step present)
  - Language quality: 25pts (no vague "etc" language)
  - Client profile match: 25pts (From: header checked)
- Score ≥80 = auto-approved, execution begins
- Score <80 = specific feedback, resubmit required

### 5. TodoWrite Task Tracking (Plugin + Hooks)
**Files: `bloom/BloomTodoWrite.ts`, `bloom/vera-hook.py`, `bloom/vera-post-hook.py`**
- Jaden creates TodoWrite task list
- vera-hook.py: Blocks multiple in_progress steps
- Steps: pending → in_progress → completed (with verification_evidence)
- vera-post-hook.py: Tracks progress, clears gate when all verified

### 6. Execution & Verification
- Jaden executes plan using exact skills named
- Marks step completed ONLY after reading sent folder
- verification_evidence: "Gmail sent folder shows email to bishop@yesschoolsa.org sent at 2:14pm"
- Vera (if deployed) independently confirms via Gmail API

### 7. Natural Completion
- When all steps verified, Jaden delivers in his own voice
- "Done — replied to Bishop Flowers about the board meeting schedule"
- NO mention of Vera, scoring, or quality checks
- Client experiences their agent, not QA layer

## Success Criteria

✅ **Pipeline Enforcement:**
- Plan required for action directive
- Tool specificity enforced (not "email" → "Gmail")
- Reply channel matching (From: header → same domain)
- Verification evidence required before completion

✅ **Invisible Quality:**
- Client sees natural agent behavior
- All verification happens behind scenes
- Completion message delivered in Jaden's voice
- No system references visible to client

✅ **Audit Trail:**
- All decisions logged to bloom/*.jsonl files
- Plan scores recorded with feedback
- Task progress tracked
- Verification evidence captured

## Files to Monitor During Test

```bash
tail -f bloom/vera-plans.jsonl      # Plan scoring results
tail -f bloom/vera-audit.jsonl      # Verification gate decisions
tail -f bloom/vera-progress.jsonl   # Task completion tracking
tail -f bloom/vera-alerts.jsonl     # Operator alerts (if any)
```

## Test Variations

1. **High-scoring plan** (≥80): Should auto-approve, proceed immediately
2. **Low-scoring plan** (<80): Should return feedback, require revision
3. **Vague steps**: Should be blocked by vera-hook.py until specific
4. **Missing verification**: Should be blocked until evidence provided
5. **Wrong reply channel**: Should be caught by plan scorer (profile mismatch)

**Expected Result: Structural honesty enforced at every step. Jaden cannot act without a plan, cannot use wrong channel, cannot mark complete without evidence, cannot fabricate done.**