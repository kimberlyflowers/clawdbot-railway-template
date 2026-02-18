/**
 * Framework Validation Tests
 * Verifies all framework components are in place and functional
 * 
 * ⚠️ NOTE: Does NOT test actual GHL login or automation
 * See SETUP.md for credentials needed for integration testing
 */

const { GHLBrowser, config, ERROR_CODES } = require('./index');

async function runFrameworkTests() {
  console.log('🧪 bloomie-ghl-browser Framework Validation\n');
  console.log('='.repeat(50) + '\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}`);
      console.log(`   Error: ${error.message}\n`);
      failed++;
    }
  }

  // Test 1: Configuration
  await test('Configuration loaded', () => {
    if (!config.ghlBaseUrl) throw new Error('Base URL not configured');
    if (!config.selectors) throw new Error('Selectors not configured');
    if (!config.timeouts) throw new Error('Timeouts not configured');
  });

  // Test 2: Credentials check
  await test('Credentials environment check', () => {
    const email = process.env.GHL_EMAIL;
    const password = process.env.GHL_PASSWORD;
    
    console.log(`   Email configured: ${!!email}`);
    console.log(`   Password configured: ${!!password}`);
    
    if (!email && !password) {
      console.log('   ℹ️  (Not required for framework validation)\n');
    }
  });

  // Test 3: Error codes
  await test('Error codes defined', () => {
    const expectedCodes = [
      'BROWSER_LAUNCH_FAILED',
      'AUTH_FAILED',
      'TIMEOUT',
      'SESSION_EXPIRED',
    ];
    expectedCodes.forEach(code => {
      if (!ERROR_CODES[code]) throw new Error(`Missing error code: ${code}`);
    });
  });

  // Test 4: Module exports
  await test('Modules exported', () => {
    const { GHLBrowser, BrowserManager, GHLAuth, Navigator } = require('./index');
    if (!GHLBrowser) throw new Error('GHLBrowser not exported');
    if (!BrowserManager) throw new Error('BrowserManager not exported');
    if (!GHLAuth) throw new Error('GHLAuth not exported');
    if (!Navigator) throw new Error('Navigator not exported');
  });

  // Test 5: GHLBrowser instantiation
  await test('GHLBrowser can be instantiated', () => {
    const browser = new GHLBrowser();
    if (!browser.getStatus) throw new Error('getStatus method missing');
  });

  // Test 6: Status reporting
  await test('Framework status reporting', () => {
    const browser = new GHLBrowser();
    const status = browser.getStatus();

    if (status.version !== '1.0.0-framework') throw new Error('Version not set');
    if (!status.nextSteps) throw new Error('Next steps not defined');
    if (status.nextSteps.length === 0) throw new Error('Next steps empty');

    console.log(`   Version: ${status.version}`);
    console.log(`   Status: ${status.status}`);
    console.log(`   Next steps: ${status.nextSteps.length}\n`);
  });

  // Test 7: Logger functionality
  await test('Logger module functional', () => {
    const { log, logError, readLog, clearLog } = require('./index');
    if (typeof log !== 'function') throw new Error('log is not a function');
    if (typeof logError !== 'function') throw new Error('logError is not a function');
    if (typeof readLog !== 'function') throw new Error('readLog is not a function');
    if (typeof clearLog !== 'function') throw new Error('clearLog is not a function');
  });

  // Test 8: Error handler
  await test('Error handler framework', () => {
    const { safeExecute, handleErrorWithRetry, GHLBrowserError } = require('./index');
    if (typeof safeExecute !== 'function') throw new Error('safeExecute not a function');
    if (typeof handleErrorWithRetry !== 'function') throw new Error('handleErrorWithRetry not a function');
    if (typeof GHLBrowserError !== 'function') throw new Error('GHLBrowserError not a function');
  });

  // Test 9: File structure
  await test('File structure complete', () => {
    const fs = require('fs');
    const files = [
      'config.js',
      'browser-manager.js',
      'logger.js',
      'error-handler.js',
      'navigation.js',
      'auth.js',
      'index.js',
      'package.json',
    ];
    files.forEach(file => {
      const path = `/data/workspace/skills/ghl-browser/${file}`;
      if (!fs.existsSync(path)) throw new Error(`Missing file: ${file}`);
    });
  });

  // Test 10: Documentation
  await test('Documentation files present', () => {
    const fs = require('fs');
    const docs = ['RESEARCH.md'];
    docs.forEach(doc => {
      const path = `/data/workspace/skills/ghl-browser/${doc}`;
      if (!fs.existsSync(path)) throw new Error(`Missing doc: ${doc}`);
    });
  });

  // Summary
  console.log('='.repeat(50));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

  if (failed === 0) {
    console.log('🎉 Framework validation complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Set GHL_EMAIL and GHL_PASSWORD environment variables');
    console.log('2. Update auth.js with actual login implementation');
    console.log('3. Run integration tests with real GHL account');
    console.log('4. Implement page automation methods (add elements, edit content, etc.)');
  } else {
    console.log(`⚠️  ${failed} validation(s) failed`);
  }
}

runFrameworkTests().catch(console.error);
