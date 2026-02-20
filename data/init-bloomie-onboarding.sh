#!/bin/bash
# Bloomie Onboarding Automation (Full First-Boot Setup)
# Creates: directories, config, workspace files, logo swap
# Result: Agent boots straight to dashboard, no setup wizard

set -e

STATE_DIR="/data/.clawdbot"
WORKSPACE_DIR="/data/workspace"
CONFIG_FILE="$STATE_DIR/openclaw.json"
INIT_LOCK="$STATE_DIR/.bloomie-initialized"

echo "[INIT] Bloomie Onboarding Automation Starting"
echo "[INIT] STATE_DIR=$STATE_DIR"
echo "[INIT] CONFIG_FILE=$CONFIG_FILE"
echo "[INIT] INIT_LOCK=$INIT_LOCK"

# Temporarily bypass lock to fix config
# if [ -f "$INIT_LOCK" ]; then
#     echo "[INIT] Init lock exists at $INIT_LOCK. Skipping initialization."
#     exit 0
# fi
echo "[INIT] Lock check bypassed - regenerating config to fix validation errors"

echo "[INIT] No lock found. Proceeding with initialization."
echo "🌸 Bloomie Onboarding Automation"
echo ""

# Create directories
mkdir -p "$STATE_DIR" "$WORKSPACE_DIR" "$STATE_DIR/canvas"
mkdir -p "$WORKSPACE_DIR/memory" "$WORKSPACE_DIR/skills/marketing" "$WORKSPACE_DIR/skills/ops"
chmod 755 "$STATE_DIR" "$WORKSPACE_DIR"

# Create openclaw.json config
GATEWAY_TOKEN="${OPENCLAW_GATEWAY_TOKEN:-$(openssl rand -hex 32)}"

cat > "$CONFIG_FILE" << 'EOF'
{
  "meta": {
    "lastTouchedVersion": "2026.2.10",
    "lastTouchedAt": "2026-02-13T20:35:00Z",
    "bloomieInitialized": true
  },
  "wizard": {
    "lastRunAt": "2026-02-13T20:35:00Z",
    "lastRunVersion": "2026.2.10",
    "lastRunCommand": "bloomie-onboarding",
    "lastRunMode": "automated"
  },
  "browser": {
    "executablePath": "/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome",
    "headless": true,
    "noSandbox": true,
    "defaultProfile": "openclaw"
  },
  "auth": {
    "profiles": {
      "anthropic:default": {
        "provider": "anthropic",
        "mode": "token"
      }
    },
    "order": {
      "anthropic": [
        "anthropic:default"
      ]
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-haiku-4-5"
      },
      "workspace": "/data/workspace",
      "compaction": {
        "mode": "default"
      },
      "maxConcurrent": 4,
      "subagents": {
        "maxConcurrent": 8,
        "model": "anthropic/claude-haiku-4-5"
      }
    }
  },
  "messages": {
    "ackReactionScope": "group-mentions"
  },
  "commands": {
    "native": "auto",
    "nativeSkills": "auto"
  },
  "gateway": {
    "port": 18789,
    "mode": "local",
    "bind": "loopback",
    "controlUi": {
      "enabled": true,
      "allowInsecureAuth": true
    },
    "auth": {
      "mode": "token",
      "token": "$GATEWAY_TOKEN"
    },
    "tailscale": {
      "mode": "off",
      "resetOnExit": false
    },
    "remote": {
      "token": "$GATEWAY_TOKEN"
    }
  },
  "canvasHost": {
    "enabled": true,
    "port": 18793,
    "root": "/data/.clawdbot/canvas",
    "liveReload": true
  },
  "skills": {
    "install": {
      "nodeManager": "npm"
    }
  }
}
EOF

chmod 600 "$CONFIG_FILE"

# Create workspace files
cat > "$WORKSPACE_DIR/IDENTITY.md" << 'ID'
# IDENTITY.md

- **Name:** Bloomie Operations Agent
- **Creature:** AI employee
- **Vibe:** Professional, methodical, execution-oriented
- **Emoji:** 📋
ID

cat > "$WORKSPACE_DIR/SOUL.md" << 'SOUL'
# SOUL.md - Purpose

_You're a Bloomie operations agent. Execute systematically._

## TASK PROTOCOL
1. Acknowledge + Gather
2. Confirm + Permission
3. Execute
4. Deliver + Next Step
5. Close

## Bloomie Skills
- **bloomie-drive-delivery** — Upload to Google Drive
SOUL

cat > "$WORKSPACE_DIR/AGENTS.md" << 'AGT'
# AGENTS.md - Workspace Rules

Read IDENTITY.md, SOUL.md, and memory files first.
AGT

cat > "$WORKSPACE_DIR/USER.md" << 'USR'
# USER.md

- **Name:** Kimberly
- **Role:** You're her operations agent
USR

cat > "$WORKSPACE_DIR/TOOLS.md" << 'TLS'
# TOOLS.md

Available Bloomie skills and environment-specific notes.
TLS

cat > "$WORKSPACE_DIR/HEARTBEAT.md" << 'HB'
# HEARTBEAT.md

Periodic task checks (empty for skip).
HB

# Initialize git
cd "$WORKSPACE_DIR"
git init >/dev/null 2>&1 || true
git config user.email "bloomie@agent.local" >/dev/null 2>&1 || true
git config user.name "Bloomie Agent" >/dev/null 2>&1 || true
git add -A >/dev/null 2>&1 || true
git commit -m "Initial Bloomie agent setup" >/dev/null 2>&1 || true

# Apply logo swap
mkdir -p /openclaw/dist/control-ui/styles
cat > /openclaw/dist/control-ui/styles/bloomie-logo.css << 'CSS'
.app-header h1::before {
  content: "🌸 Bloomie";
  display: block;
}
.app-header h1 {
  font-size: 0;
}
.app-header h1::before {
  font-size: 1.875rem;
}
CSS

if [ -f "/openclaw/dist/control-ui/styles.css" ]; then
    cat /openclaw/dist/control-ui/styles/bloomie-logo.css >> /openclaw/dist/control-ui/styles.css 2>/dev/null || true
fi

# Mark complete
touch "$INIT_LOCK"

echo "✅ Bloomie agent ready - boots straight to dashboard"
exit 0
