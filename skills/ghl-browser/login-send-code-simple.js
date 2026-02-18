/**
 * GHL Login - Simple: Log In + Send 2FA Code
 * 
 * One script, no fancy state management
 */

const { chromium } = require('playwright');
const path = require('path');

const GHL_EMAIL = 'flwrs_kmbrly@yahoo.com';
const GHL_PASSWORD = 'Kimmy0910!';

async function loginAndSendCode() {
  console.log('🚀 GHL Login + Send Code\n');

  let browser;
  let page;

  try {
    // Launch
    console.log('[1/4] Launching browser...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    // Navigate
    console.log('[2/4] Navigating to GHL...');
    await page.goto('https://app.gohighlevel.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Wait for form
    await page.waitForSelector('#email', { timeout: 10000 });

    // Log in
    console.log('[3/4] Logging in...');
    await page.locator('#email').fill(GHL_EMAIL);
    await page.waitForTimeout(200);
    await page.locator('#password').fill(GHL_PASSWORD);
    await page.waitForTimeout(200);
    await page.locator('button:has-text("Sign in")').click();

    // Wait for 2FA screen
    await page.waitForTimeout(2000);

    // Click "Send Security Code"
    console.log('[4/4] Clicking "Send Security Code"...');
    const sendBtn = page.locator('button:has-text("Send Security Code")');
    await sendBtn.click();

    console.log('     ✓ Waiting for confirmation...');
    await page.waitForTimeout(3000);

    // Take screenshot
    const screenshotPath = '/tmp/ghl-code-sent.png';
    await page.screenshot({ path: screenshotPath });

    console.log(`\n✅ Security Code Sent!\n`);
    console.log(`📨 Check your email: flwrs_kmbrly@yahoo.com`);
    console.log(`   for the 6-digit verification code\n`);
    console.log(`📸 Screenshot: ${screenshotPath}\n`);

    await browser.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (page) {
      try {
        await page.screenshot({ path: '/tmp/ghl-error.png' });
      } catch (e) {
        // Ignore
      }
    }
    if (browser) await browser.close();
    process.exit(1);
  }
}

loginAndSendCode();
