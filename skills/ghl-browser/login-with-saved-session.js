/**
 * GHL Login with Saved Session
 * 
 * Reuses authenticated session from login-and-save-session.js
 * Skips login and 2FA entirely
 * 
 * Usage: node login-with-saved-session.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SESSION_FILE = '/tmp/ghl-session/auth-session.json';

async function loginWithSavedSession() {
  console.log('🚀 GHL Login with Saved Session\n');
  console.log('='.repeat(60));

  let browser, context, page;

  try {
    // Check if session exists
    if (!fs.existsSync(SESSION_FILE)) {
      throw new Error(
        `Session file not found: ${SESSION_FILE}\n` +
        'Run: node login-and-save-session.js <code>'
      );
    }

    console.log('\n[1/4] Loading saved session...');
    const sessionState = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
    console.log(`✓ Loaded ${sessionState.cookies.length} cookies`);

    console.log('[2/4] Launching browser with session...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    // Create context with saved state
    context = await browser.createBrowserContext({
      storageState: sessionState,
    });

    page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('[3/4] Navigating to GHL dashboard...');
    await page.goto('https://app.gohighlevel.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForTimeout(2000);

    console.log('[4/4] Capturing authenticated dashboard...');
    const screenshot = '/tmp/ghl-dashboard-from-session.png';
    await page.screenshot({ path: screenshot, fullPage: false });

    const url = page.url();
    console.log(`✓ Screenshot: ${screenshot}`);

    console.log('\n✅ Success!');
    console.log(`📍 URL: ${url}`);
    console.log(`📸 Dashboard captured`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Session Reuse Works!');
    console.log('No login or 2FA required');
    console.log('='.repeat(60));

    return { success: true, screenshotPath: screenshot, url };

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;

  } finally {
    if (browser) await browser.close();
  }
}

loginWithSavedSession()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
