const { chromium } = require('playwright');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const fs = require('fs');

const GHL_EMAIL = 'flwrs_kmbrly@yahoo.com';
const GHL_PASSWORD = 'Kimmy0910!';
const YAHOO_APP_PASSWORD = fs.readFileSync('/data/secrets/yahoo-app-password.txt', 'utf8').trim();

async function getLatest2FACode() {
  console.log('📧 Retrieving latest 2FA code from Yahoo...\n');

  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: GHL_EMAIL,
      password: YAHOO_APP_PASSWORD,
      host: 'imap.mail.yahoo.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    });

    function openInbox(cb) {
      imap.openBox('INBOX', false, cb);
    }

    imap.openBox('INBOX', false, (err, box) => {
      if (err) {
        console.error('❌ IMAP error:', err.message);
        reject(err);
        return;
      }

      // Search for recent emails
      imap.search(['ALL'], (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        if (results.length === 0) {
          reject(new Error('No emails found'));
          return;
        }

        // Get last 5 emails
        const f = imap.fetch(results.slice(-5), { bodies: '' });

        const codes = [];
        f.on('message', (msg, seqno) => {
          simpleParser(msg, async (err, parsed) => {
            if (err) reject(err);

            const text = parsed.text || '';
            const subject = parsed.subject || '';

            // Look for 6-digit codes in GHL emails
            if (
              subject.includes('GoHighLevel') ||
              subject.includes('Security Code') ||
              subject.includes('verification')
            ) {
              const match = text.match(/\b(\d{6})\b/);
              if (match) {
                codes.push(match[1]);
                console.log(`✓ Found code in email: "${subject}"`);
                console.log(`  Code: ${match[1]}`);
              }
            }
          });
        });

        f.on('error', reject);

        f.on('end', () => {
          imap.end();

          if (codes.length > 0) {
            const latestCode = codes[codes.length - 1];
            console.log(`\n✅ Latest code: ${latestCode}`);
            resolve(latestCode);
          } else {
            reject(new Error('No 6-digit code found in recent emails'));
          }
        });
      });
    });

    imap.on('error', reject);
    imap.on('end', () => {});
  });
}

(async () => {
  try {
    const code = await getLatest2FACode();
    console.log(`\n🎯 Code ready: ${code}`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
})();
