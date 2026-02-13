#!/bin/bash
# Bloomie Railway Startup Script
# Runs onboarding automation, then starts the wrapper server

set -e

echo "🚀 Bloomie Agent Startup"
echo ""

# Step 1: Run Bloomie onboarding automation (one-time)
# This creates everything needed: config, workspace, branding, no wizard
if [ -x "$(dirname "$0")/data/init-bloomie-onboarding.sh" ]; then
    echo "🌸 Running onboarding automation..."
    bash "$(dirname "$0")/data/init-bloomie-onboarding.sh"
    echo ""
fi

# Step 2: Start the wrapper server (agent boots straight to dashboard)
echo "🌐 Starting Bloomie wrapper server..."
exec node src/server.js
