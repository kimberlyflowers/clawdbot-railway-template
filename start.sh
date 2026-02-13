#!/bin/bash
# Bloomie Railway Startup Script
# Runs Bloomie initialization, then starts the wrapper server

set -e

echo "🚀 Bloomie Startup Sequence"
echo ""

# Step 1: Run Bloomie workspace initialization (one-time)
if [ -x "$(dirname "$0")/data/init-workspace.sh" ]; then
    echo "📝 Running Bloomie initialization..."
    bash "$(dirname "$0")/data/init-workspace.sh"
    echo ""
fi

# Step 2: Start the wrapper server
echo "🌐 Starting Bloomie wrapper server..."
exec node src/server.js
