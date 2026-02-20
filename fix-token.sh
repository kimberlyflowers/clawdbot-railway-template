#!/bin/bash
# Force gateway token rotation and sync

echo "🔧 Forcing OpenClaw token rotation..."

# Remove any existing config to force clean state
rm -f /data/.clawdbot/openclaw.json
rm -f /data/.clawdbot/gateway.token

# Generate fresh token and set config
FRESH_TOKEN=$(openssl rand -hex 32)
echo "Generated fresh token: $FRESH_TOKEN"

# Ensure environment variable is set
export OPENCLAW_GATEWAY_TOKEN="$FRESH_TOKEN"

# Start with clean config
mkdir -p /data/.clawdbot
openclaw config set gateway.auth.mode token
openclaw config set gateway.auth.token "$FRESH_TOKEN"

echo "✅ Token rotation complete: $FRESH_TOKEN"