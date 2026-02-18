/**
 * Simplified IMAP Code Reader
 * Minimal code, better error handling
 */

const Imap = require('imap');
const { simpleParser } = require('mailparser');

class SimpleImapReader {
  constructor() {
    this.imap = null;
  }

  /**
   * Get latest 2FA code from inbox
   */
  async getLatestCode(timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
      let foundCode = null;
      let processedEmails = 0;

      const timeout = setTimeout(() => {
        if (this.imap) this.imap.destroy();
        reject(new Error(`IMAP timeout after ${timeoutMs}ms, checked ${processedEmails} emails`));
      }, timeoutMs);

      this.imap = new Imap({
        user: 'flwrs_kmbrly@yahoo.com',
        password: 'vjebaceqhppxtyqe',
        host: 'imap.mail.yahoo.com',
        port: 993,
        tls: true,
      });

      this.imap.on('error', (err) => {
        clearTimeout(timeout);
        reject(new Error(`IMAP error: ${err.message}`));
      });

      this.imap.on('end', () => {
        clearTimeout(timeout);
        if (foundCode) {
          resolve(foundCode);
        } else {
          reject(new Error('No code found in recent emails'));
        }
      });

      this.imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          clearTimeout(timeout);
          if (this.imap) this.imap.end();
          reject(new Error(`openBox failed: ${err.message}`));
          return;
        }

        // Get last 5 emails
        const totalEmails = box.messages.total;
        const start = Math.max(1, totalEmails - 4);
        const end = totalEmails;

        if (start > end) {
          clearTimeout(timeout);
          if (this.imap) this.imap.end();
          reject(new Error('No emails in inbox'));
          return;
        }

        const f = this.imap.fetch(`${start}:${end}`, { bodies: '' });

        f.on('message', (msg, seqno) => {
          processedEmails++;

          simpleParser(msg, (err, parsed) => {
            if (err) {
              console.log(`Parse error: ${err.message}`);
              return;
            }

            // Extract code
            const text = parsed.text || '';
            const code = this.extractCode(text);

            if (code && !foundCode) {
              console.log(`Found code in email from ${parsed.from.text}: ${code}`);
              foundCode = code;
              clearTimeout(timeout);
              if (this.imap) this.imap.end();
            }
          });
        });

        f.on('error', (err) => {
          console.log(`Fetch error: ${err.message}`);
        });

        f.on('end', () => {
          // All messages fetched
          if (!foundCode) {
            clearTimeout(timeout);
            if (this.imap) this.imap.end();
          }
        });
      });

      this.imap.connect();
    });
  }

  /**
   * Extract 6-digit code
   */
  extractCode(content) {
    if (!content) return null;

    // 6-digit code
    const match = content.match(/\b(\d{6})\b/);
    if (match) return match[1];

    // Code with spaces: "123 456"
    const spaced = content.match(/(\d{3})\s+(\d{3})/);
    if (spaced) return spaced[1] + spaced[2];

    return null;
  }
}

module.exports = SimpleImapReader;
