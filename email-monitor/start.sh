#!/bin/bash
cd /data/workspace/email-monitor
nohup node monitor.js >> monitor.log 2>&1 &
echo $! > monitor.pid
echo "Email monitor started (PID: $(cat monitor.pid))"
