/**
 * Navigation Helpers — URL navigation and page state verification
 */

const config = require('./config');
const { log, logError } = require('./logger');
const { safeExecute } = require('./error-handler');

class Navigator {
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to URL with error handling
   */
  async goto(url, options = {}) {
    return safeExecute(async () => {
      log('info', `Navigating to ${url}`);
      await this.page.goto(url, {
        waitUntil: options.waitUntil || 'networkidle',
        timeout: options.timeout || config.timeouts.navigationTimeout,
      });
      log('info', `Successfully navigated to ${url}`);
    });
  }

  /**
   * Navigate to GHL login page
   */
  async goToLogin() {
    return this.goto(config.ghlLoginUrl);
  }

  /**
   * Navigate to GHL dashboard
   */
  async goToDashboard() {
    return this.goto(config.ghlDashboardUrl);
  }

  /**
   * Navigate to funnel
   */
  async goToFunnel(funnelId) {
    const url = `${config.ghlBaseUrl}/funnel/${funnelId}`;
    return this.goto(url);
  }

  /**
   * Navigate to funnel page editor
   */
  async goToPageEditor(funnelId, pageId) {
    const url = `${config.ghlBaseUrl}/funnel/${funnelId}/page/${pageId}`;
    return this.goto(url);
  }

  /**
   * Wait for page to load (check for specific element)
   */
  async waitForPageLoad(selector = null, timeout = null) {
    return safeExecute(async () => {
      const targetSelector = selector || config.selectors.dashboardTitle;
      const targetTimeout = timeout || config.timeouts.pageLoadTimeout;

      log('info', `Waiting for element: ${targetSelector}`);
      await this.page.waitForSelector(targetSelector, { timeout: targetTimeout });
      log('info', 'Page loaded successfully');
    });
  }

  /**
   * Wait for element to disappear (e.g., loader)
   */
  async waitForElementToDisappear(selector, timeout = null) {
    return safeExecute(async () => {
      const targetTimeout = timeout || config.timeouts.pageLoadTimeout;
      log('info', `Waiting for element to disappear: ${selector}`);
      await this.page.waitForSelector(selector, { state: 'hidden', timeout: targetTimeout });
      log('info', 'Element disappeared');
    });
  }

  /**
   * Get current URL
   */
  async getCurrentUrl() {
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getPageTitle() {
    return this.page.title();
  }

  /**
   * Check if element exists
   */
  async elementExists(selector) {
    const element = await this.page.$(selector);
    return element !== null;
  }

  /**
   * Get element text
   */
  async getElementText(selector) {
    return safeExecute(async () => {
      await this.page.waitForSelector(selector, { timeout: config.timeouts.elementWaitTimeout });
      return await this.page.textContent(selector);
    });
  }

  /**
   * Get element HTML
   */
  async getElementHTML(selector) {
    return safeExecute(async () => {
      await this.page.waitForSelector(selector, { timeout: config.timeouts.elementWaitTimeout });
      return await this.page.innerHTML(selector);
    });
  }

  /**
   * Take screenshot
   */
  async screenshot(filename = null) {
    return safeExecute(async () => {
      const path = filename || `/tmp/ghl-screenshot-${Date.now()}.png`;
      await this.page.screenshot({ path, fullPage: true });
      log('info', `Screenshot saved to ${path}`);
      return path;
    });
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(timeout = null) {
    return safeExecute(async () => {
      const targetTimeout = timeout || config.timeouts.navigationTimeout;
      await this.page.waitForNavigation({ timeout: targetTimeout });
      log('info', 'Navigation completed');
    });
  }

  /**
   * Go back
   */
  async goBack() {
    return this.page.goBack();
  }

  /**
   * Go forward
   */
  async goForward() {
    return this.page.goForward();
  }

  /**
   * Reload page
   */
  async reload() {
    return this.goto(await this.getCurrentUrl());
  }
}

module.exports = Navigator;
