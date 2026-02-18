# bloomie-ghl-browser — Setup & Credentials

**Current Status:** Framework complete. Ready for implementation testing.

---

## Prerequisites

### System Requirements
- Node.js v16+ 
- Playwright (installed via `npm install`)
- ~2GB disk space for browser binaries
- Display/headless browser capability

### GHL Requirements
- Active GoHighLevel account (Business or higher)
- Direct login access (not SSO/OAuth)
- Ability to enter credentials programmatically
- 2FA setup (if enabled on account)

---

## Credentials Required for Testing

### 1. **GHL Email Address**
- Type: String
- Format: Valid email address
- Environment Variable: `GHL_EMAIL`
- Example: `your-email@example.com`
- Security: Store in `.env`, never in code

### 2. **GHL Password**
- Type: String
- Format: Your GHL account password
- Environment Variable: `GHL_PASSWORD`
- Security: Store in `.env`, never in code or logs
- ⚠️ WARNING: Never share this password

### 3. **2FA Setup Information**
- Type: Depends on configuration
- Environment Variable: `GHL_2FA_ENABLED` (true/false)
- If enabled, also provide:
  - **2FA Method:** `GHL_2FA_METHOD` = `'sms'` or `'email'`
  - **Phone number** (if SMS): For SMS code delivery
  - **Backup codes** (if available): For automated 2FA handling

### 4. **GHL Account Tier**
- Required: Business plan or higher
- Reason: Funnel page builder requires business features
- Check: Settings → Billing → Current Plan

---

## Environment Setup

### Create `.env` File (Local Testing)

```bash
# .env (do NOT commit this file)
GHL_EMAIL=your-email@example.com
GHL_PASSWORD=your-password-here
GHL_2FA_ENABLED=true
GHL_2FA_METHOD=sms
PLAYWRIGHT_HEADLESS=false
GHL_BROWSER_DEBUG=true
```

### Load Environment Variables

```bash
# Option 1: Manual export
export GHL_EMAIL="your-email@example.com"
export GHL_PASSWORD="your-password"

# Option 2: Use .env file (if you have dotenv installed)
require('dotenv').config();

# Option 3: Docker/Systemd service (production)
# Set in service environment or docker-compose.yml
```

### Railway Deployment (Johnathon's Instance)

To add credentials on Railway:

1. Go to Railway dashboard → Project → Variables
2. Add:
   - Key: `GHL_EMAIL` → Value: `your-email@example.com`
   - Key: `GHL_PASSWORD` → Value: `your-password`
   - Key: `GHL_2FA_ENABLED` → Value: `true` (if applicable)
   - Key: `GHL_2FA_METHOD` → Value: `sms` or `email`
3. Click "Deploy" to apply changes

⚠️ **Note:** Passwords in environment variables are visible to admins. Use a dedicated service account if possible.

---

## Testing Checklist

Before running integration tests:

- [ ] GHL account active and accessible
- [ ] Can log in manually at https://app.gohighlevel.com
- [ ] Account has at least 1 funnel (for page automation testing)
- [ ] 2FA method chosen (SMS or email)
- [ ] Credentials stored securely (`.env` or Railway variables)
- [ ] Playwright installed: `npm install playwright`
- [ ] Node.js version check: `node --version` (should be v16+)

---

## Credentials Not Needed For

The following CAN be tested WITHOUT credentials:

✅ Framework validation: `npm test`  
✅ Configuration loading  
✅ Error handling  
✅ Navigation structure (URLs, selectors)  
✅ Logger functionality  

---

## Browser Selection

Default: Chromium (fastest, most stable)

To use different browser:
```bash
export PLAYWRIGHT_BROWSER=firefox
# or
export PLAYWRIGHT_BROWSER=webkit
```

---

## Debugging & Logging

### Enable Debug Logging
```bash
export GHL_BROWSER_DEBUG=true
export GHL_LOG_LEVEL=debug
```

### View Logs
```bash
tail -f /tmp/ghl-browser.log
```

### Take Screenshots During Testing
```javascript
await browser.navigator.screenshot('debug-screenshot.png');
```

---

## Security Best Practices

⚠️ **CRITICAL:**

1. **Never commit `.env` file** — add to `.gitignore`
2. **Never log credentials** — even in debug mode
3. **Use service account if possible** — not your personal account
4. **Rotate passwords** — change after testing
5. **Delete environment variables** — after testing complete
6. **Clean logs** — logs may contain partial auth attempts

---

## Troubleshooting

### "Invalid credentials" error
- Verify email and password are correct
- Check for extra spaces in credentials
- Verify caps lock is not on
- Try logging in manually first

### "2FA required" error
- Set `GHL_2FA_ENABLED=true` in environment
- Provide SMS or email method
- Ensure device can receive codes

### Timeout errors
- Increase `PLAYWRIGHT_TIMEOUT` (default: 30000ms)
- Check internet connection
- Try with `PLAYWRIGHT_HEADLESS=false` to watch execution

### "Browser launch failed" error
- Ensure Playwright is installed: `npm install playwright`
- Check disk space for browser binaries (~1GB)
- Try: `npx playwright install chromium`

---

## What Kimberly Needs to Provide

For testing the framework:

1. **GHL Account Login**: `your-email@example.com` + password
2. **Account Tier Confirmation**: "I have Business plan or higher"
3. **2FA Setup**: "I use SMS" or "I use email" or "2FA disabled"
4. **Test Funnel**: "Use this funnel: [ID]" or "Pick any funnel"

---

## Implementation Roadmap

### Phase 1: Credential Testing
- Test login with provided credentials
- Verify session persistence
- Handle 2FA flow

### Phase 2: Navigation Testing
- Navigate to dashboard
- Navigate to funnels
- Navigate to page editor

### Phase 3: Page Automation
- Add text elements
- Edit element properties
- Delete elements
- Save page
- Publish page

### Phase 4: Error Recovery
- Test connection timeouts
- Test invalid credentials
- Test session expiration

---

**Framework Status:** Ready for Phase 1 testing  
**Credentials Status:** Awaiting from Kimberly  
**Next Action:** Provide credentials → Begin Phase 1 testing

