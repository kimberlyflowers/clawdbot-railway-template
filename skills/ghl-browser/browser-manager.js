/**
 * Browser Manager — Handles Playwright browser lifecycle and session management
 */

const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');
const config = require('./config');
const { log, logError } = require('./logger');

class BrowserManager {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.isConnected = false;
    this.sessionStartTime = null;
  }

  /**
   * Launch browser instance
   */
  async launch() {
    try {
      log('info', `Launching ${config.browser.browserType} browser (headless: ${config.browser.headless})`);

      const browserType = this.getBrowserType();
      this.browser = await browserType.launch({
        headless: config.browser.headless,
        slowMo: config.browser.slowMo,
      });

      this.isConnected = true;
      this.sessionStartTime = Date.now();
      log('info', 'Browser launched successfully');
      return this.browser;
    } catch (error) {
      logError('Failed to launch browser', error);
      throw error;
    }
  }

  /**
   * Create new browser context (isolated session)
   */
  async createContext() {
    try {
      if (!this.browser) throw new Error('Browser not launched. Call launch() first.');

      log('info', 'Creating new browser context');

      // Load cookies if they exist
      let contextOptions = {};
      if (config.session.persistCookies && fs.existsSync(config.session.cookieStorePath)) {
        const cookies = JSON.parse(fs.readFileSync(config.session.cookieStorePath, 'utf-8'));
        contextOptions.cookies = cookies;
      }

      this.context = await this.browser.newContext(contextOptions);
      log('info', 'Browser context created');
      return this.context;
    } catch (error) {
      logError('Failed to create context', error);
      throw error;
    }
  }

  /**
   * Create new page in context
   */
  async createPage() {
    try {
      if (!this.context) throw new Error('Context not created. Call createContext() first.');

      log('info', 'Creating new page');
      this.page = await this.context.newPage();

      // Set viewport
      await this.page.setViewportSize({ width: 1280, height: 720 });

      log('info', 'Page created successfully');
      return this.page;
    } catch (error) {
      logError('Failed to create page', error);
      throw error;
    }
  }

  /**
   * Save cookies to file for persistence
   */
  async saveCookies() {
    try {
      if (!this.context) return;
      const cookies = await this.context.cookies();
      fs.writeFileSync(config.session.cookieStorePath, JSON.stringify(cookies, null, 2));
      log('info', `Cookies saved to ${config.session.cookieStorePath}`);
    } catch (error) {
      logError('Failed to save cookies', error);
    }
  }

  /**
   * Close page
   */
  async closePage() {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
        log('info', 'Page closed');
      }
    } catch (error) {
      logError('Error closing page', error);
    }
  }

  /**
   * Close context
   */
  async closeContext() {
    try {
      if (this.context) {
        await this.saveCookies();
        await this.context.close();
        this.context = null;
        log('info', 'Context closed');
      }
    } catch (error) {
      logError('Error closing context', error);
    }
  }

  /**
   * Close browser
   */
  async closeBrowser() {
    try {
      await this.closeContext();
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.isConnected = false;
        log('info', 'Browser closed');
      }
    } catch (error) {
      logError('Error closing browser', error);
    }
  }

  /**
   * Get current session duration (ms)
   */
  getSessionDuration() {
    return this.sessionStartTime ? Date.now() - this.sessionStartTime : 0;
  }

  /**
   * Check if session is still valid (not expired)
   */
  isSessionValid() {
    const duration = this.getSessionDuration();
    const maxDuration = config.session.sessionTimeoutMinutes * 60 * 1000;
    return duration < maxDuration;
  }

  /**
   * Get browser type instance
   */
  getBrowserType() {
    switch (config.browser.browserType) {
      case 'firefox':
        return firefox;
      case 'webkit':
        return webkit;
      case 'chromium':
      default:
        return chromium;
    }
  }

  /**
   * Get current page (for direct access)
   */
  getPage() {
    if (!this.page) throw new Error('Page not initialized');
    return this.page;
  }

  /**
   * Get current context
   */
  getContext() {
    if (!this.context) throw new Error('Context not initialized');
    return this.context;
  }

  /**
   * Get session info
   */
  getSessionInfo() {
    return {
      isConnected: this.isConnected,
      isValid: this.isSessionValid(),
      durationMs: this.getSessionDuration(),
      browserType: config.browser.browserType,
      headless: config.browser.headless,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = BrowserManager;
