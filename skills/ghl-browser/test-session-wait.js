const GHLBrowser = require('./index.js');

(async () => {
  const browser = new GHLBrowser();
  try {
    console.log('🚀 Testing saved session with extended wait...\n');
    
    // Load session and navigate
    await browser.loadSession();
    await browser.page.goto('https://app.gohighlevel.com/', { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for dashboard to load
    console.log('⏳ Waiting for dashboard to fully load...');
    await browser.page.waitForTimeout(3000);
    
    // Check URL
    const url = browser.page.url();
    console.log(`📍 Current URL: ${url}`);
    
    // Check if we're on dashboard or login
    const isLogin = url.includes('login') || url.includes('verify');
    console.log(`✓ Login page? ${isLogin}`);
    
    // Get page title
    const title = await browser.page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Screenshot
    await browser.page.screenshot({ path: '/tmp/ghl-dashboard-full.png' });
    console.log('📸 Screenshot: /tmp/ghl-dashboard-full.png');
    
    if (!isLogin) {
      console.log('\n✅ SUCCESS: Session valid! Dashboard accessible.');
    } else {
      console.log('\n❌ FAILED: Redirected to login page. Session expired.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
