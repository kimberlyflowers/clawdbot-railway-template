const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('🧪 Direct Session Test\n');
  
  const sessionPath = '/data/secrets/ghl-session.json';
  const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.createBrowserContext();
  
  // Restore cookies
  if (sessionData.cookies) {
    await context.addCookies(sessionData.cookies);
  }
  
  const page = await context.newPage();
  console.log('📍 Navigating to GHL...');
  
  try {
    await page.goto('https://app.gohighlevel.com/', { waitUntil: 'domcontentloaded', timeout: 20000 });
    
    // Wait a bit more for dynamic content
    await page.waitForTimeout(2000);
    
    const url = page.url();
    console.log(`✓ URL: ${url}`);
    
    // Check for login indicators
    const isLogin = url.includes('/login') || url.includes('/verify');
    const hasLoginText = await page.evaluate(() => 
      document.body.innerText.includes('Sign in') || 
      document.body.innerText.includes('Verify Security Code')
    );
    
    console.log(`✓ Is login page? ${isLogin}`);
    console.log(`✓ Has login text? ${hasLoginText}`);
    
    // Get page structure
    const hasNav = await page.evaluate(() => !!document.querySelector('nav'));
    const hasSidebar = await page.evaluate(() => !!document.querySelector('[class*="sidebar"]'));
    const pageTitle = await page.title();
    
    console.log(`✓ Page title: ${pageTitle}`);
    console.log(`✓ Has nav? ${hasNav}`);
    console.log(`✓ Has sidebar? ${hasSidebar}`);
    
    // Take screenshot
    await page.screenshot({ path: '/tmp/ghl-session-test.png' });
    console.log('\n📸 Screenshot: /tmp/ghl-session-test.png');
    
    if (!isLogin && !hasLoginText && (hasNav || hasSidebar || pageTitle.includes('GoHighLevel'))) {
      console.log('\n✅ SESSION VALID: Dashboard accessible!');
    } else {
      console.log('\n⚠️ SESSION ISSUE: May be redirect or loading');
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    await browser.close();
  }
})();
