const { chromium } = require('playwright');

async function triggerGHLLogin() {
  console.log('🚀 Triggering GHL Login + 2FA Code Send\n');
  
  let browser, page;

  try {
    console.log('[1] Launching browser...');
    browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    const context = await browser.newContext();
    page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('[2] Navigating to GHL login...');
    await page.goto('https://app.gohighlevel.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    console.log('[3] Entering credentials...');
    await page.waitForSelector('#email', { timeout: 10000 });
    await page.locator('#email').fill('flwrs_kmbrly@yahoo.com');
    await page.waitForTimeout(150);
    await page.locator('#password').fill('Kimmy0910!');
    await page.waitForTimeout(150);
    
    console.log('[4] Submitting login...');
    await page.locator('button:has-text("Sign in")').click();
    console.log('     ✓ Credentials submitted');

    await page.waitForTimeout(2000);

    console.log('[5] Sending 2FA code to your email...');
    const sendBtn = page.locator('button:has-text("Send Security Code")');
    await sendBtn.click({ timeout: 5000 });
    console.log('     ✓ Code sent to: flwrs_kmbrly@yahoo.com');
    
    console.log('\n✅ 2FA Code Sent!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Check your email for the 6-digit code');
    console.log('🔐 Send it to Jaden when ready');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('⏳ Browser is open, ready for you to check email.\n');
    
    // Keep browser open until manually closed
    await new Promise(() => {});

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

triggerGHLLogin();
