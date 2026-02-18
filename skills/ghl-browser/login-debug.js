const { chromium } = require('playwright');
const SessionManager = require('./session-manager');

async function debugLogin() {
  console.log('🔍 Debugging 2FA input structure\n');

  let browser, context, page;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    context = await browser.newContext();
    page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('[1] Navigating...');
    await page.goto('https://app.gohighlevel.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    console.log('[2] Logging in...');
    await page.waitForSelector('#email', { timeout: 10000 });
    await page.locator('#email').fill('flwrs_kmbrly@yahoo.com');
    await page.waitForTimeout(150);
    await page.locator('#password').fill('Kimmy0910!');
    await page.waitForTimeout(150);
    await page.locator('button:has-text("Sign in")').click();

    await page.waitForTimeout(2000);

    console.log('[3] Sending code...');
    const sendBtn = page.locator('button:has-text("Send Security Code")');
    await sendBtn.click({ timeout: 5000 });

    await page.waitForTimeout(2000);

    // Debug: Find all inputs
    console.log('[4] Inspecting 2FA form...');
    const allInputs = await page.locator('input').all();
    console.log(`   Total inputs on page: ${allInputs.length}`);

    for (let i = 0; i < allInputs.length; i++) {
      const type = await allInputs[i].getAttribute('type');
      const maxlen = await allInputs[i].getAttribute('maxlength');
      const name = await allInputs[i].getAttribute('name');
      const placeholder = await allInputs[i].getAttribute('placeholder');
      console.log(`   [${i}] type=${type}, maxlength=${maxlen}, name=${name}, placeholder=${placeholder}`);
    }

    // Try to find code inputs by other selectors
    console.log('\n[5] Looking for code digit containers...');
    const codeInputs = await page.locator('[data-testid*="code"], [name*="code"], [placeholder*="digit"]').all();
    console.log(`   Found: ${codeInputs.length}`);

    // Look at form structure
    console.log('\n[6] Checking for form/label structure...');
    const html = await page.evaluate(() => document.body.innerHTML.substring(0, 3000));
    console.log(html);

    // Take screenshot
    const screenshot = '/tmp/ghl-2fa-debug.png';
    await page.screenshot({ path: screenshot });
    console.log(`\n📸 Screenshot: ${screenshot}`);

    await browser.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (page) {
      try {
        await page.screenshot({ path: '/tmp/ghl-debug-error.png' });
      } catch (e) {}
    }
    process.exit(1);
  }
}

debugLogin();
