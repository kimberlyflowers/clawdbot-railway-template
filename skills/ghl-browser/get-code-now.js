/**
 * Get 2FA Code from Yahoo Email - Simple Approach
 * Uses IMAP + manual parsing (no mailparser dependency)
 */

const Imap = require('imap');

async function getCodeFromYahoo() {
  console.log('📧 Fetching 2FA code from Yahoo email...\n');

  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: 'flwrs_kmbrly@yahoo.com',
      password: 'vjebaceqhppxtyqe',
      host: 'imap.mail.yahoo.com',
      port: 993,
      tls: true,
      connTimeout: 10000,
      authTimeout: 10000,
    });

    let foundCode = null;
    let emailCount = 0;

    imap.on('ready', () => {
      console.log('✓ Connected to Yahoo IMAP');

      imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          imap.end();
          reject(err);
          return;
        }

        console.log(`✓ Inbox opened (${box.messages.total} messages)`);

        // Get unseen or last 5 emails
        imap.search(['UNSEEN'], (err, results) => {
          if (err) {
            // If no unseen, get last 5
            const total = box.messages.total;
            results = [];
            for (let i = 0; i < Math.min(5, total); i++) {
              results.push(total - i);
            }
          }

          if (results.length === 0) {
            imap.end();
            reject(new Error('No emails found'));
            return;
          }

          console.log(`Checking ${results.length} emails...`);

          const f = imap.fetch(results, { bodies: '' });

          f.on('message', (msg, seqno) => {
            emailCount++;
            let emailData = '';

            msg.on('body', (stream, info) => {
              stream.on('data', (chunk) => {
                emailData += chunk.toString('utf8');
              });

              stream.on('end', () => {
                // Parse email to extract code
                const code = extractCodeFromEmail(emailData);
                if (code && !foundCode) {
                  console.log(`✓ Email ${emailCount}: Found code ${code}`);
                  foundCode = code;
                } else if (!code) {
                  console.log(`  Email ${emailCount}: No code found`);
                }
              });
            });

            msg.on('attributes', (attrs) => {
              // Log sender info if available
            });
          });

          f.on('error', (err) => {
            console.log(`Fetch error: ${err.message}`);
          });

          f.on('end', () => {
            imap.end();
          });
        });
      });
    });

    imap.on('error', (err) => {
      reject(new Error(`IMAP error: ${err.message}`));
    });

    imap.on('end', () => {
      if (foundCode) {
        resolve(foundCode);
      } else {
        reject(new Error('No 2FA code found in emails'));
      }
    });

    console.log('Connecting...');
    imap.connect();

    // Timeout after 25 seconds
    setTimeout(() => {
      if (imap) imap.end();
      if (!foundCode) {
        reject(new Error('Timeout (25s) - no code found'));
      }
    }, 25000);
  });
}

function extractCodeFromEmail(emailData) {
  if (!emailData) return null;

  // Look for 6-digit code
  const match = emailData.match(/\b(\d{6})\b/);
  if (match) return match[1];

  // Look for "123 456" format
  const spaced = emailData.match(/(\d{3})\s+(\d{3})/);
  if (spaced) return spaced[1] + spaced[2];

  return null;
}

// Run
getCodeFromYahoo()
  .then((code) => {
    console.log(`\n✅ Got code: ${code}`);
    console.log(`\nUsage: node login-and-save-session.js ${code}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(`\n❌ Failed: ${err.message}`);
    process.exit(1);
  });
