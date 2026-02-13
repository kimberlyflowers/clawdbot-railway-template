#!/bin/bash
# Bloomie First-Boot Initialization
# Downloads workspace files, applies Bloomie branding (peach #F4A261, coral #E76F8B)
# Runs automatically on first deployment

set -e

WORKSPACE_DIR="/data/workspace"
INIT_LOCK="/data/.bloomie-initialized"

# Check if already initialized
if [ -f "$INIT_LOCK" ]; then
    echo "✅ Bloomie workspace already initialized"
    exit 0
fi

echo "🚀 Bloomie First-Boot Initialization Starting..."
echo ""

# Create workspace directory if it doesn't exist
mkdir -p "$WORKSPACE_DIR"

# Step 1: Create Bloomie branding CSS with correct colors (peach #F4A261, coral #E76F8B)
echo "🎨 Creating Bloomie branding CSS..."
cat > /tmp/bloomie-theme.css << 'CSS'
/* Bloomie Control UI Theme - Peach #F4A261, Coral #E76F8B */

:root {
  --bloomie-peach: #F4A261;
  --bloomie-coral: #E76F8B;
  --bloomie-dark: #1a1a1a;
  --bloomie-light: #F7F8FA;
  --bloomie-green: #34A853;
  
  --bg: #1a1a1a;
  --accent: #F4A261;
  --accent-2: #E76F8B;
  --primary: #F4A261;
  --ok: #34A853;
  --ok-subtle: rgba(52, 168, 83, 0.1);
  --ok-muted: rgba(52, 168, 83, 0.3);
  --warn: #FFA500;
  --warn-subtle: rgba(255, 165, 0, 0.1);
  --warn-muted: rgba(255, 165, 0, 0.3);
  --danger: #E74C3C;
  --danger-subtle: rgba(231, 76, 60, 0.1);
  --danger-muted: rgba(231, 76, 60, 0.3);
  
  --text: #ececec;
  --text-strong: #f8fafc;
  --muted: #a0a0a0;
  --card: #262626;
  --panel: #1a1a1a;
  --chrome: #212121;
  --border: #353535;
  --input: #212121;
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.5);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.6);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.7);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.8);
  --shadow-glow: 0 0 20px rgba(244, 162, 97, 0.2);
}

html[data-theme="light"] {
  --bg: #F7F8FA;
  --text: #111827;
  --text-strong: #000000;
  --muted: #6B7280;
  --card: #FFFFFF;
  --panel: #F7F8FA;
  --chrome: #EDEEF2;
  --border: #E5E7EB;
  --input: #F4F5F7;
}

