# OpenClaw Control UI — Complete Feature Map

## Overview

The Control UI is a Lit-based SPA that manages the entire OpenClaw Gateway. It consists of **13 tabs across 4 groups**, plus a persistent **Screen Panel** (browser control).

---

## TAB GROUPS & ALL FEATURES

### 1. CHAT GROUP
**Tab: Chat**
- Direct gateway session for quick interventions
- Full message streaming
- Tool call visualization
- Message abort controls
- Assistant message injection

---

### 2. CONTROL GROUP (6 tabs)

#### Tab: Overview (Health & Status)
- **Gateway Status**
  - Connected status indicator
  - Uptime (formatted duration)
  - Tick interval (policy)
  - Last refresh time
- **Auth Configuration**
  - Token field (input + display hints)
  - Password field (secure input)
  - Session key display
  - Auth error detection & guidance
- **Connection Diagnostics**
  - Error messages with actionable hints
  - Secure context warnings (HTTPS/Tailscale)
  - Auto-retry button
- **Quick Stats**
  - Connected instances count
  - Active sessions count
  - Cron status (enabled/disabled)
  - Next cron run time

#### Tab: Channels
- **Per-Channel Configuration**
  - Status indicators (connected/failed/pending)
  - QR login flows (WhatsApp, Signal, etc.)
  - Channel-specific settings
  - Health status per channel
- **Supported Channels**
  - WhatsApp, Telegram, Discord, Slack, Signal, iMessage (BlueBubbles)
  - Google Chat, Matrix, Nextcloud Talk, Nostr, and more
- **Channel Management**
  - Enable/disable per channel
  - Account management (multi-account support)
  - Credentials display/update
  - Per-channel queue mode config

#### Tab: Instances (Device Presence)
- **Connected Clients**
  - Device ID, device name
  - Last ping time
  - Scope (operator, node)
  - Online/offline status
- **Connected Nodes**
  - Node ID, capabilities
  - Camera list (front, back)
  - Screen recording capability
  - Canvas hosting
  - Node commands (if any)
- **Real-time Presence**
  - Live updates on connect/disconnect
  - Handshake status
  - Device pairing state

#### Tab: Sessions
- **Active Session List**
  - Session key (unique identifier)
  - Agent ID (which agent owns it)
  - Last activity timestamp
  - Message count
  - Token usage
  - Current model
  - Reset triggers
- **Per-Session Overrides**
  - Thinking level (off/minimal/low/medium/high/xhigh)
  - Verbose mode (off/on/full)
  - Send policy (allow/deny)
  - Model override
- **Session Actions**
  - Reset session
  - Inspect full history
  - View compaction state
  - Adjust per-session defaults

#### Tab: Usage (Metrics & Analytics) ⭐
- **Token Accounting**
  - Total tokens (all time, today, this week, this month)
  - Input tokens vs output tokens
  - Tokens per session
  - Token trends over time
- **Cost Breakdown**
  - Total cost (USD, by model)
  - Cost per session
  - Daily cost chart
  - Cost trends (24h, 7d, 30d)
- **Error Analysis**
  - Error rate by hour (peak error hours)
  - Error count by model
  - Error types
  - Failure rate
- **Activity Heatmaps**
  - Hourly activity (24-hour chart with token totals)
  - Weekday activity (7-day mosaic)
  - Peak usage patterns
  - Low-activity windows
- **Session Drill-Down**
  - Search/filter sessions
  - Per-session metrics
  - Tool usage summary
  - Message counts
  - Duration
- **Export & Reporting**
  - Session data export
  - Cost summary reports
  - Error reports

#### Tab: Cron Jobs
- **Job List**
  - Job ID, name, description
  - Schedule display (cron expression or interval)
  - Next run time
  - Last run time + status
  - Enabled/disabled toggle
- **Job Management**
  - Create new job (at/every/cron schedule)
  - Edit existing job
  - Delete job
  - Enable/disable
  - Force run immediately
