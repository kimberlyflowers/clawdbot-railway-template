const { chromium } = require('playwright');

const CODE = '131238';

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await browser.newPage();
  
  try {
    console.log('Logging in...');
    await page.goto('https://app.gohighlevel.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('#email', { timeout: 10000 });
    
    await page.locator('#email').fill('flwrs_kmbrly@yahoo.com');
    await page.waitForTimeout(150);
    await page.locator('#password').fill('Kimmy0910!');
    await page.waitForTimeout(150);
    await page.locator('button:has-text("Sign in")').click();

    await page.waitForTimeout(1500);
    
    console.log('Sending code...');
    const sendBtn = page.locator('button:has-text("Send Security Code")');
    await sendBtn.click({ timeout: 5000 });

    await page.waitForTimeout(1500);

    console.log(`Entering code: ${CODE}`);
    const inputs = await page.locator('input[maxlength="1"]').all();
    console.log(`Found ${inputs.length} digit inputs`);
    
    for (let i = 0; i < 6 && i < inputs.length; i++) {
      await inputs[i].fill(CODE[i]);
      console.log(`  [${i+1}/6] ${CODE[i]}`);
      await page.waitForTimeout(80);
    }

    await page.waitForTimeout(500);
    console.log('Waiting for dashboard...');

    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => null);
    await page.waitForTimeout(2000);

    await page.screenshot({ path: '/tmp/ghl-authenticated.png' });

    const url = page.url();
    console.log(`\n✅ URL: ${url}`);

    if (!url.includes('app.gohighlevel.com/') || url.includes('/dashboard') || url.includes('/contacts') || url.includes('/funnel')) {
      console.log('✅ AUTHENTICATED!');
    }

  } catch (error) {
    console.error('❌', error.message);
    try { await page.screenshot({ path: '/tmp/error.png' }); } catch (e) {}
  } finally {
    await browser.close();
  }
})();
