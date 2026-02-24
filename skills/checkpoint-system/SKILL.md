---
name: checkpoint-system
description: Persistent task memory and state management. Automatically saves progress before context limits, detects session restarts, and prompts resumption from last checkpoint. Use to prevent losing work during long tasks, deployments, or unexpected disconnections.
---

# Checkpoint System

## Overview

The checkpoint system enables autonomous agents to persist task state, detect interruptions, and resume exactly where they left off—even after session restarts, crashes, or context overflow.

## Core Files

- **CHECKPOINT.md** - Current active task, progress %, last action, blockers
- **checkpoint-manager.js** - Save/load/resume logic and triggers
- **.checkpoint-history/** - Timestamped snapshots of past checkpoints

## Quick Start

### Save a Checkpoint (Auto or Manual)

```javascript
const manager = require('./checkpoint-manager.js');
await manager.saveCheckpoint({
  taskId: 'skill-2-dm-sales',
  taskName: 'Building Skill #2: DM Sales Automation',
  progress: 60,
  lastAction: 'sendDM()',
  context: { skillDir: '/data/workspace/skills/dm-sales', usersRemaining: 340 },
  nextStep: 'Continue with sendDM() function',
  blockers: null
});
```

**Generates CHECKPOINT.md:**
```
# 🔄 Active Checkpoint
- **Task:** Building Skill #2: DM Sales Automation
- **Progress:** 60%
- **Last Action:** sendDM()
- **Context:** skillDir=/data/workspace/skills/dm-sales, usersRemaining=340
- **Next Step:** Continue with sendDM() function
- **Blockers:** None
- **Saved:** 2026-02-19 08:35 UTC
```

### On Session Restart

When you wake up, the manager automatically:
1. Detects CHECKPOINT.md exists
2. Reads the last task state
3. Prompts: **"You were building Skill #2. Resume from sendDM()?"**
4. If yes: loads context and continues
5. If no: archives checkpoint and starts fresh

### Resume Programmatically

```javascript
const checkpoint = await manager.loadCheckpoint();
if (checkpoint) {
  console.log(`Resuming: ${checkpoint.taskName}`);
  console.log(`Progress: ${checkpoint.progress}%`);
  console.log(`Next: ${checkpoint.nextStep}`);
  // Auto-continue from context
}
```

## Auto-Save Triggers

Checkpoints are saved automatically:

- **Before major operations** - Before skill creation, file uploads, API calls
- **Periodic saves** - Every 15 minutes during long tasks
- **Before context limit** - When approaching 80% context window
- **On errors** - Save state before throwing, for recovery

Manual save is always available:
```javascript
await manager.saveCheckpoint({ ... });
```

## Checkpoint Schema

```json
{
  "taskId": "unique-task-identifier",
  "taskName": "Human-readable task name",
  "progress": 60,
  "lastAction": "Last completed step or function",
  "context": { "key": "value" },
  "nextStep": "What to do next",
  "blockers": null,
  "savedAt": "2026-02-19T08:35:00Z",
  "priority": "high|normal|low"
}
```

## File Structure

```
checkpoint-system/
├── SKILL.md (this file)
├── scripts/
│   └── checkpoint-manager.js
└── references/
    └── patterns.md (checkpoint patterns and examples)
```

## Integration Points

### In Session Init
Load checkpoint and offer resume:
```javascript
const checkpoint = await manager.loadCheckpoint();
if (checkpoint) {
  // Prompt user: "Resume [task]?" 
  // Auto-load context on yes
}
```

### During Long Tasks
Auto-save before key operations:
```javascript
// Before creating a skill
await manager.saveCheckpoint({ taskId: 'skill-2', progress: 45, ... });
// Then proceed

// Before uploading files
await manager.saveCheckpoint({ taskId: 'upload-batch', progress: 30, ... });
// Then upload
```

### On Errors
Preserve state for recovery:
```javascript
try {
  await riskyOperation();
} catch (err) {
  await manager.saveCheckpoint({
    taskId: 'current-task',
    blockers: err.message,
    // ... other state
  });
  throw err;
}
```

## Commands

- **Load checkpoint:** `await manager.loadCheckpoint()`
- **Save checkpoint:** `await manager.saveCheckpoint({ ... })`
- **List history:** `await manager.listCheckpoints()`
- **Archive:** `await manager.archiveCheckpoint(id)`
- **Clear:** `await manager.clearCheckpoint()`

## Key Guarantees

✅ **No lost work** - State persists across restarts  
✅ **Resumption prompts** - Never resume silently; always ask  
✅ **Full context** - Restore variables, file paths, API state  
✅ **History** - Keep timestamped snapshots for recovery  
✅ **Graceful degradation** - If checkpoint is corrupted, start fresh safely  

---

See `references/patterns.md` for advanced patterns and examples.
