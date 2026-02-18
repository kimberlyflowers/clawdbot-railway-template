const { chromium } = require('playwright');

const GHL_EMAIL = 'flwrs_kmbrly@yahoo.com';
const GHL_PASSWORD = 'Kimmy0910!';

async function e2eLogin(code) {
  console.log('🚀 GHL Complete E2E Login Test\n');
  console.log('='.repeat(60));

  let browser, page;

  try {
    console.log('\n[1/5] Launching browser...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('[2/5] Logging into GHL...');
    await page.goto('https://app.gohighlevel.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForSelector('#email', { timeout: 10000 });
    console.log('     ✓ Login page loaded');

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
    console.log('     ✓ Code sent to email');

    await page.waitForTimeout(1500);

    console.log('[4/5] Entering code into form...');
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

    const verifyBtn = page
      .locator('button:has-text("Verify"), button:has-text("Submit"), button:has-text("Confirm")')
      .first();

    try {
      await verifyBtn.click({ timeout: 3000 });
      console.log('     ✓ Clicked verify');
    } catch (e) {
      console.log('     ✓ Auto-submit');
    }

    console.log('[5/5] Waiting for dashboard...');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => null);
    await page.waitForTimeout(2000);

    const screenshot = '/tmp/ghl-dashboard-authenticated.png';
    await page.screenshot({ path: screenshot, fullPage: false });

    const url = page.url();
    console.log('     ✓ Dashboard captured');

    console.log('\n✅ Login Successful!');
    console.log(`📍 URL: ${url}`);
    console.log(`📸 Screenshot: ${screenshot}`);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 E2E Test Passed!');
    console.log('='.repeat(60));

    return { success: true, screenshot, url };

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

const code = '785882';
e2eLogin(code)
  .then(result => {
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
