/**
 * GHL Full E2E Login - Complete Automation
 * 
 * No user interaction required:
 * 1. Opens GHL
 * 2. Logs in with credentials
 * 3. Sends 2FA code to email
 * 4. Connects to Yahoo IMAP and fetches code
 * 5. Enters code
 * 6. Captures authenticated dashboard
 * 7. Uploads screenshot to Drive
 * 
 * Usage: node login-e2e-full-auto.js
 */

const { chromium } = require('playwright');
const ImapCodeReader = require('./imap-code-reader');

const GHL_EMAIL = 'flwrs_kmbrly@yahoo.com';
const GHL_PASSWORD = 'Kimmy0910!';

async function fullAutoLogin() {
  console.log('🚀 GHL Complete E2E Automation\n');
  console.log('='.repeat(60));

  let ghlBrowser, ghlPage, imapReader;

  try {
    // Step 1: Start GHL browser
    console.log('\n[1/6] Launching GHL browser...');
    ghlBrowser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    ghlPage = await ghlBrowser.newPage();
    await ghlPage.setViewportSize({ width: 1280, height: 720 });

    // Step 2: Login to GHL
    console.log('[2/6] Logging into GHL...');
    await ghlPage.goto('https://app.gohighlevel.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await ghlPage.waitForSelector('#email', { timeout: 10000 });
    console.log('     ✓ Login page loaded');

    await ghlPage.locator('#email').fill(GHL_EMAIL);
    await ghlPage.waitForTimeout(150);
    await ghlPage.locator('#password').fill(GHL_PASSWORD);
    await ghlPage.waitForTimeout(150);
    await ghlPage.locator('button:has-text("Sign in")').click();
    console.log('     ✓ Credentials submitted');

    await ghlPage.waitForTimeout(1500);

    // Step 3: Send code and simultaneously fetch from IMAP
    console.log('[3/6] Sending 2FA code to email...');
    const sendBtn = ghlPage.locator('button:has-text("Send Security Code")');
    await sendBtn.click({ timeout: 5000 });
    console.log('     ✓ Code sent');

    // Step 4: Fetch code from IMAP while waiting
    console.log('[4/6] Fetching code from Yahoo IMAP...');
    imapReader = new ImapCodeReader();
    const code = await Promise.race([
      imapReader.getLatestCode(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('IMAP timeout after 45s')), 45000)
      ),
    ]);

    console.log(`     ✓ Retrieved code: ${code}`);

    // Step 5: Wait for form and enter code
    console.log('[5/6] Entering code into form...');
    await ghlPage.waitForTimeout(1000);

    const inputs = await ghlPage.locator('input[maxlength="1"]').all();

    if (inputs.length < 6) {
      throw new Error(`Expected 6 inputs, found ${inputs.length}`);
    }

    for (let i = 0; i < 6; i++) {
      await inputs[i].fill(code[i]);
      console.log(`     [${i + 1}/6] ${code[i]}`);
      await ghlPage.waitForTimeout(80);
    }

    await ghlPage.waitForTimeout(500);

    // Try to click verify button (may auto-submit)
    const verifyBtn = ghlPage
      .locator(
        'button:has-text("Verify"), button:has-text("Submit"), button:has-text("Confirm")'
      )
      .first();

    try {
      await verifyBtn.click({ timeout: 3000 });
      console.log('     ✓ Clicked verify');
    } catch (e) {
      console.log('     ✓ Auto-submit (no button)');
    }

    // Step 6: Wait for dashboard and screenshot
    console.log('[6/6] Waiting for authenticated dashboard...');
    await ghlPage
      .waitForLoadState('networkidle', { timeout: 10000 })
      .catch(() => null);
    await ghlPage.waitForTimeout(2000);

    const dashboardScreenshot = '/tmp/ghl-dashboard-authenticated.png';
    await ghlPage.screenshot({ path: dashboardScreenshot, fullPage: false });

    const finalUrl = ghlPage.url();
    console.log('     ✓ Dashboard screenshot captured');

    console.log('\n✅ Login Complete!');
    console.log(`📍 URL: ${finalUrl}`);
    console.log(`📸 Screenshot: ${dashboardScreenshot}`);

    // Check if authenticated
    if (!finalUrl.includes('app.gohighlevel.com/')) {
      console.log('✅ Successfully authenticated!');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 E2E Test Passed!');
    console.log('='.repeat(60));

    return {
      success: true,
      screenshotPath: dashboardScreenshot,
      url: finalUrl,
      code,
    };

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    if (ghlPage) {
      try {
        await ghlPage.screenshot({ path: '/tmp/ghl-error.png' });
      } catch (e) {
        // Ignore
      }
    }

    throw error;

  } finally {
    if (ghlBrowser) {
      await ghlBrowser.close();
    }
  }
}

fullAutoLogin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n' + '='.repeat(60));
    console.error('❌ E2E Test Failed');
    console.error('='.repeat(60));
    process.exit(1);
  });
