/**
 * Yahoo Email Reader - Browser-Based
 * Uses Playwright to log into Yahoo Mail and fetch 2FA codes
 * Avoids IMAP auth issues by using the web interface
 */

const { chromium } = require('playwright');

const YAHOO_EMAIL = 'flwrs_kmbrly@yahoo.com';
const YAHOO_PASSWORD = 'Kimmy0910!';

class BrowserEmailReader {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  /**
   * Open Yahoo Mail in browser and get latest code
   */
  async getLatestCodeFromYahoo() {
    console.log('📧 Opening Yahoo Mail to fetch code...');

    try {
      // Launch separate browser for email
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-gpu'],
      });

      this.page = await this.browser.newPage();
      await this.page.setViewportSize({ width: 1280, height: 720 });

      // Go to Yahoo Mail
      console.log('   Navigating to Yahoo Mail...');
      await this.page.goto('https://mail.yahoo.com', {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      // Check if already logged in
      const isLoggedIn = await this.page
        .locator('[aria-label*="Inbox"], .MailItemView')
        .first()
        .isVisible()
        .catch(() => false);

      if (!isLoggedIn) {
        console.log('   Logging into Yahoo...');
        await this.loginToYahoo();
      }

      console.log('   ✓ Logged into Yahoo Mail');

      // Wait for inbox to load
      await this.page.waitForTimeout(2000);

      // Get the first (newest) email
      console.log('   Fetching latest emails...');
      const emails = await this.page
        .locator('[data-test-id*="item"], .msg-item')
        .all();

      console.log(`   Found ${emails.length} emails`);

      if (emails.length === 0) {
        throw new Error('No emails found in inbox');
      }

      // Click on first email to open it
      const firstEmail = emails[0];
      await firstEmail.click();

      await this.page.waitForTimeout(1500);

      // Get email content
      const emailContent = await this.page
        .locator('[data-test-id="message-body"], .msg-body, [role="main"]')
        .first()
        .textContent()
        .catch(() => '');

      console.log('   ✓ Retrieved email content');

      // Extract code
      const code = this.extractCode(emailContent);
      if (!code) {
        throw new Error(
          'Could not extract 6-digit code from email. Email content: ' +
            emailContent.substring(0, 500)
        );
      }

      console.log(`   ✓ Extracted code: ${code}`);
      return code;

    } catch (error) {
      throw new Error(`Yahoo email fetch failed: ${error.message}`);
    }
  }

  /**
   * Login to Yahoo Mail
   */
  async loginToYahoo() {
    // Click on login button or field
    const loginInput = this.page.locator('input[type="email"]').first();
    await loginInput.fill(YAHOO_EMAIL);
    await this.page.waitForTimeout(300);

    // Click Next
    const nextBtn = this.page
      .locator('button:has-text("Next"), button:has-text("Continue")')
      .first();
    await nextBtn.click();

    // Wait for password field
    await this.page.waitForTimeout(1500);
    const passwordInput = this.page.locator('input[type="password"]').first();
    await passwordInput.fill(YAHOO_PASSWORD);
    await this.page.waitForTimeout(300);

    // Click Sign in
    const signInBtn = this.page
      .locator('button:has-text("Sign in"), button:has-text("Login")')
      .first();
    await signInBtn.click();

    // Wait for inbox to load
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(
      () => null
    );
    await this.page.waitForTimeout(2000);
  }

  /**
   * Extract 6-digit code from email
   */
  extractCode(content) {
    if (!content) return null;

    // Look for 6-digit codes
    const matches = content.match(/\b\d{6}\b/g);
    if (matches && matches.length > 0) {
      return matches[0];
    }

    // Look for codes with format like "123 456"
    const spaced = content.match(/\b(\d{3})\s+(\d{3})\b/);
    if (spaced) {
      return spaced[1] + spaced[2];
    }

    // Look in common patterns
    const patterns = [
      /code[:\s]+(\d{6})/i,
      /verification[:\s]+(\d{6})/i,
      /enter[:\s]+(\d{6})/i,
      /security[:\s]+(\d{6})/i,
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Cleanup
   */
  async disconnect() {
    if (this.browser) {
      await this.browser.close();
      console.log('   Email browser closed');
    }
  }
}

module.exports = BrowserEmailReader;
