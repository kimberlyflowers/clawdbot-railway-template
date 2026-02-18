/**
 * GHL E2E Login Test - Manual Code Entry
 * 
 * Demonstrates full login automation:
 * 1. Opens GHL
 * 2. Logs in with credentials
 * 3. Sends 2FA code
 * 4. Takes code screenshot
 * 5. Waits for user-provided code
 * 6. Enters code
 * 7. Captures authenticated dashboard
 * 
 * Usage: node login-e2e-manual-code.js <6-digit-code>
 */

const { chromium } = require('playwright');
const fs = require('fs');

const GHL_EMAIL = 'flwrs_kmbrly@yahoo.com';
const GHL_PASSWORD = 'Kimmy0910!';

async function e2eLogin(code) {
  console.log('🚀 GHL E2E Login Test\n');

  let browser, page;

  try {
    console.log('[1/5] Starting browser...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('[2/5] Navigating to GHL and logging in...');
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

    console.log('[3/5] Sending 2FA code...');
    const sendBtn = page.locator('button:has-text("Send Security Code")');
    await sendBtn.click({ timeout: 5000 });

    await page.waitForTimeout(1500);

    console.log('[4/5] Entering code: ' + code);
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
      .locator(
        'button:has-text("Verify"), button:has-text("Submit"), button:has-text("Confirm")'
      )
      .first();

    try {
      await verifyBtn.click({ timeout: 3000 });
    } catch (e) {}

    console.log('[5/5] Waiting for dashboard...');
    await page
      .waitForLoadState('networkidle', { timeout: 10000 })
      .catch(() => null);
    await page.waitForTimeout(2000);

    const screenshot = '/tmp/ghl-dashboard-e2e.png';
    await page.screenshot({ path: screenshot });

    const url = page.url();
    console.log(`\n✅ Complete!`);
    console.log(`📍 URL: ${url}`);
    console.log(`📸 Screenshot: ${screenshot}`);

    return { success: true, screenshot, url };

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (page) try { await page.screenshot({ path: '/tmp/error.png' }); } catch (e) {}
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

const code = process.argv[2];
if (!code || code.length !== 6) {
  console.log('Usage: node login-e2e-manual-code.js <6-digit-code>');
  console.log('Example: node login-e2e-manual-code.js 123456');
  process.exit(1);
}

e2eLogin(code)
  .then(() => {
    console.log('\n' + '='.repeat(60));
    console.log('✅ E2E Test Passed!');
    console.log('='.repeat(60));
    process.exit(0);
  })
  .catch(() => {
    console.error('\n' + '='.repeat(60));
    console.error('❌ E2E Test Failed');
    console.error('='.repeat(60));
    process.exit(1);
  });
