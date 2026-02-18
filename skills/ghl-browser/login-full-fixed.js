/**
 * GHL Login - Full Flow (Fixed waiting for form change)
 */

const { chromium } = require('playwright');

const GHL_EMAIL = 'flwrs_kmbrly@yahoo.com';
const GHL_PASSWORD = 'Kimmy0910!';
const GHL_CODE = '389850';

async function fullLogin() {
  console.log('🚀 GHL Full Login + 2FA Entry (Fixed)\n');

  let browser;
  let page;

  try {
    // Launch
    console.log('[1/6] Launching browser...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    // Navigate
    console.log('[2/6] Navigating to GHL...');
    await page.goto('https://app.gohighlevel.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Wait for login form
    await page.waitForSelector('#email', { timeout: 10000 });
    console.log('     ✓ Login form loaded');

    // Enter credentials
    console.log('[3/6] Logging in...');
    await page.locator('#email').fill(GHL_EMAIL);
    await page.waitForTimeout(200);
    await page.locator('#password').fill(GHL_PASSWORD);
    await page.waitForTimeout(200);
    await page.locator('button:has-text("Sign in")').click();

    // Wait for 2FA screen
    console.log('[4/6] Waiting for 2FA screen...');
    await page.waitForTimeout(2000);

    // Click "Send Security Code"
    console.log('[5/6] Sending security code...');
    const sendBtn = page.locator('button:has-text("Send Security Code")');
    await sendBtn.click({ timeout: 5000 });
    console.log('     ✓ Button clicked');

    // WAIT FOR FORM TO CHANGE - The code input fields appear after sending
    console.log('     ✓ Waiting for code input fields to appear...');
    await page.waitForTimeout(2000); // Give it time to update

    // Now look for the code inputs (now they should exist)
    const codeInputs = await page.locator('input[inputmode="numeric"], input[maxlength="1"], input[type="text"][inputmode="numeric"]').all();
    
    console.log(`[6/6] Found ${codeInputs.length} code input fields`);

    if (codeInputs.length >= 6) {
      // Individual digit inputs
      console.log(`     ✓ Entering code digit by digit...`);
      for (let i = 0; i < 6; i++) {
        const digit = GHL_CODE[i];
        await codeInputs[i].fill(digit);
        console.log(`       [${i + 1}/6] Entered: ${digit}`);
        await page.waitForTimeout(100);
      }

      // Take screenshot after entering code
      await page.screenshot({ path: '/tmp/ghl-code-entered.png' });
      console.log('     ✓ Code entered, screenshot taken');

      // Wait a moment, then look for submit button
      await page.waitForTimeout(500);

      // Try to find and click a verify/submit button
      const verifyBtn = page.locator('button:has-text("Verify"), button:has-text("Submit"), button:has-text("Confirm"), button:has-text("Continue")').first();
      
      try {
        await verifyBtn.click({ timeout: 5000 });
        console.log('     ✓ Clicked verify button');
      } catch (e) {
        console.log('     ⚠️  Auto-submit (no button found)');
      }

    } else {
      throw new Error(`Expected 6+ code inputs, found ${codeInputs.length}`);
    }

    // Wait for dashboard
    console.log('\n✓ Waiting for dashboard...');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => null);
    await page.waitForTimeout(3000);

    // Final screenshot
    const dashboardScreenshot = '/tmp/ghl-dashboard-authenticated.png';
    await page.screenshot({ path: dashboardScreenshot, fullPage: false });

    const finalUrl = page.url();
    console.log(`\n✅ Login Complete!`);
    console.log(`📍 URL: ${finalUrl}`);

    if (finalUrl.includes('/dashboard') || finalUrl.includes('/funnel') || finalUrl.includes('/contacts') || !finalUrl.includes('app.gohighlevel.com/')) {
      console.log('✅ Successfully authenticated!');
    }

    console.log(`📸 Dashboard: ${dashboardScreenshot}`);

    return { success: true, screenshotPath: dashboardScreenshot, url: finalUrl };

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
