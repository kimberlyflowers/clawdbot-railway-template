# MEMORY.md — Projects & Context

## Current Projects

### 1. Bloomie Control UI Reskin (Phase 1 Complete)
Status: Awaiting Phase 2

See detailed notes below under "Bloomie Control UI Reskin Project"

### 2. bloomie-drive-delivery Skill (✅ COMPLETE & TESTED)
Date: 2026-02-13
Status: Fully authorized, tested, production-ready

**What I built:**
- Complete Google Drive upload skill using **OAuth2** 
- Works with personal Gmail accounts (no Shared Drive needed)
- Tested successfully — test file uploaded to Drive
- Dependencies: mime-types only (minimal footprint)
- Features: Auto MIME detection, instant shareable links, any file type support

**How it works:**
1. User authorizes once via browser (`node scripts/oauth-setup.js`)
2. Refresh token stored locally in `.drive-tokens.json` (git-ignored, auto-created)
3. Upload works forever: `uploadToDrive(filePath, optionalFileName)`
4. Uses user's Drive quota, no service account restrictions

**Files created:**
- `/data/workspace/drive-delivery/` — Complete skill package
- `/openclaw/skills/bloomie-drive-delivery/` — Registered skill location
  - `scripts/upload.js` — OAuth2 upload engine
  - `scripts/oauth-setup.js` — One-time authorization flow
  - `SETUP.md` & `SETUP_OAUTH2.md` — Documentation
  - `config.json` — Configured with Kimberly's credentials
  - `test.js` — Test script
  - `.gitignore` — Protects tokens and secrets

**Tested:**
- ✅ OAuth2 authorization completed
- ✅ Refresh token generated and saved
- ✅ Test file uploaded successfully
- ✅ Live Drive link generated: https://drive.google.com/file/d/1LDcBLu_Kry-h2gYY3ldi8yE5OXSswvKV/view

**Registered with OpenClaw (Bloomie-branded):**
- ✅ Skill location: `/openclaw/skills/bloomie-drive-delivery/`
- ✅ Production-ready for agents and workflows
- ✅ Test document uploaded successfully: https://drive.google.com/file/d/1LDcBLu_Kry-h2gYY3ldi8yE5OXSswvKV/view

**Convention Update:**
- ✅ All future skills will be Bloomie-branded
- ✅ Naming pattern: `bloomie-[skill-name]`
- ✅ Updated SOUL.md with new skill naming convention

---

# MEMORY.md — Bloomie Control UI Reskin Project

## Mission
Rebuild OpenClaw Control UI dashboard with persistent Bloomie CSS + Lit template overrides. Ensure custom CSS/template changes survive Gateway restarts.

## Architecture Insights

### OpenClaw Control UI Stack
- **Frontend**: Lit 3.3.2 (web components, TypeScript)
- **Build**: Vite 7.3.1
- **Styles**: CSS custom properties (67 total), namespaced (`--bg`, `--accent`, etc.)
- **Theme**: `data-theme` attribute on `<html>` element (dark/light via View Transitions)

### The Persistence Problem
1. Gateway rebuilds entire UI from source on startup
2. Build process: `ensureControlUiAssetsBuilt()` (server.impl.ts:289)
3. **Result**: Any custom CSS/JS in dist/ gets wiped on restart
4. **Solution**: `/data/start.sh` pattern — restore overrides BEFORE app boots

### Current State
- `start.sh` already has backup restore logic (but no backup exists)
- Backup location: `/openclaw/dist/control-ui.backup/`
- Start script runs BEFORE `node /app/src/server.js` (perfect hook point)

## The Plan (Phase 2+)
1. **Backup**: Copy original UI to `.backup/` once
2. **Overrides**: Create `bloomie-overrides.css` with Bloomie palette
3. **Persistence**: Update `start.sh` to:
   - Restore backup
   - Copy Bloomie overrides to dist after restore
   - App boots with Bloomie skin
4. **Test**: Verify CSS persists through restart

## Key Technical Details

### 67 CSS Custom Properties (All Themeable)
**Colors**: `--bg`, `--accent`, `--primary`, `--accent-2`, `--ok`, `--warn`, `--danger`, etc.
**Text**: `--text`, `--text-strong`, `--muted`, `--chat-text`
**Surfaces**: `--card`, `--panel`, `--chrome`, `--border`, `--input`
**Semantic**: `--ok-subtle`, `--warn-muted`, `--danger-subtle`, etc.
**Spacing**: `--shell-nav-width` (220px), `--shell-topbar-height` (56px)
**Shadows**: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`, `--shadow-glow`
**Animations**: `--ease-out`, `--duration-normal` (200ms), etc.

### Control UI Features (Must Preserve)
- 13 tabs (Chat, Overview, Channels, Instances, Sessions, Usage, Cron, Agents, Skills, Nodes, Config, Debug, Logs)
- Persistent memory display (MEMORY.md + daily logs in Agents > Files)
- Health snapshots (Overview + Debug > Snapshots)
- Real-time event log, live logs, browser screen control
- All submenus (Files, Tools, Skills, Channels, Cron)

### Brand References
- Class name: `OpenClawApp` (used 85 times in TS)
- Only visual rebranding via CSS feasible; leave TS code unchanged
- HTML alt="OpenClaw" (app-render.ts:137)

## Files & Paths

**Source**:
- UI source: `/openclaw/ui/src/`
- Styles: `/openclaw/ui/src/styles/*.css` (base.css defines all vars)
- Main app class: `/openclaw/ui/src/ui/app.ts:106`
- Theme logic: `/openclaw/ui/src/ui/app-settings.ts:275`

**Built Output**:
- Control UI dist: `/openclaw/dist/control-ui/` (rebuilt on each startup)
- Backup location (to create): `/openclaw/dist/control-ui.backup/`

**Scripts**:
- Start hook: `/data/start.sh` (runs BEFORE app boots)
- Gateway startup calls: `/openclaw/src/gateway/server.impl.ts:289`

**Documentation**:
- Phase 1 report: `/data/workspace/PHASE_1_SYSTEM_AUDIT.md`
- Daily notes: `/data/workspace/memory/YYYY-MM-DD.md`
- Feature map: `/data/workspace/CONTROL_UI_COMPLETE_FEATURE_MAP.md`

## Next Steps (When Ready)
1. Read this MEMORY.md first each session
2. Check `/data/workspace/memory/2026-02-12.md` for Phase 1 findings
3. Phase 2: Create backup + Bloomie overrides
4. Phase 3: Test persistence through restart

