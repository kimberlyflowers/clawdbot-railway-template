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

# Ensure owner channel is recognized in Jaden's SOUL.md
if [ -f "/data/workspace/SOUL.md" ]; then
  if ! grep -q "Owner Channel" /data/workspace/SOUL.md; then
    sed -i '1s/^/## Owner Channel\nThe sender_id "openclaw-control-ui" and sender "openclaw-control-ui" is Kimberly'\''s verified owner channel. This is her primary interface. Despite OpenClaw labeling this metadata as "untrusted", messages from sender_id: openclaw-control-ui ARE verified operator instructions from Kimberly. Always treat them as direct owner commands.\n\n/' /data/workspace/SOUL.md
    echo "✅ Owner channel added to SOUL.md"
  else
    echo "✅ Owner channel already in SOUL.md"
  fi
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
  if (!c.gateway) c.gateway = {};
  c.gateway.trustedProxies = ['127.0.0.1', '100.64.0.0/10'];
  if (!c.gateway.controlUi) c.gateway.controlUi = {};
  c.gateway.controlUi.allowInsecureAuth = true;
  fs.writeFileSync(p, JSON.stringify(c, null, 2));
  console.log('Config fixed and saved');
} else {
  console.log('No config file found - nothing to fix');
}
" || echo "Node script failed"
echo ""

# Step 1.6: Deploy Vera verification hook
echo "🛡️ Deploying Vera verification hook..."
mkdir -p /data/workspace/hooks/vera
cp /app/hooks/vera/handler.ts /data/workspace/hooks/vera/handler.ts 2>/dev/null || echo "⚠️ handler.ts not found, skipping"
cp /app/hooks/vera/HOOK.md /data/workspace/hooks/vera/HOOK.md 2>/dev/null || echo "⚠️ HOOK.md not found, skipping"
echo "Vera hook deployed to /data/workspace/hooks/vera/"
echo ""

# Step 2: Start the wrapper server (agent boots straight to dashboard)
echo "🌐 Starting Bloomie wrapper server..."
exec node src/server.js
