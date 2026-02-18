const { chromium } = require('playwright');
const SessionManager = require('./session-manager');

(async () => {
  console.log('🔍 Session Content Inspection\n');
  
  if (!SessionManager.hasSavedSession()) {
    console.log('❌ No saved session found');
    process.exit(1);
  }
  
  const session = SessionManager.loadSession();
  console.log(`✓ Loaded session with ${session.cookies?.length || 0} cookies\n`);
  
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu'] });
  const context = await browser.newContext({ storageState: session });
  const page = await context.newPage();
  
  console.log('📍 Navigating to GHL...');
  await page.goto('https://app.gohighlevel.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  console.log('⏳ Waiting for content to load...');
  await page.waitForTimeout(3000);
  
  // Get detailed info
  const url = page.url();
  const title = await page.title();
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
  
  console.log(`\n📋 Page Details:`);
  console.log(`   URL: ${url}`);
  console.log(`   Title: ${title}`);
  console.log(`   Body text (first 500 chars):\n${bodyText}\n`);
  
  // Check for login indicators
  const isLogin = url.includes('/login') || url.includes('/verify') || 
                 bodyText.includes('Sign in') || bodyText.includes('Verify Security');
  
  console.log(`🔐 Is login page? ${isLogin ? '❌ YES' : '✅ NO'}`);
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/ghl-content-test.png', fullPage: true });
  console.log('📸 Full screenshot: /tmp/ghl-content-test.png');
  
  if (isLogin) {
    console.log('\n⚠️  Session redirected to login. May be expired.');
  } else {
    console.log('\n✅ Session valid! Dashboard loaded.');
  }
  
  await browser.close();
})();
