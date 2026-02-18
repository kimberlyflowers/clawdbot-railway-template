const { chromium } = require('playwright');

const GHL_EMAIL = 'flwrs_kmbrly@yahoo.com';
const GHL_PASSWORD = 'Kimmy0910!';

(async () => {
  console.log('🔍 Debugging Login Flow\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('[1] Navigating to login...');
    await page.goto('https://app.gohighlevel.com/', { waitUntil: 'domcontentloaded', timeout: 20000 });

    console.log('[2] Filling credentials...');
    await page.waitForSelector('#email', { timeout: 5000 });
    await page.locator('#email').fill(GHL_EMAIL);
    await page.waitForTimeout(200);
    await page.locator('#password').fill(GHL_PASSWORD);
    await page.waitForTimeout(200);

    console.log('[3] Submitting login...');
    await page.locator('button:has-text("Sign in")').click();
    
    console.log('[4] Waiting 2 seconds...');
    await page.waitForTimeout(2000);

    console.log('[5] Taking screenshot...');
    await page.screenshot({ path: '/tmp/ghl-debug-1.png' });

    console.log('[6] Checking page content...');
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 1000));
    console.log('\nPage content (first 1000 chars):');
    console.log(bodyText);

    console.log('\n[7] Checking all buttons:');
    const buttons = await page.evaluate(() => 
      Array.from(document.querySelectorAll('button')).map(b => b.innerText)
    );
    buttons.forEach(b => console.log(`  - ${b}`));

    console.log('\n[8] Checking for "Send" or "Security" text:');
    const hasSend = await page.evaluate(() => 
      document.body.innerText.includes('Send') || document.body.innerText.includes('Security')
    );
    console.log(`   Has "Send/Security"? ${hasSend}`);

    // Try alternate selectors
    console.log('\n[9] Trying alternate selectors:');
    const sendBtnAlt1 = await page.$('button:has-text("Send")');
    console.log(`   button:has-text("Send")? ${sendBtnAlt1 ? 'YES' : 'NO'}`);

    const sendBtnAlt2 = await page.$('[class*="security"]');
    console.log(`   [class*="security"]? ${sendBtnAlt2 ? 'YES' : 'NO'}`);

    const sendBtnAlt3 = await page.$$('button');
    console.log(`   Total buttons on page: ${sendBtnAlt3.length}`);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    await page.screenshot({ path: '/tmp/ghl-debug-error.png' });
    console.log('📸 Error screenshot: /tmp/ghl-debug-error.png');
  } finally {
    await browser.close();
  }
})();