- **Run History**
  - Last N runs
  - Execution time
  - Output (systemEvent text or agentTurn result)
  - Error logs
  - Duration
  - Delivered to channel? (Yes/No)
- **Payload Config**
  - systemEvent: text prompt
  - agentTurn: message, model override, thinking level
  - Delivery mode (announce/none)
  - Delivery channel + recipient

---

### 3. AGENT GROUP (3 tabs)

#### Tab: Agents
**Multiple Panels:**

##### Panel: Overview
- **Agent List**
  - Agent ID
  - Agent name (from IDENTITY.md)
  - Emoji/avatar
  - Workspace path
  - Default? (yes/no)
  - Model (primary + fallbacks)
  - Status
- **Agent Selection**
  - Click to view details
  - Load agent files/config

##### Panel: Files (Workspace)
- **Editable Files**
  - AGENTS.md (behavior rules)
  - SOUL.md (identity/personality)
  - USER.md (user context)
  - TOOLS.md (env-specific notes)
  - MEMORY.md (long-term memory - main session only)
  - HEARTBEAT.md (heartbeat checklist)
  - Daily memory logs (memory/YYYY-MM-DD.md)
- **File Editor**
  - In-browser editor
  - Live preview
  - Save/revert changes
  - Syntax highlighting
  - Word count

##### Panel: Tools
- **Tool Groups** (with enable/disable per tool)
  1. **Files**: read, write, edit, apply_patch
  2. **Runtime**: exec, process
  3. **Web**: web_search, web_fetch
  4. **Memory**: memory_search, memory_get
  5. **Sessions**: sessions_list, sessions_history, sessions_send, sessions_spawn, session_status
  6. **UI**: browser, canvas
  7. **Messaging**: message
  8. **Automation**: cron, gateway
  9. **Nodes**: nodes
  10. **Agents**: agents_list
  11. **Media**: image
- **Tool Profiles**
  - minimal (session_status only)
  - coding (files + runtime + sessions + memory + image)
  - messaging (message + sessions)
  - full (no restriction)
- **Tool Overrides**
  - Custom allow list
  - Custom deny list
  - Profile selection

##### Panel: Skills
- **Skill Status Report**
  - Skill name, ID
  - Enabled/disabled toggle
  - Version
  - Config required? (yes/no)
  - Health indicator
- **Per-Skill Config**
  - API keys (sensitive input)
  - Environment variables
  - Custom config JSON
  - Save/revert
- **Skill Management**
  - Enable/disable individual skills
  - Disable all (clear all)
  - Filter/search skills
  - Install new skill (npm/archive/path)

##### Panel: Channels
- **Channel Routing**
  - All active channels
  - Per-channel account settings
  - Routing bindings (which agent handles which channel/account)

##### Panel: Cron
- **Cron Jobs (per-agent view)**
  - Same as global Cron tab
  - Filtered to jobs for this agent

#### Tab: Skills (Global)
- **Global Skill Catalog**
  - All available skills
  - Bundled vs installed
  - Version, description
  - Health status
- **Skill Installation**
  - Search npm registry
  - Direct path/archive
  - Install new skill
  - Auto-enable on install
- **Skill Enable/Disable**
  - Toggle availability
  - Per-skill API key injection
  - Config forms

#### Tab: Nodes
- **Node List**
  - Node ID, name
  - Role (capability host)
  - Connected status
  - Last heartbeat
- **Node Capabilities**
  - Camera (front/back/both)
  - Screen recording
  - Canvas hosting
  - Custom commands
  - GPS location (if available)
- **Node Commands**
  - Invoke custom commands (if exposed)
  - View command output
  - Command timeout/retry

---

### 4. SETTINGS GROUP (3 tabs)

#### Tab: Config
- **Configuration Editor**
  - Edit `~/.openclaw/openclaw.json`
  - Schema-driven form (auto-generated from JSON schema)
  - Raw JSON editor
  - Diff view (before/after)
  - Validate before save
