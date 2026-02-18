/**
 * GHL Login & Save Session
 * 
 * One-time setup:
 * 1. Log in with credentials
 * 2. Enter 2FA code (user provides)
 * 3. Save authenticated session to file
 * 
 * Future runs can reuse this session and skip 2FA
 * 
 * Usage: node login-and-save-session.js <6-digit-code>
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const GHL_EMAIL = 'flwrs_kmbrly@yahoo.com';
const GHL_PASSWORD = 'Kimmy0910!';
const SESSION_DIR = '/tmp/ghl-session';
const SESSION_FILE = path.join(SESSION_DIR, 'auth-session.json');

async function loginAndSaveSession(code) {
  console.log('🚀 GHL Login & Save Session\n');

  // Ensure session directory exists
  if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR, { recursive: true });
  }

  let browser, context, page;

  try {
    console.log('[1/5] Launching browser...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    // Create context (will save state later)
    context = await browser.createBrowserContext();
    page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('[2/5] Logging into GHL...');
    await page.goto('https://app.gohighlevel.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForSelector('#email', { timeout: 10000 });
    await page.locator('#email').fill(GHL_EMAIL);
    await page.waitForTimeout(150);
    await page.locator('#password').fill(GHL_PASSWORD);
    await page.waitForTimeout(150);
    await page.locator('button:has-text("Sign in")').click();
    console.log('     ✓ Credentials submitted');

    await page.waitForTimeout(1500);

    console.log('[3/5] Sending 2FA code...');
    const sendBtn = page.locator('button:has-text("Send Security Code")');
    await sendBtn.click({ timeout: 5000 });
    console.log('     ✓ Code sent');

    await page.waitForTimeout(1500);

    console.log('[4/5] Entering 2FA code...');
    const inputs = await page.locator('input[maxlength="1"]').all();

    if (inputs.length < 6) {
      throw new Error(`Expected 6 inputs, found ${inputs.length}`);
    }

    for (let i = 0; i < 6; i++) {
      await inputs[i].fill(code[i]);
      console.log(`     [${i + 1}/6] ${code[i]}`);
      await page.waitForTimeout(80);
    }

    await page.waitForTimeout(500);

    // Try to click verify
    const verifyBtn = page
      .locator('button:has-text("Verify"), button:has-text("Submit"), button:has-text("Confirm")')
      .first();

    try {
      await verifyBtn.click({ timeout: 3000 });
    } catch (e) {}

    // Wait for dashboard
    console.log('[5/5] Waiting for authentication...');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => null);
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`     ✓ Authenticated: ${url}`);

    // Save session state
    console.log('\n💾 Saving session...');
    const sessionState = await context.storageState();
    
    fs.writeFileSync(
      SESSION_FILE,
      JSON.stringify(sessionState, null, 2)
    );

    console.log(`✓ Session saved to: ${SESSION_FILE}`);
    console.log(`  Size: ${fs.statSync(SESSION_FILE).size} bytes`);

    console.log('\n✅ Setup complete!');
    console.log('\nNext: Use login-with-saved-session.js to log in without 2FA');

    return { success: true, sessionFile: SESSION_FILE };

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;

  } finally {
    if (browser) await browser.close();
  }
}

const code = process.argv[2];
if (!code || code.length !== 6) {
  console.log('Usage: node login-and-save-session.js <6-digit-code>');
  console.log('Example: node login-and-save-session.js 123456');
  process.exit(1);
}

loginAndSaveSession(code)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
