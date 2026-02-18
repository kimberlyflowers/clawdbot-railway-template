/**
 * Yahoo Email Reader - IMAP
 * Reads 2FA codes from Yahoo Mail inbox
 */

const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');

const YAHOO_EMAIL = 'flwrs_kmbrly@yahoo.com';
const YAHOO_APP_PASSWORD = 'vjebaceqhppxtyqe';

class EmailReader {
  constructor() {
    this.connection = null;
  }

  /**
   * Connect to Yahoo Mail via IMAP
   */
  async connect() {
    console.log('📧 Connecting to Yahoo Mail...');

    const config = {
      imap: {
        user: YAHOO_EMAIL,
        password: YAHOO_APP_PASSWORD,
        host: 'imap.mail.yahoo.com',
        port: 993,
        tls: true,
        authTimeout: 10000,
      },
    };

    try {
      this.connection = await imaps.connect(config);
      console.log('✓ Connected to Yahoo Mail');
      return true;
    } catch (error) {
      throw new Error(`IMAP connection failed: ${error.message}`);
    }
  }

  /**
   * Read latest email from GHL
   */
  async getLatestGHLEmail() {
    if (!this.connection) {
      throw new Error('Not connected. Call connect() first.');
    }

    console.log('📨 Fetching latest emails from inbox...');

    try {
      // Select inbox
      await this.connection.openBox('INBOX', false);

      // Search for recent emails - use UNSEEN or just get all
      const emails = await this.connection.search(['ALL'], {
        bodies: '',
        struct: true,
      });

      console.log(`Found ${emails.length} recent emails`);

      if (emails.length === 0) {
        throw new Error('No recent emails found. Code may not have been sent.');
      }

      // Parse emails to find GHL code
      for (let i = emails.length - 1; i >= 0; i--) {
        const email = emails[i];
        const parsed = await this.parseEmail(email);

        if (parsed.from && parsed.from.includes('gohighlevel.com')) {
          console.log(`✓ Found GHL email from: ${parsed.from}`);
          console.log(`  Subject: ${parsed.subject}`);

          // Extract code from email
          const code = this.extractCode(parsed.text || parsed.html);
          if (code) {
            console.log(`✓ Extracted code: ${code}`);
            return code;
          }
        }
      }

      throw new Error('No valid 2FA code found in emails');
    } catch (error) {
      throw new Error(`Email fetch failed: ${error.message}`);
    }
  }

  /**
   * Parse email to extract metadata
   */
  async parseEmail(email) {
    try {
      const parts = imaps.getParts(email.attributes.struct);
      let parsed = {
        from: email.attributes.from ? email.attributes.from[0] : 'unknown',
        subject: email.attributes.subject ? email.attributes.subject[0] : '',
        text: '',
        html: '',
      };

      for (const part of parts) {
        const partBody = await this.connection.getPartData(email, part);
        const mimeType = part.type + '/' + part.subtype;

        if (mimeType === 'text/plain') {
          parsed.text = partBody.toString();
        } else if (mimeType === 'text/html') {
          parsed.html = partBody.toString();
        }
      }

      return parsed;
    } catch (error) {
      console.error(`Parse error: ${error.message}`);
      return { from: '', subject: '', text: '', html: '' };
    }
  }

  /**
   * Extract 6-digit code from email content
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
   * Get date string for IMAP (N minutes ago)
   */
  getDateString(minutesAgo) {
    const date = new Date(Date.now() - minutesAgo * 60000);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const day = days[date.getUTCDay()];
    const dateNum = String(date.getUTCDate()).padStart(2, '0');
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();

    return `${dateNum}-${month}-${year}`;
  }

  /**
   * Disconnect from email
   */
  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('Disconnected from email');
    }
  }
}

module.exports = EmailReader;
