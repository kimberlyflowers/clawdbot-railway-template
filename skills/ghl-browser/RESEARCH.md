# GHL Browser Automation Research

**Date:** 2026-02-16  
**Topic:** Playwright automation for GoHighLevel login, funnel navigation, and page builder control  
**Status:** Research phase — ready for implementation planning

---

## Overview

GoHighLevel's funnel and page builder are only accessible via web UI. No REST API exists for these operations. Browser automation is required for:

- Logging into GHL account
- Creating/editing funnels
- Creating/editing funnel pages
- Managing landing pages
- Retrieving page source code
- Publishing pages

---

## Technology: Playwright

**Why Playwright:**
- Cross-browser support (Chromium, Firefox, WebKit)
- Runs on Node.js (matches Bloomie skill architecture)
- Already installed in OpenClaw (`/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome`)
- Works with headless/headed modes
- Strong locator support (CSS, XPath, aria-label)
- Can handle auth, navigation, form input

**Key Capabilities:**
```javascript
const { chromium } = require('playwright');

// Launch browser
const browser = await chromium.launch();
const page = await browser.newPage();

// Navigate to URL
await page.goto('https://app.gohighlevel.com');

// Interact with UI
await page.fill('input[type="email"]', 'user@example.com');
await page.fill('input[type="password"]', 'password');
await page.click('button:has-text("Login")');
await page.waitForNavigation();

// Extract data
const text = await page.textContent('selector');
const html = await page.innerHTML('selector');
```

---

## GHL Login Flow

**URL:** `https://app.gohighlevel.com/`

**Expected steps:**
1. Load login page
2. Enter email → click "Next"
3. Verify password entry form appears
4. Enter password → click "Login"
5. Handle 2FA if enabled (SMS/email code)
6. Wait for dashboard load
7. Navigate to target funnel/page

**Challenges:**
- Anti-bot detection (may require headless=false + delays)
- Session management (need to persist auth across requests)
- Rate limiting (need delays between actions)
- 2FA support (manual intervention or SMS API integration)

---

## Funnel Page Builder Navigation

**URL pattern:** `https://app.gohighlevel.com/funnel/{funnelId}/page/{pageId}`

**Key selectors to identify:**
- Page canvas/editor container
- Page element inspector (left panel)
- Design/content settings (right panel)
- Save button
- Publish button
- Element add/delete buttons

**Operations:**
- Get page HTML/structure
- Add elements (text, image, form, button, etc.)
- Edit element properties (text, color, size, positioning)
- Duplicate page
- Delete page
- Preview page
- Publish page

---

## Implementation Strategy

### Phase 1: Basic Auth Flow
```javascript
const ghlBrowser = require('/data/workspace/skills/ghl-browser');

// Login (one-time)
const session = await ghlBrowser.login('email@example.com', 'password');

// Get auth cookies for future requests
const cookies = await session.cookies();
```

### Phase 2: Page Retrieval
```javascript
// Get page HTML
const pageHtml = await ghlBrowser.getPageHtml('funnelId', 'pageId', session);

// Get page metadata
const pageMeta = await ghlBrowser.getPageMetadata('funnelId', 'pageId', session);
```

### Phase 3: Page Editing
```javascript
// Add element to page
await ghlBrowser.addElement('funnelId', 'pageId', {
  type: 'text',
  content: 'Welcome!',
  position: { x: 100, y: 100 }
}, session);

// Update element
await ghlBrowser.updateElement('funnelId', 'pageId', 'elementId', {
  content: 'Updated text'
}, session);

// Delete element
await ghlBrowser.deleteElement('funnelId', 'pageId', 'elementId', session);
```

### Phase 4: Publishing
```javascript
// Publish page
await ghlBrowser.publishPage('funnelId', 'pageId', session);

// Get live page URL
const url = await ghlBrowser.getPageUrl('funnelId', 'pageId', session);
```

---

## Technical Considerations

### Session Management
- Store cookies in memory or file system
- Persist authentication state across requests
- Handle session expiration (re-login if 401)
- Consider session pooling for concurrent operations

### Performance
- Use headless mode by default (faster, less resource-intensive)
- Add strategic delays to mimic human behavior
- Avoid constant browser launches — reuse browser instances
- Use browser pooling for parallel operations

### Reliability
- Implement retry logic for network failures
- Add element presence/visibility waits
- Handle dynamic content loading (use waitForSelector)
- Test with real GHL account (staging account if possible)
- Log all interactions for debugging

### Anti-Bot Detection
- May need headless=false for some operations
- Add random delays between actions
- Use realistic User-Agent headers
- Consider rotating IPs if rate-limited
- Avoid rapid successive requests

---

## Security Concerns

⚠️ **Critical:**
- **Never hardcode credentials** — use environment variables or secure vaults
- **Protect auth cookies** — store securely, never log
- **Limit automation scope** — only access what's needed
- **Audit logging** — log all automated changes for compliance
- **Account security** — use OAuth where possible instead of password auth

---

## Dependencies

```json
{
  "playwright": "^1.40.0"
}
```

**Note:** Playwright already available in OpenClaw at `/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome`

---

## Next Steps

1. **Create proof-of-concept:** GHL login + navigate to dashboard
2. **Test page retrieval:** Fetch page HTML/metadata
3. **Test page editing:** Add/update/delete elements
4. **Build caching layer:** Store page data locally to reduce API calls
5. **Integrate with bloomie-ghl skill:** Combine REST API + browser automation

---

## Resources

- **Playwright Docs:** https://playwright.dev/
- **Playwright API Reference:** https://playwright.dev/docs/api/class-page
- **GHL Dashboard:** https://app.gohighlevel.com/
- **Anti-bot evasion techniques:** Consider stealth-plugin for Playwright

---

**Status:** Ready for implementation planning. Next session: build POC.
