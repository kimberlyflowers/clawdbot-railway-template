/**
 * GHL Login - Step 1: Get to 2FA Screen
 * 
 * This script:
 * 1. Logs in with credentials
 * 2. Reaches 2FA screen
 * 3. Screenshots the 2FA form
 * 4. Saves state for next step (browser context)
 * 5. Exits
 * 
 * User then provides the code, and we use step 2 to continue
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const GHL_EMAIL = 'flwrs_kmbrly@yahoo.com';
const GHL_PASSWORD = 'Kimmy0910!';
const STATE_DIR = '/tmp/ghl-browser-state';

async function loginTo2FA() {
  console.log('🚀 GHL Login - Step 1: Get to 2FA Screen\n');
  console.log(`📧 Email: ${GHL_EMAIL}\n`);

  // Create state directory
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }

  let browser;
  let page;
  let context;

  try {
    // Step 1: Launch browser
    console.log('[1/3] Launching browser...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    context = await browser.newContext();
    page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    // Step 2: Log in
    console.log('[2/3] Logging in to GHL...');
    await page.goto('https://app.gohighlevel.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Wait for form
    await page.waitForSelector('#email', { timeout: 10000 });
    console.log('     ✓ Login form loaded');

    // Fill credentials
    await page.locator('#email').fill(GHL_EMAIL);
    await page.waitForTimeout(300);
    await page.locator('#password').fill(GHL_PASSWORD);
    await page.waitForTimeout(300);

    // Click Sign in
    console.log('     ✓ Signing in...');
    await page.locator('button:has-text("Sign in")').click();

    // Wait for 2FA screen
    console.log('[3/3] Waiting for 2FA screen...');
    await page.waitForTimeout(3000); // Let page process login

    // Screenshot 2FA screen
    const twoFAScreenshot = path.join(STATE_DIR, '2fa-screen.png');
    await page.screenshot({ path: twoFAScreenshot, fullPage: false });
    console.log(`     ✓ Screenshot saved: ${twoFAScreenshot}`);

    // Get page info
    const url = page.url();
    console.log(`\n📍 Current URL: ${url}`);

    // Save context state for next step
    const contextState = {
      storageState: await context.storageState(),
      url: url,
      timestamp: new Date().toISOString(),
    };

    const stateFile = path.join(STATE_DIR, 'context-state.json');
    fs.writeFileSync(stateFile, JSON.stringify(contextState, null, 2));
    console.log(`✓ Context state saved: ${stateFile}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ 2FA Screen Reached!');
    console.log('='.repeat(60));
    console.log('\n📨 Check your email for the 2FA code from GHL');
    console.log('   Email: flwrs_kmbrly@yahoo.com\n');
    console.log('Screenshots:');
    console.log(`  • 2FA Screen: ${twoFAScreenshot}\n`);
    console.log('Next: Run login-step2-enter-code.js with the 6-digit code\n');

    return {
      success: true,
      screenshotPath: twoFAScreenshot,
      statePath: stateFile,
      url: url,
    };

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    // Take error screenshot
    if (page) {
      try {
        const errorScreenshot = path.join(STATE_DIR, 'error.png');
        await page.screenshot({ path: errorScreenshot });
        console.log(`📸 Error screenshot: ${errorScreenshot}`);
      } catch (e) {
        // Ignore
      }
    }

    throw error;

  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

loginTo2FA()
  .then(result => {
    process.exit(0);
  })
  .catch(error => {
    console.error('Process failed');
    process.exit(1);
  });
