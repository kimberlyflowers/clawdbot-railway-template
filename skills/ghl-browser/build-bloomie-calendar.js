const { chromium } = require('playwright');
const SessionManager = require('./session-manager');

(async () => {
  let browser, context, page;

  try {
    console.log('🚀 Building Bloomie Discovery Call Calendar\n');

    const session = SessionManager.loadSession();
    if (!session) throw new Error('No saved session');

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    context = await browser.newContext({ storageState: session });
    page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('[1/5] Navigating to GHL dashboard...');
    await page.goto('https://app.gohighlevel.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForTimeout(2000);

    console.log('[2/5] Looking for calendar/booking section...');
    // Try to find calendar/booking navigation
    const sidebarLinks = await page.locator('a, [role="menuitem"], button').allTextContents();
    console.log('   Available nav options:', sidebarLinks.slice(0, 10));

    // Take screenshot of current state
    await page.screenshot({ path: '/tmp/ghl-dashboard-current.png' });
    console.log('   📸 Screenshot: /tmp/ghl-dashboard-current.png');

    console.log('\n✅ Dashboard accessed');
    console.log('📍 URL:', page.url());
    console.log('\n⚠️  NEXT: Manual calendar setup needed');
    console.log('   GHL calendar creation varies by account type');
    console.log('   Need to identify exact navigation path');

    await browser.close();

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
})();
