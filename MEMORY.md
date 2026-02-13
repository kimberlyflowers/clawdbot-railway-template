# MEMORY.md — Projects & Context

## Backups & Recovery

### Full Workspace Backup (2026-02-13 18:44 UTC)
**Status:** ✅ Complete and stored in Bloomie Deliveries folder

**What's backed up:**
- `/data/workspace/` (164MB source → 60MB compressed)
- `/data/secrets/` (OAuth2 tokens, credentials)

**Backup file:** `Bloomie-Workspace-Backup-2026-02-13.tar.gz`

**Live link (shareable):** https://drive.google.com/file/d/1BXDnX6nUYpqPgZ35hAawktaGvElmpbJ2/view?usp=sharing

**View only:** https://drive.google.com/file/d/1BXDnX6nUYpqPgZ35hAawktaGvElmpbJ2/view

**Recovery instructions (if needed):**
```bash
# Download the tar.gz from Drive
# Then:
cd /
tar -xzf Bloomie-Workspace-Backup-2026-02-13.tar.gz
```

**Why:** In case a future deploy wipes /data/, this archive has everything needed to recover workspace state, git history, and credentials.

---

## Current Projects

### 1. Bloomie Control UI Reskin (Phase 1 Complete)
Status: Awaiting Phase 2

See detailed notes below under "Bloomie Control UI Reskin Project"

### 3. Johnathon's Instance - Bloomie-YES (✅ DEPLOYED, REDEPLOYING WITH LOGO SWAP)
Date: 2026-02-13 20:04 UTC
Status: Ready for manual workspace initialization

**What I built:**
- Complete Bloomie operations agent instance on Railway
- Cloned from same codebase as Jaden (kimberlyflowers/clawdbot-railway-template)
- Fresh workspace with Johnathon's own identity files (IDENTITY.md, SOUL.md)
- Bloomie branding CSS overrides prepared
- Setup guide and recovery packages uploaded to Google Drive

**Instance Details:**
- **Name:** Bloomie-YES
- **URL:** https://clawdbot-production-8b88.up.railway.app
- **Project ID:** c9af8ed1-b3ef-4ba0-93c2-472edb5033f7
- **Service ID:** d40d3b8c-f23a-4050-acff-e9c637537965
- **Gateway Token:** de0e7f6a112a9e95878cec79a327a5dc9971940a2f5624871b1b78eb91bbf7d4
- **Volume:** Persistent /data mounted
- **Status:** Deployed and serving setup page

**Setup Packages (In Bloomie Deliveries folder):**
1. **Johnathon-Workspace-Setup-2026-02-13.tar.gz**
   - IDENTITY.md, SOUL.md, AGENTS.md, USER.md, TOOLS.md, HEARTBEAT.md
   - Link: https://drive.google.com/file/d/1NDIQjN5K73I-akzK4A54y6ds_3TyRnLV/view?usp=sharing

2. **Johnathon-Setup-Guide-2026-02-13.md**
   - Step-by-step initialization instructions
   - Link: https://drive.google.com/file/d/1006ubyUp0P3d08Q0SjPwp/view?usp=sharing

3. **Bloomie-CSS-Overrides-2026-02-13.css**
   - Branding colors (indigo #6366f1, pink #ec4899)
   - Logo/UI customization
   - Link: https://drive.google.com/file/d/1YqdM3Bq6Brfg6bezjVZkk3dmye8fTW3D/view

**What's Ready:**
- ✅ Instance deployed on Railway
- ✅ Persistent volume configured (/data)
- ✅ Environment variables set (OPENCLAW_GATEWAY_TOKEN, NODE_ENV, SETUP_PASSWORD)
- ✅ Service initialization page accessible
- ✅ Workspace files packaged and uploaded
- ✅ Branding assets prepared

**What Needs Manual Action (Kimberly):**
1. Download workspace setup tar.gz from Drive
2. Extract to /data/workspace/ on Johnathon's instance
3. Download CSS overrides and apply to Control UI
4. Restart Gateway to apply branding
5. Verify instance is working with Bloomie branding visible

**Johnathon's Identity:**
- **Role:** Bloomie Operations Agent
- **Primary Project:** Youth Empowerment School
- **Responsibilities:** Operations coordination, project tracking, process execution
- **Skills Available:** bloomie-drive-delivery (others TBD based on config)
- **Task Protocol:** Same as Jaden — gather, confirm, execute, deliver, close

**Latest Deployment (2026-02-13 20:24 UTC):**
- ✅ GitHub push: Bloomie logo swap code committed to main
- ✅ Railway redeploy: Triggered with minimal init script
- ✅ Logo swap: Changes "OpenClaw" → "🌸 Bloomie" (text only, no color/font changes)
- ⏳ Build & deploy: ~5-7 minutes total
- 📍 Instance: https://clawdbot-production-8b88.up.railway.app

**What Johnathon Gets:**
- Fresh OpenClaw setup on first boot
- Workspace files (IDENTITY.md, SOUL.md, AGENTS.md, USER.md, TOOLS.md, HEARTBEAT.md)
- Simple logo swap: "🌸 Bloomie" in header (nothing else changes)
- Ready for work: bloomie-drive-delivery skill available
- Stable & clean: No full theme reskin (saved for Jaden's instance)

---

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

