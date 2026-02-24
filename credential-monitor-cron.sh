#!/bin/bash
# Credential Health Monitor - Daily Cron Job
# Runs at 09:00 UTC every day

MONITOR_SCRIPT="/data/workspace/credential-health-monitor.js"
LOG_FILE="/data/workspace/credentials-health/cron.log"

mkdir -p $(dirname "$LOG_FILE")

echo "[$(date -u +'%Y-%m-%d %H:%M:%S UTC')] Running credential health check..." >> "$LOG_FILE"

node "$MONITOR_SCRIPT" >> "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
  echo "[$(date -u +'%Y-%m-%d %H:%M:%S UTC')] ✓ Check completed successfully" >> "$LOG_FILE"
else
  echo "[$(date -u +'%Y-%m-%d %H:%M:%S UTC')] ✗ Check failed with errors" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
