const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('https://app.gohighlevel.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('#email', { timeout: 10000 });
  
  await page.locator('#email').fill('flwrs_kmbrly@yahoo.com');
  await page.waitForTimeout(150);
  await page.locator('#password').fill('Kimmy0910!');
  await page.waitForTimeout(150);
  await page.locator('button:has-text("Sign in")').click();

  await page.waitForTimeout(1500);
  
  const sendBtn = page.locator('button:has-text("Send Security Code")');
  await sendBtn.click({ timeout: 5000 });

  await page.waitForTimeout(1500);

  const allInputs = await page.locator('input').all();
  console.log(`Total inputs: ${allInputs.length}`);
  
  for (let i = 0; i < allInputs.length; i++) {
    const inputmode = await allInputs[i].getAttribute('inputmode');
    const maxlength = await allInputs[i].getAttribute('maxlength');
    if (inputmode || maxlength) {
      console.log(`Input ${i}: inputmode=${inputmode}, maxlength=${maxlength}`);
    }
  }

  await page.screenshot({ path: '/tmp/debug.png' });
  console.log('Screenshot: /tmp/debug.png');
  
  await browser.close();
})();
