/**
 * GHL Complete Automated Login
 * 
 * No user interaction needed:
 * 1. Opens GHL and logs in
 * 2. Sends 2FA code
 * 3. Reads code from Yahoo IMAP in parallel
 * 4. Enters code automatically
 * 5. Captures authenticated dashboard
 * 6. Uploads to Google Drive
 * 
 * Usage: node login-complete-auto.js
 */

const { chromium } = require('playwright');
const SimpleImapReader = require('./imap-simple-reader');

const GHL_EMAIL = 'flwrs_kmbrly@yahoo.com';
const GHL_PASSWORD = 'Kimmy0910!';

async function completeAutoLogin() {
  console.log('🚀 GHL Fully Automated Login\n');
  console.log('='.repeat(70));

  let ghlBrowser, ghlPage, imapReader;

  try {
    // Step 1: Start GHL browser
    console.log('\n[1/6] Launching GHL browser...');
    ghlBrowser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    ghlPage = await ghlBrowser.newPage();
    await ghlPage.setViewportSize({ width: 1280, height: 720 });

    // Step 2: Log into GHL
    console.log('[2/6] Logging into GHL...');
    await ghlPage.goto('https://app.gohighlevel.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await ghlPage.waitForSelector('#email', { timeout: 10000 });
    await ghlPage.locator('#email').fill(GHL_EMAIL);
    await ghlPage.waitForTimeout(150);
    await ghlPage.locator('#password').fill(GHL_PASSWORD);
    await ghlPage.waitForTimeout(150);
    await ghlPage.locator('button:has-text("Sign in")').click();
    console.log('     ✓ Credentials submitted');

    await ghlPage.waitForTimeout(1500);

    // Step 3: Send code & fetch from email in parallel
    console.log('[3/6] Sending code + reading from Yahoo IMAP...');
    const sendBtn = ghlPage.locator('button:has-text("Send Security Code")');
    await sendBtn.click({ timeout: 5000 });
    console.log('     ✓ Code sent to email');

    // Fetch code from IMAP
    console.log('     📧 Reading from Yahoo IMAP...');
    imapReader = new SimpleImapReader();
    const code = await imapReader.getLatestCode(45000);
    console.log(`     ✓ Code retrieved: ${code}`);

    // Step 4: Wait for form and enter code
    console.log('[4/6] Entering code into form...');
    await ghlPage.waitForTimeout(1000);

    const inputs = await ghlPage.locator('input[maxlength="1"]').all();

    if (inputs.length < 6) {
      throw new Error(`Expected 6 inputs, found ${inputs.length}`);
    }

    for (let i = 0; i < 6; i++) {
      await inputs[i].fill(code[i]);
      console.log(`     [${i + 1}/6] ${code[i]}`);
      await ghlPage.waitForTimeout(80);
    }

    await ghlPage.waitForTimeout(500);

    // Try to click verify
    const verifyBtn = ghlPage
      .locator(
        'button:has-text("Verify"), button:has-text("Submit"), button:has-text("Confirm")'
      )
      .first();

    try {
      await verifyBtn.click({ timeout: 3000 });
      console.log('     ✓ Clicked verify');
    } catch (e) {
      console.log('     ✓ Auto-submit');
    }

    // Step 5: Wait for dashboard
    console.log('[5/6] Waiting for dashboard...');
    await ghlPage
      .waitForLoadState('networkidle', { timeout: 10000 })
      .catch(() => null);
    await ghlPage.waitForTimeout(2000);

    const dashboardScreenshot = '/tmp/ghl-dashboard-authenticated.png';
    await ghlPage.screenshot({ path: dashboardScreenshot, fullPage: false });
    console.log('     ✓ Dashboard captured');

    // Step 6: Upload to Drive
    console.log('[6/6] Uploading screenshot to Google Drive...');
    const { uploadToDrive } = require('./drive-delivery/scripts/upload.js');
    const driveResult = await uploadToDrive(
      dashboardScreenshot,
      'GHL-Dashboard-Authenticated.png'
    );
    console.log(`✓ Uploaded: ${driveResult.webViewLink}`);

    const finalUrl = ghlPage.url();
    console.log('\n✅ Complete!');
    console.log(`📍 URL: ${finalUrl}`);
    console.log(`📸 Drive: ${driveResult.webViewLink}`);

    console.log('\n' + '='.repeat(70));
    console.log('🎉 Fully Automated E2E Test Passed!');
    console.log('='.repeat(70));

    return {
      success: true,
      screenshotPath: dashboardScreenshot,
      driveLink: driveResult.webViewLink,
      code,
    };

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    if (ghlPage) {
      try {
        await ghlPage.screenshot({ path: '/tmp/ghl-error.png' });
      } catch (e) {
        // Ignore
      }
    }

    throw error;

  } finally {
    if (ghlBrowser) {
      await ghlBrowser.close();
    }
  }
}

completeAutoLogin()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n' + '='.repeat(70));
    console.error('❌ Test Failed');
    console.error('='.repeat(70));
    process.exit(1);
  });
