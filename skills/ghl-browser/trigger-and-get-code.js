const { chromium } = require('playwright');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const fs = require('fs');

const GHL_EMAIL = 'flwrs_kmbrly@yahoo.com';
const GHL_PASSWORD = 'Kimmy0910!';
const YAHOO_APP_PASSWORD = fs.readFileSync('/data/secrets/yahoo-app-password.txt', 'utf8').trim();

async function retrieveCodeFromEmail(waitSeconds = 15) {
  console.log(`📧 Checking Yahoo email for code (waiting ${waitSeconds}s)...\n`);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const imap = new Imap({
        user: GHL_EMAIL,
        password: YAHOO_APP_PASSWORD,
        host: 'imap.mail.yahoo.com',
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
      });

      imap.on('ready', () => {
        imap.openBox('INBOX', false, (err, box) => {
          if (err) {
            imap.end();
            reject(err);
            return;
          }

          imap.search(['ALL'], (err, results) => {
            if (err) {
              imap.end();
              reject(err);
              return;
            }

            if (results.length === 0) {
              imap.end();
              reject(new Error('No emails found'));
              return;
            }

            const f = imap.fetch(results.slice(-10), { bodies: '' });
            const codes = [];

            f.on('message', (msg, seqno) => {
              simpleParser(msg, (err, parsed) => {
                if (err) return;
                const text = parsed.text || '';
                const subject = parsed.subject || '';

                if (
                  subject.toLowerCase().includes('gohighlevel') ||
                  subject.toLowerCase().includes('security') ||
                  subject.toLowerCase().includes('code')
                ) {
                  const match = text.match(/\b(\d{6})\b/);
                  if (match) {
                    codes.push({ code: match[1], subject });
                  }
                }
              });
            });

            f.on('end', () => {
              imap.end();
              if (codes.length > 0) {
                const latest = codes[codes.length - 1];
                console.log(`✓ Found: "${latest.subject}"`);
                console.log(`✓ Code: ${latest.code}\n`);
                resolve(latest.code);
              } else {
                reject(new Error('No 6-digit code found'));
              }
            });

            f.on('error', (err) => {
              imap.end();
              reject(err);
            });
          });
        });
      });

      imap.on('error', reject);
      imap.on('end', () => {});

      try {
        imap.connect();
      } catch (e) {
        reject(e);
      }
    }, waitSeconds * 1000);
  });
}

async function triggerCodeSend() {
  console.log('🔐 Triggering 2FA code send...\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('https://app.gohighlevel.com/', { waitUntil: 'domcontentloaded', timeout: 20000 });

    console.log('✓ At login page');

    // Fill email
    await page.waitForSelector('#email', { timeout: 5000 });
    await page.locator('#email').fill(GHL_EMAIL);
    await page.waitForTimeout(150);

    // Fill password
    await page.locator('#password').fill(GHL_PASSWORD);
    await page.waitForTimeout(150);

    // Click sign in
    await page.locator('button:has-text("Sign in")').click();
    console.log('✓ Credentials submitted');

    await page.waitForTimeout(1500);

    // Click send code button
    const sendBtn = page.locator('button:has-text("Send Security Code")');
    await sendBtn.click({ timeout: 5000 });
    console.log('✓ Code send triggered\n');

    // Wait before closing
    await page.waitForTimeout(1000);
    await browser.close();

    // Now retrieve code from email
    const code = await retrieveCodeFromEmail(12);
    return code;

  } catch (error) {
    await browser.close();
    throw error;
  }
}

(async () => {
  try {
    console.log('🚀 Fresh 2FA Code Retrieval\n');
    console.log('='.repeat(60) + '\n');

    const code = await triggerCodeSend();

    console.log('='.repeat(60));
    console.log(`\n✅ CODE READY: ${code}\n`);

    // Write to file for login-main.js to use
    fs.writeFileSync('/tmp/fresh-code.txt', code);
    console.log(`💾 Saved to: /tmp/fresh-code.txt`);

    process.exit(0);

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
})();
