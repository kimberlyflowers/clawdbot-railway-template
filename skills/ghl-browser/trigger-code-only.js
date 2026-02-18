const { chromium } = require('playwright');

const GHL_EMAIL = 'flwrs_kmbrly@yahoo.com';
const GHL_PASSWORD = 'Kimmy0910!';

(async () => {
  console.log('🔐 Triggering 2FA code send...\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('[1] Navigating to GHL login...');
    await page.goto('https://app.gohighlevel.com/', { waitUntil: 'domcontentloaded', timeout: 20000 });

    console.log('[2] Filling email...');
    await page.waitForSelector('#email', { timeout: 5000 });
    await page.locator('#email').fill(GHL_EMAIL);
    await page.waitForTimeout(150);

    console.log('[3] Filling password...');
    await page.locator('#password').fill(GHL_PASSWORD);
    await page.waitForTimeout(150);

    console.log('[4] Clicking sign in...');
    await page.locator('button:has-text("Sign in")').click();
    await page.waitForTimeout(1500);

    console.log('[5] Clicking send code...');
    const sendBtn = page.locator('button:has-text("Send Security Code")');
    await sendBtn.click({ timeout: 5000 });

    console.log('[6] Taking screenshot...');
    await page.screenshot({ path: '/tmp/ghl-code-prompt.png' });

    await page.waitForTimeout(1000);

    console.log('\n' + '='.repeat(60));
    console.log('✅ CODE SENT TO YOUR EMAIL');
    console.log('='.repeat(60));
    console.log('\n📧 Check flwrs_kmbrly@yahoo.com for the 6-digit code');
    console.log('📸 Screenshot: /tmp/ghl-code-prompt.png\n');

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    await browser.close();
  }
})();
