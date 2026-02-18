const { chromium } = require('playwright');

async function debugPage() {
  console.log('🔍 Debugging GHL Login Page\n');

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('[1] Navigating to GHL...');
    await page.goto('https://app.gohighlevel.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    console.log('[2] Page loaded. Waiting 2 seconds for JS to render...');
    await page.waitForTimeout(2000);

    console.log('[3] Taking screenshot...');
    await page.screenshot({ path: '/tmp/ghl-debug.png' });
    console.log('✓ Screenshot saved to /tmp/ghl-debug.png');

    console.log('\n[4] Checking page content...');
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);

    const url = page.url();
    console.log(`Current URL: ${url}`);

    console.log('\n[5] Looking for input fields...');
    const inputs = await page.locator('input').all();
    console.log(`Total input fields found: ${inputs.length}`);

    for (let i = 0; i < Math.min(inputs.length, 5); i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      const id = await input.getAttribute('id');
      console.log(`  Input ${i}: type="${type}", placeholder="${placeholder}", id="${id}"`);
    }

    console.log('\n[6] Looking for buttons...');
    const buttons = await page.locator('button').all();
    console.log(`Total buttons found: ${buttons.length}`);

    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const btn = buttons[i];
      const text = await btn.textContent();
      console.log(`  Button ${i}: "${text}"`);
    }

    console.log('\n[7] HTML snippet of body (first 1000 chars)...');
    const html = await page.content();
    console.log(html.substring(0, 1000));

    await browser.close();
    console.log('\n✓ Debug complete');

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (browser) await browser.close();
  }
}

debugPage();
