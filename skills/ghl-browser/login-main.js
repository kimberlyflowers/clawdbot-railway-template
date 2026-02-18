/**
 * GHL Main Login Script
 * 
 * Flow:
 * 1. Check for saved session
 * 2. If valid: Use saved session (instant, no 2FA)
 * 3. If invalid/expired: Do full login with 2FA and save new session
 * 
 * Usage:
 *   node login-main.js                    # Use saved session
 *   node login-main.js <6-digit-code>     # Force new login with code
 */

const { chromium } = require('playwright');
const SessionManager = require('./session-manager');

const GHL_EMAIL = 'flwrs_kmbrly@yahoo.com';
const GHL_PASSWORD = 'Kimmy0910!';

async function loginWithSessionPersistence(code = null) {
  console.log('🚀 GHL Login with Session Persistence\n');
  console.log('='.repeat(70));

  let browser, context, page;

  try {
    // Step 1: Check for saved session
    console.log('\n[1] Checking for saved session...');
    let useExistingSession = false;

    if (!code && SessionManager.hasSavedSession()) {
      console.log('✓ Valid session found');
      useExistingSession = true;
    } else if (code) {
      console.log('✓ Code provided - forcing new login');
    } else {
      console.log('✗ No saved session');
    }

    // OPTION A: Use saved session
    if (useExistingSession) {
      console.log('\n[2] Loading saved session...');
      const session = SessionManager.loadSession();

      if (!session) {
        console.log('⚠️  Session load failed, doing full login');
        useExistingSession = false;
      } else {
        console.log('[3] Launching browser with saved session...');
        browser = await chromium.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-gpu'],
        });

        context = await browser.newContext({
          storageState: session,
        });

        page = await context.newPage();
        await page.setViewportSize({ width: 1280, height: 720 });

        console.log('[4] Navigating to GHL...');
        await page.goto('https://app.gohighlevel.com/', {
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        });

        await page.waitForTimeout(2000);

        const url = page.url();
        console.log(`✓ Loaded: ${url}`);
      }
    }

    // OPTION B: Full login with 2FA
    if (!useExistingSession) {
      console.log('\n[2] Starting full login...');

      if (!code) {
        throw new Error(
          'No saved session and no code provided.\n' +
          'Usage: node login-main.js <6-digit-code>'
        );
      }

      console.log('[3] Launching browser...');
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-gpu'],
      });

      context = await browser.newContext();
      page = await context.newPage();
      await page.setViewportSize({ width: 1280, height: 720 });

      console.log('[4] Logging in...');
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

      console.log('[5] Sending 2FA code...');
      const sendBtn = page.locator('button:has-text("Send Security Code")');
      await sendBtn.click({ timeout: 5000 });
      console.log('     ✓ Code sent');

      await page.waitForTimeout(2500);

      console.log('[6] Entering code...');
      const inputs = await page.locator('input[type="number"][maxlength="1"]').all();

      if (inputs.length < 6) {
        throw new Error(`Expected 6 inputs, found ${inputs.length}`);
      }

      for (let i = 0; i < 6; i++) {
        await inputs[i].fill(code[i]);
        console.log(`     [${i + 1}/6] ${code[i]}`);
        await page.waitForTimeout(80);
      }

      await page.waitForTimeout(500);

      const verifyBtn = page
        .locator(
          'button:has-text("Verify"), button:has-text("Submit"), button:has-text("Confirm")'
        )
        .first();

      try {
        await verifyBtn.click({ timeout: 3000 });
        console.log('     ✓ Clicked verify');
      } catch (e) {
        console.log('     ✓ Auto-submit');
      }

      console.log('[7] Waiting for dashboard...');
      await page
        .waitForLoadState('networkidle', { timeout: 10000 })
        .catch(() => null);
      await page.waitForTimeout(2000);

      const url = page.url();
      console.log(`✓ Authenticated: ${url}`);

      // Save session
      console.log('\n[8] Saving session...');
      await SessionManager.saveSession(context);
    }

    // Capture final screenshot
    console.log('\n[✓] Capturing dashboard screenshot...');
    const screenshot = '/tmp/ghl-dashboard.png';
    await page.screenshot({ path: screenshot, fullPage: false });

    const finalUrl = page.url();
    console.log(`📸 Screenshot: ${screenshot}`);

    console.log('\n' + '='.repeat(70));
    console.log('✅ Login Successful!');
    console.log('='.repeat(70));
    console.log(`\n📍 URL: ${finalUrl}`);
    console.log(`📸 Dashboard: ${screenshot}`);
    console.log(`\n💾 Session info:`);

    const info = SessionManager.getSessionInfo();
    console.log(`   Path: ${info.path}`);
    console.log(`   Size: ${info.size} bytes`);
    console.log(`   Cookies: ${info.cookies}`);
    console.log(`   Saved: ${info.savedAt}`);

    console.log(
      `\n✨ Next run: node login-main.js (instant, no 2FA needed)`
    );

    return { success: true, screenshot, url: finalUrl };

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    if (page) {
      try {
        await page.screenshot({ path: '/tmp/ghl-error.png' });
      } catch (e) {}
    }

    throw error;

  } finally {
    if (browser) await browser.close();
  }
}

// Get code from command line
const code = process.argv[2];

if (code && code.length !== 6) {
  console.error('❌ Invalid code format. Must be 6 digits.');
  process.exit(1);
}

loginWithSessionPersistence(code)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
