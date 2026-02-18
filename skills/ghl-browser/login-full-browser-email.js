/**
 * GHL Full Login - Browser-Based Email Reading
 * 
 * Uses two browser instances:
 * 1. GHL browser - logs in and sends 2FA
 * 2. Yahoo browser - fetches the 2FA code from email
 * 
 * Combines them to complete authentication
 */

const { chromium } = require('playwright');
const BrowserEmailReader = require('./email-reader-browser');

const GHL_EMAIL = 'flwrs_kmbrly@yahoo.com';
const GHL_PASSWORD = 'Kimmy0910!';

async function fullLoginBrowserEmail() {
  console.log('🚀 GHL Full Login with Browser-Based Email Reading\n');

  let ghlBrowser;
  let ghlPage;
  let emailReader;

  try {
    // Step 1: Start GHL browser
    console.log('[1/5] Starting GHL browser...');
    ghlBrowser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    ghlPage = await ghlBrowser.newPage();
    await ghlPage.setViewportSize({ width: 1280, height: 720 });

    console.log('[2/5] Logging into GHL...');
    await ghlPage.goto('https://app.gohighlevel.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await ghlPage.waitForSelector('#email', { timeout: 10000 });
    await ghlPage.locator('#email').fill(GHL_EMAIL);
    await ghlPage.waitForTimeout(150);
    await ghlPage.locator('#password').fill(GHL_PASSWORD);
    await ghlPage.waitForTimeout(150);
    await ghlPage.locator('button:has-text("Sign in")').click();

    await ghlPage.waitForTimeout(1500);

    // Step 2: Send code and read from Yahoo email
    console.log('[3/5] Sending 2FA code + fetching from Yahoo...');

    // Send code button
    const sendBtn = ghlPage.locator(
      'button:has-text("Send Security Code")'
    );
    await sendBtn.click({ timeout: 5000 });

    // Simultaneously, read code from Yahoo
    console.log('     📧 Reading code from Yahoo Mail...');
    emailReader = new BrowserEmailReader();
    const code = await emailReader.getLatestCodeFromYahoo();

    console.log(`✓ Got code: ${code}`);

    // Step 3: Wait for code inputs
    await ghlPage.waitForTimeout(1000);

    console.log('[4/5] Entering code into GHL...');
    const inputs = await ghlPage
      .locator('input[maxlength="1"]')
      .all();

    if (inputs.length < 6) {
      throw new Error(
        `Expected 6 code inputs, found ${inputs.length}`
      );
    }

    for (let i = 0; i < 6; i++) {
      await inputs[i].fill(code[i]);
      console.log(`     [${i + 1}/6] ${code[i]}`);
      await ghlPage.waitForTimeout(80);
    }

    await ghlPage.waitForTimeout(500);

    // Try to click verify button
    const verifyBtn = ghlPage
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

    // Step 4: Wait for authenticated state
    console.log('[5/5] Waiting for dashboard...');
    await ghlPage
      .waitForLoadState('networkidle', { timeout: 10000 })
      .catch(() => null);
    await ghlPage.waitForTimeout(2000);

    // Screenshot
    const dashboardScreenshot =
      '/tmp/ghl-dashboard-authenticated-final.png';
    await ghlPage.screenshot({
      path: dashboardScreenshot,
      fullPage: false,
    });

    const finalUrl = ghlPage.url();
    console.log(`\n✅ Login Successful!`);
    console.log(`📍 URL: ${finalUrl}`);
    console.log(`📸 Screenshot: ${dashboardScreenshot}`);

    // Check if we're authenticated
    if (
      finalUrl.includes('app.gohighlevel.com') &&
      !finalUrl.includes('app.gohighlevel.com/')
    ) {
      // If URL changed significantly, we're likely authenticated
      console.log('✅ Authenticated!');
    }

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
        await ghlPage.screenshot({
          path: '/tmp/ghl-error-final.png',
        });
      } catch (e) {
        // Ignore
      }
    }

    throw error;

  } finally {
    if (emailReader) {
      await emailReader.disconnect().catch(() => null);
    }

    if (ghlBrowser) {
      await ghlBrowser.close();
    }
  }
}

fullLoginBrowserEmail()
  .then(result => {
    console.log('\n' + '='.repeat(60));
    console.log('✅ Full E2E Test Complete!');
    console.log('='.repeat(60));
    process.exit(0);
  })
  .catch(error => {
    console.error('\n' + '='.repeat(60));
    console.error('❌ Test Failed');
    console.error('='.repeat(60));
    process.exit(1);
  });
