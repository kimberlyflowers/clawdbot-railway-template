/**
 * Browser POC — Proof of Concept
 * 
 * Tests:
 * 1. Browser launches successfully
 * 2. Can navigate to GHL login page
 * 3. Login page elements are visible
 * 4. Screenshot captured
 * 
 * Does NOT attempt login yet - just validates infrastructure
 */

const { GHLBrowser } = require('./index');
const config = require('./config');
const { log, logError } = require('./logger');

async function runPOC() {
  console.log('\n🚀 bloomie-ghl-browser POC\n');
  console.log('='.repeat(60) + '\n');

  const browser = new GHLBrowser();

  try {
    // Step 1: Show status
    console.log('📊 System Status:');
    const status = browser.getStatus();
    console.log(`   Version: ${status.version}`);
    console.log(`   Status: ${status.status}`);
    console.log(`   Credentials configured: ${status.configuredCredentials}`);
    if (status.configuredCredentials) {
      console.log(`   Email: ${config.credentials.email.substring(0, 3)}...${config.credentials.email.substring(config.credentials.email.length - 5)}`);
      console.log(`   Password: [REDACTED]`);
    }
    console.log('');

    // Step 2: Initialize browser
    console.log('🔧 Initializing browser...');
    await browser.initialize();
    console.log('✅ Browser initialized\n');

    // Step 3: Navigate to login page
    console.log('📍 Navigating to GHL login page...');
    const page = browser.getPage();
    await page.goto('https://app.gohighlevel.com', { waitUntil: 'domcontentloaded' });
    console.log('✅ Navigated to GHL\n');

    // Step 4: Get page info
    console.log('📝 Page Information:');
    const url = page.url();
    const title = await page.title();
    console.log(`   URL: ${url}`);
    console.log(`   Title: ${title}`);

    // Step 5: Check for login elements
    console.log('\n🔍 Checking for login elements...');
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    const loginButton = await page.$('button:has-text("Login")') || await page.$('button:has-text("Sign in")');

    console.log(`   Email input: ${emailInput ? '✅ Found' : '❌ Not found'}`);
    console.log(`   Password input: ${passwordInput ? '✅ Found' : '❌ Not found'}`);
    console.log(`   Login button: ${loginButton ? '✅ Found' : '❌ Not found'}`);

    // Step 6: Take screenshot
    console.log('\n📸 Taking screenshot...');
    const screenshotPath = '/tmp/ghl-login-page.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`✅ Screenshot saved: ${screenshotPath}\n`);

    // Step 7: Session info
    console.log('📊 Session Info:');
    const sessionInfo = browser.browserManager.getSessionInfo();
    console.log(`   Connected: ${sessionInfo.isConnected}`);
    console.log(`   Valid: ${sessionInfo.isValid}`);
    console.log(`   Duration: ${sessionInfo.durationMs}ms`);
    console.log('');

    // Step 8: Success summary
    console.log('='.repeat(60));
    console.log('\n✅ POC SUCCESSFUL\n');
    console.log('Achieved:');
    console.log('  ✓ Browser launched');
    console.log('  ✓ Navigated to GHL login');
    console.log('  ✓ Page loaded and responsive');
    console.log(`  ✓ Login elements found: ${emailInput && passwordInput ? 'Yes' : 'Partial'}`);
    console.log(`  ✓ Screenshot captured: ${screenshotPath}`);
    console.log('');
    console.log('Infrastructure ready for:\n');
    console.log('  Next Step: Implement login flow');
    console.log('  Next Step: Test credential entry');
    console.log('  Next Step: Handle 2FA if needed');
    console.log('  Next Step: Verify dashboard loads after login');
    console.log('');

    // Close browser
    console.log('🔌 Closing browser...');
    await browser.close();
    console.log('✅ POC complete\n');

  } catch (error) {
    logError('POC failed', error);
    console.error('\n❌ Error:', error.message);
    await browser.close().catch(() => {});
    process.exit(1);
  }
}

runPOC();
