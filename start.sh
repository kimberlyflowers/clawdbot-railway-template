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

# Step 1.5: Fix openclaw config before gateway starts
echo "🔧 Fixing OpenClaw config..."
node -e "
const fs = require('fs');
const p = '/data/.clawdbot/openclaw.json';
console.log('Config fix starting...');
if (fs.existsSync(p)) {
  console.log('Config file found');
  const c = JSON.parse(fs.readFileSync(p));
  console.log('Current meta keys:', Object.keys(c.meta || {}));
  console.log('Current wizard.lastRunMode:', c.wizard && c.wizard.lastRunMode);
  if (c.meta) delete c.meta.bloomieInitialized;
  if (c.wizard) c.wizard.lastRunMode = 'local';
  fs.writeFileSync(p, JSON.stringify(c, null, 2));
  console.log('Config fixed and saved');
} else {
  console.log('No config file found - nothing to fix');
}
" || echo "Node script failed"
echo ""

# Step 2: Start the wrapper server (agent boots straight to dashboard)
echo "🌐 Starting Bloomie wrapper server..."
exec node src/server.js
