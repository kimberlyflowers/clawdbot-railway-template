/**
 * bloomie-ghl-browser Configuration
 * Handles credentials, browser settings, URLs
 */

module.exports = {
  // GHL Account Credentials (loaded from file, env, or parameter)
  credentials: (() => {
    const fs = require('fs');
    let email = '';
    let password = '';
    
    // Try to load from credentials file
    try {
      const credsPath = '/data/secrets/ghl-login.txt';
      if (fs.existsSync(credsPath)) {
        const lines = fs.readFileSync(credsPath, 'utf-8').trim().split('\n');
        email = lines[0] || '';
        password = lines[1] || '';
      }
    } catch (e) {
      // Fallback to environment
    }
    
    return {
      email: process.env.GHL_EMAIL || email,
      password: process.env.GHL_PASSWORD || password,
      twoFaEnabled: process.env.GHL_2FA_ENABLED === 'true' || false,
      twoFaMethod: process.env.GHL_2FA_METHOD || 'sms', // sms or email
    };
  })(),

  // GHL URLs
  ghlBaseUrl: 'https://app.gohighlevel.com',
  ghlLoginUrl: 'https://app.gohighlevel.com/login',
  ghlDashboardUrl: 'https://app.gohighlevel.com/dashboard',

  // Playwright Browser Settings
  browser: {
    headless: process.env.PLAYWRIGHT_HEADLESS !== 'false', // true by default
    slowMo: process.env.PLAYWRIGHT_SLOWMO ? parseInt(process.env.PLAYWRIGHT_SLOWMO) : 0, // milliseconds between actions
    browserType: process.env.PLAYWRIGHT_BROWSER || 'chromium', // chromium, firefox, webkit
    timeout: 30000, // ms
    navigationTimeout: 30000, // ms
  },

  // Session Management
  session: {
    persistCookies: true,
    cookieStorePath: process.env.COOKIE_STORE_PATH || '/tmp/ghl-cookies.json',
    sessionTimeoutMinutes: 60,
    autoRefreshSession: true,
  },

  // Retry & Resilience
  resilience: {
    maxRetries: 3,
    retryDelayMs: 1000,
    exponentialBackoff: true,
  },

  // Logging
  logging: {
    enabled: process.env.GHL_BROWSER_DEBUG === 'true',
    logPath: process.env.GHL_LOG_PATH || '/tmp/ghl-browser.log',
    logLevel: process.env.GHL_LOG_LEVEL || 'info', // debug, info, warn, error
  },

  // Selectors (GHL UI elements)
  selectors: {
    // Login form
    emailInput: 'input[type="email"]',
    passwordInput: 'input[type="password"]',
    loginButton: 'button:has-text("Login")',
    nextButton: 'button:has-text("Next")',

    // Dashboard
    dashboardTitle: 'text=Dashboard',
    userMenu: '[aria-label="User menu"]',

    // Funnels
    funnelsList: '[data-testid="funnels-list"]',
    funnelItem: '.funnel-card',
    funnelLink: 'a[href*="/funnel/"]',

    // Pages
    pagesList: '[data-testid="pages-list"]',
    pageItem: '.page-item',
    pageEditor: '[data-testid="page-editor"]',

    // Page Builder
    pageCanvas: '[data-testid="page-canvas"]',
    elementInspector: '[data-testid="element-inspector"]',
    saveButton: 'button:has-text("Save")',
    publishButton: 'button:has-text("Publish")',

    // Common
    loader: '.loader, [role="progressbar"]',
    errorMessage: '[role="alert"]',
  },

  // Timeouts for specific operations
  timeouts: {
    loginTimeout: 60000, // 60 seconds
    navigationTimeout: 30000, // 30 seconds
    elementWaitTimeout: 10000, // 10 seconds
    pageLoadTimeout: 30000, // 30 seconds
  },
};
