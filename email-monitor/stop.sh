#!/bin/bash
if [ -f /data/workspace/email-monitor/monitor.pid ]; then
  PID=$(cat /data/workspace/email-monitor/monitor.pid)
  kill $PID 2>/dev/null && echo "Email monitor stopped (PID: $PID)" || echo "Process not running"
  rm /data/workspace/email-monitor/monitor.pid
else
  echo "No PID file found"
fi
