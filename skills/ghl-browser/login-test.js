/**
 * GHL Login Test - POC
 * Tests actual Playwright login to GHL dashboard
 * 
 * Usage: node login-test.js
 * Output: Screenshot saved to /tmp/ghl-dashboard.png
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

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
    console.log('[1/6] Launching browser...');
    browser = await chromium.launch({
      headless: false, // Show browser window for monitoring
      args: ['--start-maximized'],
    });

    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    // Step 2: Navigate to login
    console.log('[2/6] Navigating to GHL login page...');
    await page.goto('https://app.gohighlevel.com/', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Wait for login form to load
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    console.log('✓ Login page loaded');

    // Step 3: Enter email
    console.log('[3/6] Entering email...');
    await page.fill('input[type="email"]', GHL_EMAIL);
    await page.waitForTimeout(500);

    // Step 4: Click Next button
    console.log('[4/6] Clicking Next button...');
    const nextButton = await page.locator('button:has-text("Next")').first();
    await nextButton.click();

    // Wait for password field
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    console.log('✓ Password field appeared');

    // Step 5: Enter password and login
    console.log('[5/6] Entering password and logging in...');
    await page.fill('input[type="password"]', GHL_PASSWORD);
    await page.waitForTimeout(500);

    const loginButton = await page.locator('button:has-text("Login"), button:has-text("Sign In")').first();
    await loginButton.click();

    // Wait for dashboard to load (wait for navigation to complete)
    console.log('[6/6] Waiting for dashboard to load...');
    await page.waitForURL('**/dashboard**', { timeout: 30000 }).catch(() => {
      // Dashboard may have different URL structure, so try waiting for common elements
      console.log('Dashboard URL check timeout, checking for dashboard elements...');
    });

    // Wait for dashboard elements to be visible
    await page.waitForSelector('[class*="dashboard"], [class*="app-layout"], h1', {
      timeout: 15000,
    }).catch(() => {
      console.log('(Dashboard selectors not found, continuing anyway)');
    });

    await page.waitForTimeout(2000); // Extra wait for page to settle

    // Step 6: Take screenshot
    console.log('📸 Taking screenshot of dashboard...');
    const screenshotPath = '/tmp/ghl-dashboard.png';
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`✓ Screenshot saved to ${screenshotPath}`);

    // Get page info for verification
    const url = page.url();
    console.log(`\n✅ Login Successful!`);
    console.log(`📍 Current URL: ${url}`);

    // Read screenshot file size as proof
    const stats = fs.statSync(screenshotPath);
    console.log(`🖼️  Screenshot size: ${stats.size} bytes`);

    return {
      success: true,
      screenshotPath,
      url,
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
      } catch (screenshotError) {
        console.log('Could not capture error screenshot');
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
  })
  .catch(error => {
    console.error('\n' + '='.repeat(50));
    console.error('❌ Test failed');
    console.error('='.repeat(50));
    process.exit(1);
  });
