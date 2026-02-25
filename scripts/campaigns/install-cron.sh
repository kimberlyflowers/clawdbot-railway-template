#!/bin/bash

# Install cron jobs for dual campaign operations

# ADVISOR CAMPAIGN CRON JOBS
# Daily 12 PM UTC - Send advisor campaign email
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/node /data/workspace/scripts/campaigns/advisor-email-send.js >> /data/workspace/campaigns/.advisor-cron.log 2>&1") | crontab -

# EDUCATOR CAMPAIGN CRON JOBS
# Daily 12 PM UTC - Send educator campaign email
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/node /data/workspace/scripts/campaigns/educator-email-send.js >> /data/workspace/campaigns/.educator-cron.log 2>&1") | crontab -

echo "✅ Cron jobs installed:"
echo "  - Advisor emails: Daily @ 12 PM UTC"
echo "  - Educator emails: Daily @ 12 PM UTC"
echo ""
echo "To view installed crons:"
echo "  crontab -l"
