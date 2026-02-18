const { chromium } = require('playwright');

const GHL_EMAIL = 'flwrs_kmbrly@yahoo.com';
const GHL_PASSWORD = 'Kimmy0910!';

async function debug() {
  console.log('🔍 Debugging 2FA Form Structure\n');

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    // Login
    console.log('[1] Logging in...');
    await page.goto('https://app.gohighlevel.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForSelector('#email', { timeout: 10000 });
    await page.locator('#email').fill(GHL_EMAIL);
    await page.waitForTimeout(200);
    await page.locator('#password').fill(GHL_PASSWORD);
    await page.waitForTimeout(200);
    await page.locator('button:has-text("Sign in")').click();

    await page.waitForTimeout(2000);

    console.log('[2] Analyzing 2FA form...\n');

    // Look for all inputs
    const allInputs = await page.locator('input').all();
    console.log(`Total inputs: ${allInputs.length}\n`);

    for (let i = 0; i < allInputs.length; i++) {
      const input = allInputs[i];
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      const maxlength = await input.getAttribute('maxlength');
      const inputmode = await input.getAttribute('inputmode');
      const placeholder = await input.getAttribute('placeholder');
      
      console.log(`Input ${i}:`);
      if (type) console.log(`  type: ${type}`);
      if (name) console.log(`  name: ${name}`);
      if (id) console.log(`  id: ${id}`);
      if (maxlength) console.log(`  maxlength: ${maxlength}`);
      if (inputmode) console.log(`  inputmode: ${inputmode}`);
      if (placeholder) console.log(`  placeholder: ${placeholder}`);
      console.log('');
    }

    // Look for buttons
    const allButtons = await page.locator('button').all();
    console.log(`\nTotal buttons: ${allButtons.length}\n`);

    for (let i = 0; i < allButtons.length; i++) {
      const btn = allButtons[i];
      const text = await btn.textContent();
      const id = await btn.getAttribute('id');
      console.log(`Button ${i}: "${text.trim()}" (id: ${id || 'none'})`);
    }

    // Check for divs with data attributes (common in OTP forms)
    const digitBoxes = await page.locator('[class*="code"], [class*="digit"], [class*="otp"]').all();
    console.log(`\n\nDigit boxes (class*="code/digit/otp"): ${digitBoxes.length}`);

    // Take screenshot
    console.log('\nTaking screenshot...');
    await page.screenshot({ path: '/tmp/ghl-2fa-debug.png' });
    console.log('Screenshot saved to /tmp/ghl-2fa-debug.png');

    await browser.close();

  } catch (error) {
    console.error('Error:', error.message);
    if (browser) await browser.close();
  }
}

debug();
