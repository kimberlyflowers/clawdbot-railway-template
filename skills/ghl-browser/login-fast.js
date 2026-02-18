const { chromium } = require('playwright');

const GHL_EMAIL = 'flwrs_kmbrly@yahoo.com';
const GHL_PASSWORD = 'Kimmy0910!';
const GHL_CODE = '131238';

async function fastLogin() {
  let browser, page;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

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

    const sendBtn = page.locator('button:has-text("Send Security Code")');
    await sendBtn.click({ timeout: 5000 });

    await page.waitForTimeout(1500);

    const codeInputs = await page.locator('input[inputmode="numeric"]').all();
    
    console.log(`Entering: ${GHL_CODE}`);
    for (let i = 0; i < 6; i++) {
      await codeInputs[i].fill(GHL_CODE[i]);
      await page.waitForTimeout(80);
    }

    await page.waitForTimeout(1000);

    const verifyBtn = page.locator('button:has-text("Verify"), button:has-text("Submit"), button:has-text("Confirm")').first();
    try {
      await verifyBtn.click({ timeout: 3000 });
    } catch (e) {}

    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => null);
    await page.waitForTimeout(2000);

    const dashboardScreenshot = '/tmp/ghl-dashboard-final.png';
    await page.screenshot({ path: dashboardScreenshot });

    const url = page.url();
    console.log(`✅ Complete! URL: ${url}`);

    return { success: true, screenshotPath: dashboardScreenshot };

  } catch (error) {
    console.error('❌ Error:', error.message);
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

fastLogin().then(() => process.exit(0)).catch(() => process.exit(1));
