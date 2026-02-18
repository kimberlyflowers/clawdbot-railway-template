const { chromium } = require('playwright');
const SessionManager = require('./session-manager');

async function verifyFunnel() {
  console.log('🔍 Verifying Bloomie Funnel - Extended Wait\n');

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
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log(`✓ Current URL: ${currentUrl}`);

    if (currentUrl.includes('login')) {
      console.log('⚠️  Redirected to login! Session expired.');
      console.log('📸 Taking screenshot of login page...');
      await page.screenshot({ path: '/tmp/ghl-session-expired.png' });
      process.exit(1);
    }

    console.log('[2] Waiting for page to fully load...');
    await page.waitForTimeout(3000);

    console.log('[3] Checking if we can navigate to Funnels via direct URL...');
    const funnelsUrl = 'https://app.gohighlevel.com/funnels';
    console.log(`   → Going to: ${funnelsUrl}`);
    
    await page.goto(funnelsUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    });

    console.log('[4] Waiting for page render (4 seconds)...');
    await page.waitForTimeout(4000);

    const finalUrl = page.url();
    console.log(`   ✓ Final URL: ${finalUrl}`);

    console.log('[5] Checking page content...');
    const bodyText = await page.textContent('body');
    const bodyLen = bodyText ? bodyText.length : 0;
    console.log(`   Page text length: ${bodyLen} chars`);

    if (bodyText && bodyText.includes('Bloomie')) {
      console.log('✅ FOUND BLOOMIE!');
    } else if (bodyLen > 100) {
      console.log('Page has content, searching...');
      const firstWords = bodyText.split(' ').slice(0, 50).join(' ');
      console.log(`   Preview: ${firstWords}...`);
    } else {
      console.log('⚠️  Page appears empty or not fully loaded');
    }

    console.log('[6] Taking full page screenshot...');
    await page.screenshot({ path: '/tmp/ghl-verify-funnels-v2.png', fullPage: true });
    console.log('📸 Screenshot: /tmp/ghl-verify-funnels-v2.png');

    await browser.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (page) {
      try {
        await page.screenshot({ path: '/tmp/ghl-verify-error-v2.png' });
      } catch (e) {}
    }
    process.exit(1);
  }
}

verifyFunnel();