- **Config Sections**
  - **Meta**: Last touched version/timestamp
  - **Env**: Shell environment, static vars
  - **Logging**: Level, file path, console style, redaction
  - **Auth**: Profiles per provider, fallback order, cooldowns
  - **Models**: Provider config, models list, Bedrock discovery
  - **Agents**: Defaults (model, workspace, thinking, verbose), agent list, per-agent overrides
  - **Tools**: Profile, allow/deny, web search, media understanding
  - **Sessions**: Scope, reset policy, identity links, send policy
  - **Channels**: Per-channel config (mode, queue settings, etc.)
  - **Message**: Queue mode, debounce, TTS, reactions
  - **Cron**: Enabled, max concurrent runs
  - **Hooks**: Path, presets, transforms
  - **Browser**: Profiles, CDP port, headless mode
  - **UI**: Theme, colors, assistant name/avatar
  - **Gateway**: Port, bind mode, TLS, HTTP endpoints, auth mode
  - **Sandbox**: Mode, scope, workspace access, Docker options
  - **Discovery**: Wide-area networking, mDNS
  - **Update**: Channel (stable/beta/dev), check on start
- **Config Actions**
  - Save (validates + restarts Gateway)
  - Reload (discard edits)
  - Export
  - Import

#### Tab: Debug (System Snapshots & RPC)
- **Snapshots Section**
  - **Status**: Full gateway status snapshot (JSON)
    - Channels connected
    - Session count
    - Cron state
    - Uptime
    - Security audit summary
  - **Health**: Full health probe (JSON)
    - Channel health (connection status, error rate)
    - Session store health
    - Cron scheduler health
    - Memory backend health
    - Auth profile cooldowns
  - **Heartbeat**: Last heartbeat event (JSON)
    - Timestamp
    - Output/alert text
    - Session key
    - Model used
- **Manual RPC Call**
  - Method selector (autocomplete from gateway methods)
  - Params (JSON editor)
  - Call button
  - Result (JSON viewer)
  - Error display
- **Models Catalog**
  - All available models (from models.list)
  - Provider, model ID, capabilities
  - Pricing (if available)
  - Context window, max tokens
- **Event Log**
  - Real-time gateway events
  - Event types: agent, chat, presence, health, heartbeat, cron, shutdown, etc.
  - Timestamp
  - Event payload (JSON)
  - Latest N events (scroll view)
- **Security Audit**
  - Critical issues (if any)
  - Warning count
  - Info count
  - Summary indicator (danger/warn/success)

#### Tab: Logs
- **Live Log Tail**
  - Real-time streaming logs from gateway
  - Configurable refresh rate
  - Level filtering (all, error, warn, info, debug, trace)
  - Pattern search/filter
  - Clear log button
- **Log Display**
  - Timestamp
  - Log level
  - Component/module
  - Message
  - Stack trace (if applicable)
- **Log Export**
  - Download logs (JSON/text)
  - Filter before export
  - Date range selector

---

## PERSISTENT SCREEN PANEL (Right Side)

Available on **every tab** (except mobile ≤1100px).

### Components
- **Toolbar**
  - Profile dropdown (browser profile selector)
  - Start/Stop browser buttons
  - Status indicator (connecting/connected/stopped)
- **URL Bar**
  - Navigate to URL
  - Enter key to load
  - History (back/forward)
  - Refresh button
- **Viewport**
  - Browser screenshot (auto-refresh every 2s)
  - Click-through passthrough to browser
  - Scroll to view
  - Zoom controls (if supported)
- **Actions**
  - Screenshot (download PNG)
  - Auto-refresh toggle
  - Snapshot (accessibility tree)
  - Refresh now button
- **Accessibility Snapshot** (collapsible bottom)
  - HTML structure (accessibility tree)
  - ARIA roles
  - Focus order
  - Link list
  - Form fields

### Toggle
- Monitor icon in topbar collapses/expands
- State persisted in UiSettings

---

