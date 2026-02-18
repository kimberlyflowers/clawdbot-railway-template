const { chromium } = require('playwright');
const SessionManager = require('./session-manager');

async function verifyFunnel() {
  console.log('🔍 Verifying Bloomie Funnel - Wait for App Load\n');

  let browser, page;

  try {
    const session = SessionManager.loadSession();
    if (!session) {
      throw new Error('No session found');
    }

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    const context = await browser.newContext({ storageState: session });
    page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });

    console.log('[1] Navigating to Funnels page...');
    await page.goto('https://app.gohighlevel.com/funnels', {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    });

    console.log('[2] Waiting for JavaScript app to initialize...');
    // Wait for loading spinner to disappear or for content to appear
    try {
      await page.waitForFunction(
        () => !document.body.textContent.includes('Initializing'),
        { timeout: 15000 }
      );
      console.log('   ✓ App initialized');
    } catch (e) {
      console.log('   ⚠️  Initialization timeout, continuing anyway');
    }

    await page.waitForTimeout(2000);

    console.log('[3] Searching for Bloomie funnel...');
    const pageText = await page.textContent('body');
    
    if (pageText && pageText.includes('Bloomie')) {
      console.log('✅ FOUND: Bloomie appears on page!');
      const idx = pageText.indexOf('Bloomie');
      const context = pageText.substring(Math.max(0, idx - 50), idx + 100);
      console.log(`\n   Context: ...${context}...`);
    } else {
      console.log('⚠️  Bloomie not found in text');
    }

    // Look for any funnels listed
    const funnelElements = await page.locator('[class*="funnel"], [class*="item"]').count();
    console.log(`\n[4] Funnel elements found: ${funnelElements}`);

    console.log('[5] Taking screenshot of Funnels page...');
    await page.screenshot({ path: '/tmp/ghl-funnels-list.png', fullPage: true });
    console.log('📸 Screenshot: /tmp/ghl-funnels-list.png');

    await browser.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

verifyFunnel();
