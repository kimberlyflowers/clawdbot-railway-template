/**
 * GHL Login - Step 1B: Actually Send the 2FA Code
 * 
 * This script:
 * 1. Restores the saved browser context (logged in, at 2FA screen)
 * 2. Clicks "Send Security Code" button
 * 3. Waits for code to be sent
 * 4. Screenshots confirmation
 * 5. Exits
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STATE_DIR = '/tmp/ghl-browser-state';
const stateFile = path.join(STATE_DIR, 'context-state.json');

async function sendCode() {
  console.log('🚀 GHL Login - Step 1B: Send 2FA Code\n');

  let browser;
  let context;
  let page;

  try {
    // Step 1: Launch browser
    console.log('[1/2] Launching browser...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    // Step 2: Restore saved context
    console.log('[2/3] Restoring saved browser state...');
    
    if (!fs.existsSync(stateFile)) {
      throw new Error(`State file not found: ${stateFile}. Run login-step1-to-2fa.js first.`);
    }

    const contextState = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    context = await browser.newContext({
      storageState: contextState.storageState,
    });

    page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    // Navigate to the same URL
    console.log('     ✓ Navigating to 2FA screen...');
    await page.goto(contextState.url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForTimeout(1000);

    // Step 3: Click "Send Security Code" button
    console.log('[3/3] Clicking "Send Security Code" button...');
    const sendButton = page.locator('button:has-text("Send Security Code")');
    await sendButton.click();

    console.log('     ✓ Button clicked, waiting for email...');
    await page.waitForTimeout(2000);

    // Screenshot confirmation
    console.log('     ✓ Taking screenshot...');
    const confirmScreenshot = path.join(STATE_DIR, '2fa-code-sent.png');
    await page.screenshot({ path: confirmScreenshot, fullPage: false });

    console.log(`\n✅ Security Code Sent!`);
    console.log(`\n📨 Check your email at: flwrs_kmbrly@yahoo.com`);
    console.log('   You should receive the 2FA code within 1-2 minutes\n');
    console.log(`📸 Screenshot: ${confirmScreenshot}`);

    return {
      success: true,
      screenshotPath: confirmScreenshot,
    };

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    if (page) {
      try {
        const errorScreenshot = path.join(STATE_DIR, 'error-send-code.png');
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

sendCode()
  .then(result => {
    console.log('\n' + '='.repeat(60));
    console.log('✅ Ready for code entry!');
    console.log('='.repeat(60) + '\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n' + '='.repeat(60));
    console.error('❌ Failed to send code');
    console.error('='.repeat(60));
    process.exit(1);
  });
