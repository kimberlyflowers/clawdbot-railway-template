const { chromium } = require('playwright');
const SessionManager = require('./session-manager');

async function verifyFunnel() {
  console.log('🔍 Verifying Bloomie Funnel in GHL Dashboard\n');

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

    console.log('[1] Loading GHL dashboard...');
    await page.goto('https://app.gohighlevel.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });
    await page.waitForTimeout(2000);
    console.log('✓ Dashboard loaded');

    console.log('[2] Navigating to Funnels...');
    await page.goto('https://app.gohighlevel.com/funnels', {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });
    await page.waitForTimeout(2500);
    console.log('✓ Funnels page loaded');

    console.log('[3] Checking for Bloomie funnel...');
    const pageText = await page.textContent('body');
    const hasBloomie = pageText.includes('Bloomie-Hire-AI-Employee-V1');

    if (hasBloomie) {
      console.log('✅ FOUND: Bloomie-Hire-AI-Employee-V1 in funnel list!');
    } else {
      console.log('⚠️  Not found in page text. Taking screenshot to inspect...');
    }

    console.log('[4] Taking screenshot...');
    const screenshot = '/tmp/ghl-verify-funnels.png';
    await page.screenshot({ path: screenshot, fullPage: true });
    console.log(`📸 Screenshot: ${screenshot}`);

    console.log('\n[5] Extracting funnel list...');
    const funnels = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[class*="funnel"], [class*="item"], tr, [role="button"]'));
      return items.slice(0, 20).map(el => ({
        text: el.textContent?.slice(0, 100) || '',
        tag: el.tagName,
      }));
    });

    console.log('Visible items:');
    funnels.forEach((item, i) => {
      if (item.text.trim().length > 0) {
        console.log(`  [${i}] ${item.text.trim().substring(0, 80)}`);
      }
    });

    await browser.close();
    console.log('\n✅ Verification complete. Check screenshot.');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (page) {
      try {
        await page.screenshot({ path: '/tmp/ghl-verify-error.png' });
      } catch (e) {}
    }
    process.exit(1);
  }
}

verifyFunnel();
