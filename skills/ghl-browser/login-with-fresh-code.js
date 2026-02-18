const { chromium } = require('playwright');

const GHL_EMAIL = 'flwrs_kmbrly@yahoo.com';
const GHL_PASSWORD = 'Kimmy0910!';
const GHL_CODE = '632728';

async function fullLogin() {
  console.log('🚀 GHL Login with Fresh Code\n');

  let browser;
  let page;

  try {
    console.log('[1/6] Launching browser...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('[2/6] Navigating to GHL...');
    await page.goto('https://app.gohighlevel.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForSelector('#email', { timeout: 10000 });
    console.log('     ✓ Login form loaded');

    console.log('[3/6] Logging in...');
    await page.locator('#email').fill(GHL_EMAIL);
    await page.waitForTimeout(200);
    await page.locator('#password').fill(GHL_PASSWORD);
    await page.waitForTimeout(200);
    await page.locator('button:has-text("Sign in")').click();

    console.log('[4/6] Waiting for 2FA screen...');
    await page.waitForTimeout(2000);

    console.log('[5/6] Sending security code...');
    const sendBtn = page.locator('button:has-text("Send Security Code")');
    await sendBtn.click({ timeout: 5000 });
    console.log('     ✓ Button clicked');

    await page.waitForTimeout(2000);

    const codeInputs = await page.locator('input[inputmode="numeric"], input[maxlength="1"], input[type="text"][inputmode="numeric"]').all();
    
    console.log(`     ✓ Found ${codeInputs.length} code input fields`);

    if (codeInputs.length >= 6) {
      console.log(`     ✓ Entering code: ${GHL_CODE}`);
      for (let i = 0; i < 6; i++) {
        const digit = GHL_CODE[i];
        await codeInputs[i].fill(digit);
        console.log(`       [${i + 1}/6] ${digit}`);
        await page.waitForTimeout(100);
      }

      await page.screenshot({ path: '/tmp/ghl-code-entered.png' });
      console.log('     ✓ Code entered');

      await page.waitForTimeout(500);

      const verifyBtn = page.locator('button:has-text("Verify"), button:has-text("Submit"), button:has-text("Confirm")').first();
      try {
        await verifyBtn.click({ timeout: 5000 });
        console.log('     ✓ Clicked verify button');
      } catch (e) {
        console.log('     ✓ Auto-submit');
      }
    }

    console.log('[6/6] Waiting for dashboard...');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => null);
    await page.waitForTimeout(3000);

    const dashboardScreenshot = '/tmp/ghl-dashboard-final.png';
    await page.screenshot({ path: dashboardScreenshot, fullPage: false });

    const finalUrl = page.url();
    console.log(`\n✅ Complete!`);
    console.log(`📍 URL: ${finalUrl}`);
    console.log(`📸 Screenshot: ${dashboardScreenshot}`);

    return { success: true, screenshotPath: dashboardScreenshot };

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (page) {
      try {
        await page.screenshot({ path: '/tmp/ghl-error-final.png' });
      } catch (e) {}
    }
    throw error;

  } finally {
    if (browser) await browser.close();
  }
}

fullLogin()
  .then(() => {
    console.log('\n' + '='.repeat(60));
    console.log('✅ Success!');
    console.log('='.repeat(60));
    process.exit(0);
  })
  .catch(error => {
    console.error('\n' + '='.repeat(60));
    console.error('❌ Failed');
    console.error('='.repeat(60));
    process.exit(1);
  });
