# Jaden Checkpoint Engine

**Category:** Operations / Agent Memory  
**Use For:** Prevent context-reset freezes, resume mid-build  
**Value:** Prevents work loss, enables multi-session builds  
**Status:** Production Ready

---

## What It Does

Auto-saves checkpoint data after each skill completes. On startup, checks if build is in progress and prompts me to resume from the exact point I froze.

**The Problem It Solves:**
- Context resets mid-build leave me without memory of where I was
- Rebuilding from scratch wastes time and causes duplicate work
- No way to know which skill I was working on when offline

**The Solution:**
- Auto-save JSON checkpoint after each skill finishes
- On startup, detect incomplete builds and prompt resume
- Track: current skill number, name, status, timestamp, test results
- Resume builds seamlessly without repeating completed work

---

## Core Functions

### 1. `saveCheckpoint(skillNumber, skillName, status, testResults)`
Saves build state to checkpoint file.

**Input:**
```javascript
{
  skillNumber: 2,
  skillName: "DM Sales Engine",
  status: "in_progress" | "completed" | "failed",
  testResults: { passing: 8, failing: 2, total: 10 },
  timestamp: "2026-02-19T08:15:00Z"
}
```

**Output:**
```javascript
{
  saved: true,
  file: "/data/workspace/.checkpoint/build-state.json",
  message: "Build state saved"
}
```

### 2. `loadCheckpoint()`
Loads the current build state from checkpoint file.

**Output:**
```javascript
{
  skillNumber: 2,
  skillName: "DM Sales Engine",
  status: "in_progress",
  testResults: { passing: 8, failing: 2, total: 10 },
  timestamp: "2026-02-19T08:15:00Z",
  isBuildInProgress: true
}
```

### 3. `getResumePrompt()`
Generates user-facing prompt for startup.

**Output:**
```
🔄 BUILD CHECKPOINT DETECTED

You were building: Skill #2 - DM Sales Engine
Status: In Progress (8/10 tests passing)
Last checkpoint: 2026-02-19 08:15 UTC

Resume from Skill #2? (y/n)
```

### 4. `clearCheckpoint()`
Clears checkpoint after build completes.

**Output:**
```javascript
{
  cleared: true,
  message: "Build checkpoint cleared — full suite complete"
}
```

---

## Usage

```javascript
const checkpoint = require('./index.js');

// After Skill #1 completes
await checkpoint.saveCheckpoint(2, "DM Sales Engine", "queued", {});

// On startup (in agent)
const state = await checkpoint.loadCheckpoint();
if (state.isBuildInProgress) {
  console.log(checkpoint.getResumePrompt());
  // Agent responds with: "resume" → continue from Skill #2
}

// After full build complete
await checkpoint.clearCheckpoint();
```

---

## Test Suite

- ✅ Save and load checkpoint
- ✅ Detect in-progress builds
- ✅ Generate resume prompts
- ✅ Clear checkpoint on completion
- ✅ Handle missing checkpoint file gracefully

---

## API

| Function | Purpose | Returns |
|----------|---------|---------|
| `saveCheckpoint(...)` | Save current build state | `{ saved: true, file, message }` |
| `loadCheckpoint()` | Load last saved state | `{ skillNumber, status, ... }` |
| `getResumePrompt()` | Get user prompt text | `string` |
| `clearCheckpoint()` | Clear checkpoint (on finish) | `{ cleared: true }` |
| `isInProgress()` | Check if build incomplete | `boolean` |

---

## Configuration

None required. Auto-detects checkpoint file location.

---

## Files

- `SKILL.md` — this file
- `index.js` — core logic (80 LOC)
- `test.js` — 10 tests (all passing)
- `package.json` — minimal deps
