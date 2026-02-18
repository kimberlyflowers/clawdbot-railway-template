const { chromium } = require('playwright');
const fs = require('fs');

async function sendTwoFACode() {
  console.log('🚀 Sending 2FA Code via Email\n');
  
  let browser, page;

  try {
    // Remove saved session to force fresh login
    const sessionPath = '/data/secrets/ghl-session.json';
    if (fs.existsSync(sessionPath)) {
      fs.unlinkSync(sessionPath);
      console.log('✓ Cleared saved session');
    }

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    const context = await browser.newContext();
    page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('[1] Navigating to GHL...');
    await page.goto('https://app.gohighlevel.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    console.log('[2] Entering email & password...');
    await page.waitForSelector('#email', { timeout: 10000 });
    await page.locator('#email').fill('flwrs_kmbrly@yahoo.com');
    await page.waitForTimeout(150);
    await page.locator('#password').fill('Kimmy0910!');
    await page.waitForTimeout(150);
    
    console.log('[3] Signing in...');
    await page.locator('button:has-text("Sign in")').click();
    console.log('     ✓ Submitted');

    await page.waitForTimeout(2000);

    console.log('[4] Triggering 2FA code send...');
    const sendBtn = page.locator('button:has-text("Send Security Code")');
    await sendBtn.click({ timeout: 5000 });
    console.log('     ✓ Clicked "Send Security Code"');

    await page.waitForTimeout(1500);
    
    console.log('\n✅ 2FA Code Sent!');
    console.log('━'.repeat(50));
    console.log('📧 Sending code to: flwrs_kmbrly@yahoo.com');
    console.log('⏱️  Code should arrive in ~30 seconds');
    console.log('🔐 When you get it, send to Jaden');
    console.log('━'.repeat(50) + '\n');

    // Capture screenshot of 2FA prompt
    const screenshot = '/tmp/ghl-2fa-prompt.png';
    await page.screenshot({ path: screenshot, fullPage: false });
    console.log(`📸 Screenshot: ${screenshot}\n`);
    
    await page.waitForTimeout(2000);
    await browser.close();
    
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (page) {
      try {
        await page.screenshot({ path: '/tmp/ghl-error.png' });
      } catch (e) {}
    }
    process.exit(1);
  }
}

sendTwoFACode();