## LAYOUT & STRUCTURE

### Grid System
```
┌─────────────────────────────────────────────────┐
│                    Topbar                       │
├──────────┬──────────────────────┬───────────────┤
│          │                      │               │
│   Nav    │     Content          │ Screen Panel  │
│  220px   │    (flex: 1fr)       │    ~420px     │
│          │                      │               │
│          │   (Tab Component)    │               │
│          │   - Overview         │               │
│          │   - Channels         │               │
│          │   - Sessions         │               │
│          │   - Usage            │               │
│          │   - Agents           │               │
│          │   - Config           │               │
│          │   - etc...           │               │
│          │                      │               │
└──────────┴──────────────────────┴───────────────┘
```

### Modifiers
- `.shell--nav-collapsed` — Nav hidden
- `.shell--screen-collapsed` — Screen panel hidden
- `.shell--chat-focus` — Nav hidden, screen stays
- `.shell--onboarding` — Topbar hidden

### Theme
- Light (default): White bg, gray sidebar, subtle shadows
- Dark (`[data-theme="dark"]`): True dark, clean borders
- Accent: Orange (#EA580C)
- Font: Inter

---

## SUBMENU & SECTION HIERARCHY

### Agents Tab Submenus
1. **Overview** — Agent list, selection, identity
2. **Files** — Edit workspace files (AGENTS.md, SOUL.md, etc.)
3. **Tools** — Tool groups, profiles, overrides
4. **Skills** — Per-agent skill status & config
5. **Channels** — Routing config
6. **Cron** — Per-agent cron jobs

### Debug Tab Sections
1. **Snapshots** — Status, Health, Heartbeat
2. **Manual RPC** — Call gateway methods
3. **Models** — Model catalog
4. **Event Log** — Real-time events

### Cron Tab Sections
1. **Job List** — All jobs with schedule/next run
2. **Run History** — Per-job execution log
3. **Create/Edit** — Job payload and schedule config

### Usage Tab Sections
1. **Token Accounting** — Total, by model, trends
2. **Cost Breakdown** — USD, per session, daily chart
3. **Error Analysis** — Error rate by hour, by model
4. **Activity Heatmaps** — 24h hourly, 7d weekday
5. **Session Drill-Down** — Search, filter, per-session metrics
6. **Export & Reporting** — Download data

---

## KEY INTEGRATIONS

### Persistent Memory
- **MEMORY.md** — Curated long-term memory (viewable/editable in Agents > Files)
- **memory/YYYY-MM-DD.md** — Daily logs (viewable in Agents > Files)
- **Memory Search** — Available as tool (memory_search, memory_get)

### Health Monitoring
- **Overview Tab** — Quick health read, gateway status
- **Debug > Snapshots** — Full health probe (channel health, session store, cron, auth profiles)
- **Debug > Status** — Security audit summary

### Real-Time Features
- **Instances Tab** — Live device/client presence
- **Debug > Event Log** — Real-time gateway events
- **Logs Tab** — Streaming log tail
- **Screen Panel** — Auto-refreshing browser screenshot

---

## SUMMARY

**Total Tabs: 13**
- 1 Chat
- 6 Control (Overview, Channels, Instances, Sessions, Usage, Cron)
- 3 Agent (Agents, Skills, Nodes)
- 3 Settings (Config, Debug, Logs)

**Persistent: Screen Panel** (browser control)

**Key Features to Preserve:**
✅ All 13 tabs + submenus
✅ Persistent memory (MEMORY.md, daily logs)
✅ Health snapshots & diagnostics
✅ Usage analytics & cost tracking
✅ Real-time event log
✅ Config editor (schema-driven)
✅ Screen panel (browser control)
✅ Theme system (light/dark)
✅ Session management & per-session overrides
✅ Multi-agent support
✅ Tool groups & profiles
✅ Skill status & configuration

---

This is the COMPLETE picture. **Every section, submenu, feature** is listed. Now you have the full reskin checklist.
