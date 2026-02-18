#!/bin/bash

# Start BLOOM Desktop Bridge Server in background
echo "🌸 Starting BLOOM Desktop Bridge Server..."
DESKTOP_BRIDGE_PORT=${DESKTOP_BRIDGE_PORT:-18790} node desktop-bridge-server.js &
BRIDGE_PID=$!
echo "Bridge server started (PID: $BRIDGE_PID)"

# Wait for bridge to start
sleep 2

# Start main OpenClaw gateway
echo "🦞 Starting OpenClaw Gateway..."
exec node server.js
