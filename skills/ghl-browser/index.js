/**
 * bloomie-ghl-browser — Main Export
 * GoHighLevel Browser Automation Framework (Playwright-based)
 * 
 * Status: Framework complete. Implementation phase pending credentials.
 */

const BrowserManager = require('./browser-manager');
const GHLAuth = require('./auth');
const Navigator = require('./navigation');
const { log, logError, clearLog, readLog } = require('./logger');
const { GHLBrowserError, ERROR_CODES, safeExecute, handleErrorWithRetry } = require('./error-handler');
const config = require('./config');

class GHLBrowser {
  constructor() {
    this.browserManager = new BrowserManager();
    this.auth = null;
    this.navigator = null;
    this.isReady = false;
  }

  /**
   * Initialize browser and create session
   */
  async initialize() {
    try {
      log('info', '🚀 Initializing GHL Browser Automation...');

      // Launch browser
      await this.browserManager.launch();

      // Create context (session)
      await this.browserManager.createContext();

      // Create page
      await this.browserManager.createPage();

      // Initialize auth and navigator
      const page = this.browserManager.getPage();
      this.auth = new GHLAuth(page);
      this.navigator = new Navigator(page);

      this.isReady = true;
      log('info', '✓ GHL Browser ready for use');

      return { success: true };
    } catch (error) {
      logError('Initialization failed', error);
      throw error;
    }
  }

  /**
   * FRAMEWORK STATUS: Get current system status
   */
  getStatus() {
    return {
      version: '1.0.0-framework',
      status: 'Framework complete. Implementation pending.',
      browserReady: this.isReady,
      browserConnected: this.browserManager.isConnected,
      authenticated: this.auth?.isAuthenticated || false,
      sessionInfo: this.browserManager.getSessionInfo(),
      configuredCredentials: !!config.credentials.email && !!config.credentials.password,
      credentialsNeeded: !config.credentials.email || !config.credentials.password,
      nextSteps: [
        '1. Set GHL_EMAIL and GHL_PASSWORD environment variables',
        '2. Call .login() to authenticate',
        '3. Use navigator to access funnels/pages',
        '4. Use automation methods to edit pages',
      ],
    };
  }

  /**
   * Login to GHL
   */
  async login() {
    if (!this.isReady) throw new Error('Browser not initialized. Call initialize() first.');
    return this.auth.login();
  }

  /**
   * Logout from GHL
   */
  async logout() {
    if (!this.isReady) throw new Error('Browser not initialized. Call initialize() first.');
    return this.auth.logout();
  }

  /**
   * Navigate to URL
   */
  async goto(url) {
    if (!this.isReady) throw new Error('Browser not initialized. Call initialize() first.');
    return this.navigator.goto(url);
  }

  /**
   * Get direct page access (for advanced automation)
   */
  getPage() {
    return this.browserManager.getPage();
  }

  /**
   * Get navigator
   */
  getNavigator() {
    return this.navigator;
  }

  /**
   * Cleanup and close browser
   */
  async close() {
    try {
      log('info', 'Closing GHL Browser...');
      await this.browserManager.closeBrowser();
      this.isReady = false;
      log('info', 'GHL Browser closed');
    } catch (error) {
      logError('Error closing browser', error);
    }
  }

  /**
   * Get logs
   */
  getLogs(lines = 100) {
    return readLog(lines);
  }

  /**
   * Clear logs
   */
  clearLogs() {
    clearLog();
  }
}

// Export
module.exports = {
  GHLBrowser,
  BrowserManager,
  GHLAuth,
  Navigator,
  config,
  ERROR_CODES,
  GHLBrowserError,
  safeExecute,
  handleErrorWithRetry,
  log,
  logError,
};
