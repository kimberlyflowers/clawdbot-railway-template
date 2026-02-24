# Email Monitor

Monitors Gmail and Yahoo inboxes for important emails and sends SMS alerts via GHL.

## Setup

**Credentials stored in:** `/data/secrets/`
- `gmail-app-password.txt` - Gmail app password
- `yahoo-app-password.txt` - Yahoo app password  
- `ghl-token.txt` - GHL API token

**Configuration:** `config.json`
- Gmail: thevisualbrandingexpert@gmail.com
- Yahoo: flwrs_kmbrly@yahoo.com
- Watch senders: cflowers@sabwb.org, cflowers@faith-outreach.org, ntergrityusa@aol.com
- Alert phone: 210-294-9625
- Check interval: 5 minutes

## Usage

**Start monitor:**
```bash
./start.sh
```

**Stop monitor:**
```bash
./stop.sh
```

**Check logs:**
```bash
tail -f monitor.log
```

**Check status:**
```bash
ps aux | grep "node monitor.js"
cat monitor.pid
```

## Pending Emails

When an important email arrives:
1. Monitor fetches it and drafts a response
2. Sends SMS alert to 210-294-9625
3. Stores email in `pending-emails.json` awaiting approval
4. You reply to SMS with APPROVE or REJECT

**View pending emails:**
```bash
cat pending-emails.json | jq
```

**Processed emails (history):**
```bash
cat processed-emails.json | head -20
```

## How It Works

1. **IMAP Connection** - Connects to Gmail and Yahoo every 5 minutes
2. **Search Recent** - Looks for RECENT + UNSEEN emails (limits to last 50)
3. **Filter** - Checks if sender matches watchlist
4. **Alert** - If match found, sends SMS with subject + draft response
5. **Store** - Saves to pending-emails.json for approval
6. **Send** - After you approve via SMS, sends response

## Files

- `monitor.js` - Main script
- `config.json` - Configuration
- `package.json` - Node dependencies
- `pending-emails.json` - Awaiting approval
- `processed-emails.json` - History (do not edit)
- `start.sh` / `stop.sh` - Control scripts
- `monitor.log` - Runtime logs
- `monitor.pid` - Process ID file
