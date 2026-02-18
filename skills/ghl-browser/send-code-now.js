const { chromium } = require('playwright');

(async () => {
  let browser;
  try {
    console.log('🔔 Sending 2FA code to your email...\n');
    
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    await page.goto('https://app.gohighlevel.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForSelector('#email', { timeout: 10000 });
    await page.locator('#email').fill('flwrs_kmbrly@yahoo.com');
    await page.waitForTimeout(150);
    await page.locator('#password').fill('Kimmy0910!');
    await page.waitForTimeout(150);
    await page.locator('button:has-text("Sign in")').click();

    await page.waitForTimeout(2000);

    console.log('Clicking "Send Security Code"...');
    const sendBtn = page.locator('button:has-text("Send Security Code")');
    await sendBtn.click({ timeout: 5000 });

    console.log('✓ Button clicked');
    await page.waitForTimeout(2000);

    console.log('\n✅ Code sent to flwrs_kmbrly@yahoo.com\n');
    console.log('📧 Check your email for the 6-digit code');
    console.log('⏱️  Code will arrive in 1-2 minutes');
    console.log('⏰ Code expires in ~2 minutes after receiving\n');

    await page.screenshot({ path: '/tmp/ghl-ready-for-code.png' });

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