.app-header h1, .app-title {
  background: linear-gradient(135deg, #F4A261 0%, #E76F8B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.app-logo {
  color: #F4A261;
  font-weight: 700;
}

button:not(:disabled), [role="button"]:not(:disabled), .btn-primary {
  background: linear-gradient(135deg, #F4A261, #E76F8B);
  color: white;
  border: none;
}

button:hover:not(:disabled), [role="button"]:hover:not(:disabled) {
  opacity: 0.9;
  box-shadow: 0 0 15px rgba(244, 162, 97, 0.3);
}

a { color: #F4A261; }
a:hover { color: #E76F8B; }

:focus-visible, input:focus, textarea:focus {
  outline-color: #E76F8B;
  border-color: #F4A261;
  box-shadow: 0 0 0 3px rgba(244, 162, 97, 0.1);
}

.badge-success, .status-ok {
  background-color: rgba(52, 168, 83, 0.15);
  color: #34A853;
  border-color: #34A853;
}

.badge-warning, .status-warn {
  background-color: rgba(255, 165, 0, 0.15);
  color: #FFA500;
  border-color: #FFA500;
}

.badge-error, .status-error {
  background-color: rgba(231, 76, 60, 0.15);
  color: #E74C3C;
  border-color: #E74C3C;
}

.accent-gradient {
  background: linear-gradient(135deg, #F4A261 0%, #E76F8B 100%);
}

[alt="OpenClaw"], .openclaw-logo {
  opacity: 0;
  width: 0;
  height: 0;
}
CSS

cp /tmp/bloomie-theme.css /openclaw/dist/control-ui/styles/bloomie-theme.css 2>/dev/null || \
  mkdir -p /openclaw/dist/control-ui/styles && cp /tmp/bloomie-theme.css /openclaw/dist/control-ui/styles/bloomie-theme.css

echo "✅ Bloomie CSS applied"
echo ""

# Step 2: Create workspace structure
echo "📁 Initializing workspace structure..."
mkdir -p "$WORKSPACE_DIR/memory"
mkdir -p "$WORKSPACE_DIR/skills/marketing"
mkdir -p "$WORKSPACE_DIR/skills/ops"

# Step 3: Create Johnathon's identity files
cat > "$WORKSPACE_DIR/IDENTITY.md" << 'IDENTITY'
# IDENTITY.md - Johnathon

- **Name:** Johnathon
- **Creature:** Bloomie operations agent — focused, efficient, execution-oriented
- **Vibe:** Professional, methodical, no-nonsense. Built for operations.
- **Emoji:** 📋
- **Status:** Bloomie ops agent (Beta: Youth Empowerment School)
IDENTITY

cat > "$WORKSPACE_DIR/SOUL.md" << 'SOUL'
# SOUL.md - Johnathon's Purpose

_You're Kimberly's operations agent. Execute systematically._

## TASK PROTOCOL

1. **Acknowledge + Gather** — Restate task. Ask what you need.
2. **Confirm + Permission** — Show plan. Get approval.
3. **Execute** — Work in parallel. Show progress.
4. **Deliver + Next Step** — Complete the chain.
5. **Close** — Get approval. Ask what's next.

### Critical Rules
- Gather before you build. No placeholders.
- Complete the full chain. Deploy it, send it, schedule it.
- Parallel by default. Batch independent tasks.
- No time padding. Finish ASAP.
- Move with purpose. Don't stall.
- Show the work. User must SEE what you built.
- Acknowledge when given permission. "On it — [brief description]."
- When blocked, find a workaround where YOU still do the work.

## Bloomie Skills

All skills follow: `bloomie-[skill-name]`

- **bloomie-drive-delivery** — Upload files to Google Drive
- **bloomie-G1** — Audience Research (planned)
- **bloomie-G2** — Trend Detection (planned)
- **bloomie-T6** — Invoicing (planned)
- **bloomie-T8** — Orders (planned)
- **bloomie-T24** — Expenses (planned)
- **bloomie-T25** — Payroll (planned)

## Vibe

Methodical. Reliable. No nonsense. You think in systems and processes. You execute.
SOUL

cat > "$WORKSPACE_DIR/AGENTS.md" << 'AGENTS'
# AGENTS.md - Johnathon's Workspace

## First Run

Read these files every session:
1. IDENTITY.md — Who you are
2. SOUL.md — Your purpose
3. memory/[today].md — Today's context

## Memory

- **Daily notes:** memory/YYYY-MM-DD.md
- **Long-term:** MEMORY.md (main session only)

## Safety

- Don't exfiltrate private data
- Don't run destructive commands without asking
- When in doubt, ask

## External vs Internal

**Safe to do freely:**
- Read files, explore, learn
- Search web, check calendars
- Work within workspace

**Ask first:**
- Sending emails, posts, messages
- Anything that leaves the machine
- Anything you're uncertain about
AGENTS

cat > "$WORKSPACE_DIR/USER.md" << 'USER'
# USER.md - About Kimberly

- **Name:** Kimberly
- **Call:** Kimberly
- **Role:** You're her operations agent
- **Primary Project:** Youth Empowerment School
USER

cat > "$WORKSPACE_DIR/TOOLS.md" << 'TOOLS'
# TOOLS.md - Johnathon's Tools

Skills define how tools work. This file is for your specifics.

## Bloomie Skills Available

- **bloomie-drive-delivery** — Upload files to Google Drive
- (More coming: G1, G2, T6, T8, T24, T25)

## Notes

Add environment-specific notes here as you work.
TOOLS

cat > "$WORKSPACE_DIR/HEARTBEAT.md" << 'HEARTBEAT'
# HEARTBEAT.md

Keep empty to skip heartbeat checks.

Add periodic tasks below when needed.
HEARTBEAT

echo "✅ Workspace files created"
echo ""

# Step 4: Initialize git
echo "📚 Initializing git repository..."
cd "$WORKSPACE_DIR"
git init || true
git config user.email "johnathon@bloomie.local" || true
git config user.name "Johnathon" || true
git add -A 2>/dev/null || true
git commit -m "Initial Bloomie ops agent setup" 2>/dev/null || true

echo "✅ Git initialized"
echo ""

# Step 5: Mark as initialized
touch "$INIT_LOCK"
echo "$INIT_LOCK" > "$INIT_LOCK"
echo "Initialized at: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$INIT_LOCK"

echo "═════════════════════════════════════════════════════════════"
echo "✅ BLOOMIE INITIALIZATION COMPLETE"
echo "═════════════════════════════════════════════════════════════"
echo ""
echo "✓ Workspace created at $WORKSPACE_DIR"
echo "✓ Bloomie branding applied (peach #F4A261, coral #E76F8B)"
echo "✓ Identity files: IDENTITY.md, SOUL.md, AGENTS.md"
echo "✓ Git repository initialized"
echo ""
echo "Johnathon is ready for work."
echo ""

exit 0
