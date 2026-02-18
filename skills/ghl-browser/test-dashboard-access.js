const { chromium } = require('playwright');
const SessionManager = require('./session-manager');

(async () => {
  console.log('Testing saved session + dashboard access...\n');

  let browser, context, page;

  try {
    const session = SessionManager.loadSession();
    if (!session) throw new Error('No saved session');

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    context = await browser.newContext({ storageState: session });
    page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('Navigating to GHL dashboard...');
    await page.goto('https://app.gohighlevel.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForTimeout(2000);

    const url = page.url();
    const title = await page.title();

    console.log(`✓ URL: ${url}`);
    console.log(`✓ Title: ${title}\n`);

    // Check for key dashboard elements
    const hasNav = await page.locator('[class*="nav"], [class*="sidebar"], nav').count();
    const hasContent = await page.locator('[class*="content"], main').count();

    console.log(`Navigation elements: ${hasNav > 0 ? '✓' : '✗'}`);
    console.log(`Content area: ${hasContent > 0 ? '✓' : '✗'}\n`);

    // Take screenshot
    await page.screenshot({ path: '/tmp/ghl-dashboard-test.png' });
    console.log('✓ Screenshot saved to /tmp/ghl-dashboard-test.png');

    console.log('\n✅ Dashboard access confirmed!');

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
