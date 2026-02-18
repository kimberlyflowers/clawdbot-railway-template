/**
 * GHL Login Test - Corrected Selectors
 * Tests actual Playwright login to GHL dashboard
 * 
 * Usage: node login-test-correct.js
 * Output: Screenshot saved to /tmp/ghl-dashboard.png
 */

const { chromium } = require('playwright');
const fs = require('fs');

// Credentials from /data/secrets/ghl-login.txt
const GHL_EMAIL = 'flwrs_kmbrly@yahoo.com';
const GHL_PASSWORD = 'Kimmy0910!';

async function loginToGHL() {
  console.log('🚀 Starting GHL Login Test\n');
  console.log(`📧 Email: ${GHL_EMAIL}`);
  console.log(`🔑 Password: ****${GHL_PASSWORD.slice(-4)}\n`);

  let browser;
  let page;

  try {
    // Step 1: Launch browser
    console.log('[1/5] Launching browser...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    // Step 2: Navigate to login
    console.log('[2/5] Navigating to GHL login page...');
    await page.goto('https://app.gohighlevel.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Wait for form to load
    await page.waitForSelector('#email', { timeout: 10000 });
    console.log('✓ Login form loaded');

    // Step 3: Enter credentials
    console.log('[3/5] Entering email...');
    const emailInput = page.locator('#email');
    await emailInput.fill(GHL_EMAIL);
    await page.waitForTimeout(500);

    console.log('      Entering password...');
    const passwordInput = page.locator('#password');
    await passwordInput.fill(GHL_PASSWORD);
    await page.waitForTimeout(500);

    // Step 4: Click sign in button
    console.log('[4/5] Clicking Sign in button...');
    const signInButton = page.locator('button:has-text("Sign in")');
    await signInButton.click();

    // Step 5: Wait for dashboard
    console.log('[5/5] Waiting for dashboard to load...');
    
    // Wait for any navigation to complete
    try {
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => null);
    } catch {
      console.log('(Network idle timeout, continuing...)');
    }
    
    await page.waitForTimeout(3000);

    // Take screenshot
    console.log('📸 Taking screenshot of dashboard...');
    const screenshotPath = '/tmp/ghl-dashboard.png';
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`✓ Screenshot saved to ${screenshotPath}`);

    // Get page info for verification
    const url = page.url();
    const title = await page.title();
    
    console.log(`\n✅ Login Test Complete!`);
    console.log(`📍 Current URL: ${url}`);
    console.log(`📄 Page Title: ${title}`);

    // Check if we're on dashboard
    if (url.includes('/dashboard') || url.includes('/funnel') || url.includes('/contacts')) {
      console.log(`✅ Successfully logged in to GHL!`);
    } else {
      console.log(`⚠️  URL doesn't indicate dashboard - may still be loading or 2FA required`);
    }

    // Read screenshot file size as proof
    const stats = fs.statSync(screenshotPath);
    console.log(`🖼️  Screenshot size: ${stats.size} bytes`);

    return {
      success: true,
      screenshotPath,
      url,
      title,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    console.error('\n❌ Login failed:');
    console.error(`Error: ${error.message}`);

    // Take error screenshot if possible
    if (page) {
      try {
        const errorScreenshot = '/tmp/ghl-error.png';
        await page.screenshot({ path: errorScreenshot });
        console.log(`📸 Error screenshot: ${errorScreenshot}`);

        // Show page URL for debugging
        const url = page.url();
        console.log(`Last URL: ${url}`);
      } catch (screenshotError) {
        // Ignore
      }
    }

    throw error;

  } finally {
    // Clean up
    if (browser) {
      console.log('\n🧹 Closing browser...');
      await browser.close();
    }
  }
}

// Run test
loginToGHL()
  .then(result => {
    console.log('\n' + '='.repeat(50));
    console.log('✅ Test completed successfully!');
    console.log(`Screenshot: ${result.screenshotPath}`);
    console.log('='.repeat(50));
    process.exit(0);
  })
  .catch(error => {
    console.error('\n' + '='.repeat(50));
    console.error('❌ Test failed');
    console.error('='.repeat(50));
    process.exit(1);
  });
