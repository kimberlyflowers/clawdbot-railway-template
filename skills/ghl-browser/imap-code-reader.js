/**
 * Yahoo IMAP Code Reader
 * Uses raw imap library to fetch 2FA codes
 * More reliable than imap-simple
 */

const Imap = require('imap');
const { simpleParser } = require('mailparser');

const YAHOO_EMAIL = 'flwrs_kmbrly@yahoo.com';
const YAHOO_APP_PASSWORD = 'vjebaceqhppxtyqe';

class ImapCodeReader {
  constructor() {
    this.imap = null;
    this.code = null;
  }

  /**
   * Connect and fetch latest code from inbox
   */
  async getLatestCode() {
    console.log('📧 Connecting to Yahoo IMAP...');

    this.imap = new Imap({
      user: YAHOO_EMAIL,
      password: YAHOO_APP_PASSWORD,
      host: 'imap.mail.yahoo.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    });

    return new Promise((resolve, reject) => {
      this.imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          reject(new Error(`Failed to open inbox: ${err.message}`));
          return;
        }

        console.log('✓ Opened inbox');
        console.log('📨 Searching for GHL emails...');

        // Search for unseen emails (most recent)
        this.imap.search(['UNSEEN'], (err, results) => {
          if (err) {
            reject(new Error(`Search failed: ${err.message}`));
            return;
          }

          if (!results || results.length === 0) {
            console.log('⚠️  No unseen emails, trying last 10...');
            // If no unseen, get last 10
            this.imap.search(['ALL'], (err, results) => {
              if (err) {
                reject(new Error(`Search failed: ${err.message}`));
                return;
              }

              if (results.length === 0) {
                reject(new Error('No emails found'));
                return;
              }

              // Get last email
              const lastID = results[results.length - 1];
              this.fetchAndParseEmail(lastID, resolve, reject);
            });
          } else {
            // Get last unseen email
            const lastID = results[results.length - 1];
            this.fetchAndParseEmail(lastID, resolve, reject);
          }
        });
      });

      this.imap.openBox('INBOX', false, (err) => {
        if (err) reject(err);
      });

      this.imap.on('error', (err) => {
        reject(new Error(`IMAP error: ${err.message}`));
      });

      this.imap.on('end', () => {
        // Connection closed
      });

      try {
        this.imap.openBox('INBOX', false, (err) => {
          if (err) console.error('Box error:', err);
        });
      } catch (e) {
        // Ignore
      }

      this.imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          console.log('Retrying connection...');
          setTimeout(() => {
            this.imap.connect();
          }, 1000);
        }
      });

      this.imap.connect();
    });
  }

  /**
   * Fetch and parse an email
   */
  fetchAndParseEmail(id, resolve, reject) {
    const f = this.imap.fetch(id, { bodies: '' });

    f.on('message', (msg, seqno) => {
      console.log(`Fetching email ${seqno}...`);

      simpleParser(msg, async (err, parsed) => {
        if (err) {
          reject(new Error(`Parse error: ${err.message}`));
          return;
        }

        console.log(`From: ${parsed.from.text}`);
        console.log(`Subject: ${parsed.subject}`);

        // Extract code
        const text = parsed.text || '';
        const html = parsed.html || '';
        const content = (text + html).toLowerCase();

        const code = this.extractCode(text || html || '');
        if (code) {
          console.log(`✓ Found code: ${code}`);
          this.imap.end();
          resolve(code);
        } else {
          reject(new Error('No code found in email'));
        }
      });
    });

    f.on('error', (err) => {
      reject(new Error(`Fetch error: ${err.message}`));
    });

    f.on('end', () => {
      // Email fetched
    });
  }

  /**
   * Extract 6-digit code
   */
  extractCode(content) {
    if (!content) return null;

    // Look for 6-digit codes
    const matches = content.match(/\b\d{6}\b/);
    if (matches) return matches[0];

    // Look for "123 456" format
    const spaced = content.match(/(\d{3})\s+(\d{3})/);
    if (spaced) return spaced[1] + spaced[2];

    return null;
  }
}

module.exports = ImapCodeReader;
