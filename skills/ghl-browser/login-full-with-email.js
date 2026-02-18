/**
 * GHL Full Login - With Email Code Reading
 * 
 * Flow:
 * 1. Start browser login
 * 2. Send 2FA code to email
 * 3. Connect to Yahoo email and read the code
 * 4. Enter code into browser
 * 5. Complete login and capture dashboard
 */

const { chromium } = require('playwright');
const EmailReader = require('./email-reader');

const GHL_EMAIL = 'flwrs_kmbrly@yahoo.com';
const GHL_PASSWORD = 'Kimmy0910!';

async function fullLoginWithEmail() {
  console.log('🚀 GHL Full Login with Email Code Reading\n');

  let browser;
  let page;
  let emailReader;

  try {
    // Step 1: Start browser and login
    console.log('[1/5] Launching browser...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('[2/5] Navigating and logging in...');
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

    await page.waitForTimeout(1500);

    // Step 2: Send code and read from email simultaneously
    console.log('[3/5] Sending code + reading from email...');

    // Start email reader
    emailReader = new EmailReader();
    const emailPromise = emailReader.connect()
      .then(() => emailReader.getLatestGHLEmail());

    // Send code to browser
    const sendBtn = page.locator('button:has-text("Send Security Code")');
    await sendBtn.click({ timeout: 5000 });

    // Wait for code from email
    console.log('     ⏳ Waiting for email code...');
    const code = await Promise.race([
      emailPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Email timeout')), 30000)
      ),
    ]);

    console.log(`✓ Got code from email: ${code}`);

    // Step 3: Wait for code inputs to appear
    await page.waitForTimeout(1000);

    console.log('[4/5] Entering code into form...');
    const inputs = await page.locator('input[maxlength="1"]').all();

    if (inputs.length < 6) {
      throw new Error(
        `Expected 6 code inputs, found ${inputs.length}`
      );
    }

    for (let i = 0; i < 6; i++) {
      await inputs[i].fill(code[i]);
      console.log(`     [${i + 1}/6] ${code[i]}`);
      await page.waitForTimeout(80);
    }

    await page.waitForTimeout(500);

    // Auto-submit
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

    // Step 4: Wait for dashboard
    console.log('[5/5] Waiting for dashboard...');
    await page
      .waitForLoadState('networkidle', { timeout: 10000 })
      .catch(() => null);
    await page.waitForTimeout(2000);

    // Screenshot
    const dashboardScreenshot = '/tmp/ghl-dashboard-authenticated.png';
    await page.screenshot({ path: dashboardScreenshot, fullPage: false });

    const finalUrl = page.url();
    console.log(`\n✅ Login Successful!`);
    console.log(`📍 URL: ${finalUrl}`);
    console.log(`📸 Screenshot: ${dashboardScreenshot}`);

    return {
      success: true,
      screenshotPath: dashboardScreenshot,
      url: finalUrl,
      code,
    };

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    if (page) {
      try {
        await page.screenshot({ path: '/tmp/ghl-error-final.png' });
      } catch (e) {
        // Ignore
      }
    }

    throw error;

  } finally {
    if (emailReader) {
      await emailReader.disconnect().catch(() => null);
    }

    if (browser) {
      await browser.close();
    }
  }
}

fullLoginWithEmail()
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
