#!/bin/bash
# Bloomie Railway Startup Script
# Runs onboarding automation, then starts the wrapper server

set -e

echo "🚀 Bloomie Agent Startup (start.sh)"
echo ""

# Step 1: Run Bloomie onboarding automation (one-time)
INIT_SCRIPT="$(dirname "$0")/data/init-bloomie-onboarding.sh"
echo "[DEBUG] Checking for init script: $INIT_SCRIPT"
if [ -f "$INIT_SCRIPT" ]; then
    echo "[DEBUG] File exists"
else
    echo "[DEBUG] File does NOT exist"
fi

if [ -x "$INIT_SCRIPT" ]; then
    echo "🌸 Running onboarding automation..."
    bash "$INIT_SCRIPT"
    echo ""
else
    echo "[DEBUG] Script is not executable or doesn't exist. Skipping init."
fi

# Step 2: Fix OpenClaw config (remove invalid allowAny keys)
echo "🔧 Cleaning up OpenClaw configuration..."
find /data -name "openclaw.json" 2>/dev/null && echo "Found config"
node -e "
console.log('[CONFIG-FIX] Starting config cleanup...');
const fs = require('fs');
const p = '/data/.clawdbot/openclaw.json';
console.log('[CONFIG-FIX] Checking for config at: ' + p);
if (fs.existsSync(p)) {
  console.log('[CONFIG-FIX] Config file exists, reading...');
  const c = JSON.parse(fs.readFileSync(p));
  if (c.agents && c.agents.list) {
    console.log('[CONFIG-FIX] Found ' + c.agents.list.length + ' agents in config');
    let removed = 0;
    c.agents.list.forEach(a => {
      if (a.allowAny) {
        console.log('[CONFIG-FIX] Removing allowAny from agent');
        delete a.allowAny;
        removed++;
      }
    });
    console.log('[CONFIG-FIX] Removed ' + removed + ' allowAny keys');
    fs.writeFileSync(p, JSON.stringify(c, null, 2));
    console.log('[CONFIG-FIX] Config cleanup completed');
  } else {
    console.log('[CONFIG-FIX] No agents.list found in config');
  }
} else {
  console.log('[CONFIG-FIX] Config file does not exist yet');
}
"

# Step 3: Start the wrapper server (agent boots straight to dashboard)
echo "🌐 Starting Bloomie wrapper server..."
exec node src/server.js
