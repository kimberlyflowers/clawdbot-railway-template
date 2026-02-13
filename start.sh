#!/bin/bash
# Bloomie Railway Startup Script
# Runs Bloomie logo swap, then starts the wrapper server

set -e

echo "🚀 Bloomie Startup"
echo ""

# Step 1: Run Bloomie logo swap (one-time, text only)
if [ -x "$(dirname "$0")/data/init-bloomie-logo.sh" ]; then
    echo "🌸 Applying Bloomie branding..."
    bash "$(dirname "$0")/data/init-bloomie-logo.sh"
    echo ""
fi

# Step 2: Start the wrapper server
echo "🌐 Starting wrapper server..."
exec node src/server.js
