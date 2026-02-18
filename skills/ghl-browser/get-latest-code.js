/**
 * Get Latest 2FA Code - Fixed Approach
 * Fetches only the most recent email
 */

const Imap = require('imap');

async function getLatestCode() {
  console.log('📧 Fetching latest code from Yahoo...\n');

  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: 'flwrs_kmbrly@yahoo.com',
      password: 'vjebaceqhppxtyqe',
      host: 'imap.mail.yahoo.com',
      port: 993,
      tls: true,
    });

    let foundCode = null;

    imap.on('ready', () => {
      console.log('✓ Connected');

      imap.openBox('INBOX', false, (err, box) => {
        if (err) throw err;

        console.log(`✓ Inbox: ${box.messages.total} messages`);

        // Get ONLY the most recent email
        const latestId = box.messages.total;
        console.log(`Fetching latest email (ID: ${latestId})...`);

        if (latestId === 0) {
          imap.end();
          reject(new Error('No emails'));
          return;
        }

        const f = imap.fetch(latestId, { bodies: '' });

        f.on('message', (msg, seqno) => {
          let data = '';

          msg.on('body', (stream) => {
            stream.on('data', (chunk) => {
              data += chunk.toString('utf8');
            });

            stream.on('end', () => {
              const code = extractCode(data);
              if (code) {
                console.log(`✓ Found: ${code}`);
                foundCode = code;
              } else {
                console.log('✗ No code in latest email');
                // Try previous email
                if (latestId > 1) {
                  console.log('Trying previous email...');
                  const f2 = imap.fetch(latestId - 1, { bodies: '' });
                  f2.on('message', (msg2) => {
                    let data2 = '';
                    msg2.on('body', (stream2) => {
                      stream2.on('data', (chunk2) => {
                        data2 += chunk2.toString('utf8');
                      });
                      stream2.on('end', () => {
                        const code2 = extractCode(data2);
                        if (code2) {
                          console.log(`✓ Found: ${code2}`);
                          foundCode = code2;
                        }
                      });
                    });
                  });
                  f2.on('end', () => imap.end());
                } else {
                  imap.end();
                }
              }
            });
          });
        });

        f.on('end', () => {
          setTimeout(() => imap.end(), 500);
        });
      });
    });

    imap.on('error', reject);

    imap.on('end', () => {
      if (foundCode) {
        resolve(foundCode);
      } else {
        reject(new Error('No code found'));
      }
    });

    imap.connect();

    setTimeout(() => {
      imap.end();
      if (!foundCode) reject(new Error('Timeout'));
    }, 20000);
  });
}

function extractCode(data) {
  const match = data.match(/\b(\d{6})\b/);
  return match ? match[1] : null;
}

getLatestCode()
  .then((code) => {
    console.log(`\n✅ Code: ${code}`);
    console.log(`Command: node login-and-save-session.js ${code}\n`);
  })
  .catch((err) => {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  });
