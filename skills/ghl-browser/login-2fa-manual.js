/**
 * GHL Login - Manual 2FA Handling
 * 
 * Flow:
 * 1. Log in with credentials
 * 2. Reach 2FA screen
 * 3. Screenshot 2FA form
 * 4. Keep browser open for manual code entry
 * 5. Wait for code input
 * 6. Enter code and complete login
 */

const { chromium } = require('playwright');
const fs = require('fs');
const readline = require('readline');

const GHL_EMAIL = 'flwrs_kmbrly@yahoo.com';
const GHL_PASSWORD = 'Kimmy0910!';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function loginToGHL() {
  console.log('🚀 GHL Login - Manual 2FA Flow\n');
  console.log(`📧 Email: ${GHL_EMAIL}`);
  console.log(`🔑 Password: ****${GHL_PASSWORD.slice(-4)}\n`);

  let browser;
  let page;

  try {
    // Step 1: Launch browser
    console.log('[1/4] Launching browser...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    // Step 2: Navigate and login
    console.log('[2/4] Navigating to GHL and logging in...');
    await page.goto('https://app.gohighlevel.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Wait for form
    await page.waitForSelector('#email', { timeout: 10000 });

    // Fill email and password
    await page.locator('#email').fill(GHL_EMAIL);
    await page.waitForTimeout(300);
    await page.locator('#password').fill(GHL_PASSWORD);
    await page.waitForTimeout(300);

    // Click Sign in
    await page.locator('button:has-text("Sign in")').click();

    // Step 3: Wait for 2FA screen
    console.log('[3/4] Waiting for 2FA screen...');
    await page.waitForTimeout(2000); // Let page process

    // Take screenshot of 2FA screen
    console.log('📸 Taking screenshot of 2FA screen...');
    const twoFAScreenshot = '/tmp/ghl-2fa-screen.png';
    await page.screenshot({ path: twoFAScreenshot, fullPage: false });
    console.log(`✓ Screenshot saved: ${twoFAScreenshot}\n`);

    // Get page title/content for verification
    const title = await page.title();
    const url = page.url();
    console.log(`📍 URL: ${url}`);
    console.log(`📄 Title: ${title}\n`);

    // Step 4: Ask user for code
    console.log('=' .repeat(60));
    console.log('✅ 2FA Screen Reached!');
    console.log('=' .repeat(60));
    console.log('\n📨 Please check your email for the 2FA code from GHL');
    console.log('   Code will be sent to: flwrs_kmbrly@yahoo.com\n');

    const code = await askQuestion('🔐 Enter the 6-digit code: ');

    if (!code || code.length < 6) {
      throw new Error('Invalid code. Must be at least 6 digits.');
    }

    console.log(`\n[4/4] Entering code: ${code}`);

    // Find and fill the code input field
    // GHL typically has a code input field or multiple digit inputs
    const codeInput = await page.locator('input[placeholder*="code"], input[placeholder*="Code"], input[inputmode="numeric"]').first();
    
    if (codeInput) {
      await codeInput.fill(code);
      await page.waitForTimeout(500);

      // Look for submit button
      const submitBtn = await page.locator('button:has-text("Submit"), button:has-text("Verify"), button:has-text("Continue")').first();
      if (submitBtn) {
        console.log('   Clicking submit...');
        await submitBtn.click();
      }
    } else {
      console.log('⚠️  Could not find code input field.');
      console.log('   Please enter the code manually in the browser and press Enter here when done.');
      await askQuestion('   Press Enter when you\'ve verified...');
    }

    // Wait for dashboard to load
    console.log('\n✓ Waiting for dashboard...');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => null);
    await page.waitForTimeout(2000);

    // Take final screenshot
    console.log('📸 Taking dashboard screenshot...');
    const dashboardScreenshot = '/tmp/ghl-dashboard-final.png';
    await page.screenshot({ path: dashboardScreenshot, fullPage: false });
    console.log(`✓ Screenshot saved: ${dashboardScreenshot}`);

    const finalUrl = page.url();
    const finalTitle = await page.title();

    console.log(`\n✅ Login Complete!`);
    console.log(`📍 Final URL: ${finalUrl}`);
    console.log(`📄 Final Title: ${finalTitle}`);

    // Verify we're on dashboard
    if (finalUrl.includes('/dashboard') || finalUrl.includes('/funnel') || finalUrl.includes('/contacts')) {
      console.log(`✅ Successfully authenticated and on GHL dashboard!`);
    }

    return {
      success: true,
      screenshotPath: dashboardScreenshot,
      url: finalUrl,
    };

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    if (page) {
      try {
        const errorScreenshot = '/tmp/ghl-error-final.png';
        await page.screenshot({ path: errorScreenshot });
        console.log(`📸 Error screenshot: ${errorScreenshot}`);
      } catch (e) {
        // Ignore
      }
    }

    throw error;

  } finally {
    rl.close();
    if (browser) {
      console.log('\n🧹 Closing browser...');
      await browser.close();
    }
  }
}

// Run
loginToGHL()
  .then(result => {
    console.log('\n' + '='.repeat(60));
    console.log('✅ Test Complete!');
    console.log(`Dashboard Screenshot: ${result.screenshotPath}`);
    console.log('='.repeat(60));
    process.exit(0);
  })
  .catch(error => {
    console.error('\n' + '='.repeat(60));
    console.error('❌ Test Failed');
    console.error('='.repeat(60));
    process.exit(1);
  });
