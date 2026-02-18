const { chromium } = require('playwright');
const SessionManager = require('./session-manager');

async function simpleDeploy() {
  console.log('🌸 Bloomie GHL Deployment (Simplified)\n');

  let browser, page;

  try {
    // Load session
    const session = SessionManager.loadSession();
    if (!session) {
      throw new Error('No session. Run login-main.js first.');
    }

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    const context = await browser.newContext({ storageState: session });
    page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('[1] Loading dashboard...');
    await page.goto('https://app.gohighlevel.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    });
    console.log('✓ Dashboard loaded');

    console.log('[2] Taking dashboard screenshot...');
    await page.screenshot({ path: '/tmp/ghl-dashboard-fresh.png' });
    console.log('✓ Screenshot saved');

    console.log('[3] Checking page structure...');
    const html = await page.evaluate(() => {
      const navItems = Array.from(document.querySelectorAll('[class*="nav"], [class*="menu"], a')).slice(0, 10);
      return navItems.map(el => ({
        text: el.textContent?.slice(0, 50),
        tag: el.tagName,
        href: el.getAttribute('href'),
      }));
    });
    
    console.log('   Navigation items found:');
    html.forEach((item, i) => {
      console.log(`   [${i}] ${item.text} (${item.tag})`);
    });

    console.log('\n✅ Dashboard access confirmed!');
    console.log('📸 Screenshot: /tmp/ghl-dashboard-fresh.png');
    console.log('\n⚠️  Next step: Manual page creation in GHL UI needed');
    console.log('    (automation script has selector issues with Funnels nav)');

    await browser.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (page) {
      try {
        await page.screenshot({ path: '/tmp/ghl-error-simple.png' });
      } catch (e) {}
    }
    process.exit(1);
  }
}

simpleDeploy();
