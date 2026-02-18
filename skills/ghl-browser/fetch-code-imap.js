/**
 * Direct IMAP Code Fetcher
 * Minimal, focused approach
 */

const Imap = require('imap');
const { simpleParser } = require('mailparser');

async function fetchCodeFromImap() {
  console.log('Fetching latest email code from Yahoo IMAP...\n');

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

    imap.on('ready', () => {
      console.log('✓ IMAP connected');

      imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          imap.end();
          reject(err);
          return;
        }

        console.log(`✓ Inbox opened (${box.messages.total} total messages)`);

        // Search for unseen emails or get latest 5
        imap.search(['UNSEEN'], (err, uids) => {
          if (err) {
            imap.end();
            reject(err);
            return;
          }

          let toFetch = uids;
          if (!uids || uids.length === 0) {
            console.log('No unseen emails, getting last 5...');
            const all = Array(Math.min(5, box.messages.total))
              .fill(0)
              .map((_, i) => box.messages.total - i);
            toFetch = all;
          }

          console.log(`Fetching ${toFetch.length} emails...`);

          const f = imap.fetch(toFetch, { bodies: '' });

          f.on('message', (msg, seqno) => {
            simpleParser(msg, async (err, parsed) => {
              if (err) return;

              if (parsed.from) {
                console.log(`Email ${seqno}: ${parsed.from.text}`);
              }

              const content = (parsed.text || '') + (parsed.html || '');
              const code = extractCode(content);

              if (code && !foundCode) {
                console.log(`✓ Found code: ${code}`);
                foundCode = code;
              }
            });
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
        console.log(`\n✅ Success: ${foundCode}`);
        resolve(foundCode);
      } else {
        reject(new Error('No code found in emails'));
      }
    });

    console.log('Connecting to Yahoo IMAP...');
    imap.connect();

    // Timeout after 30 seconds
    setTimeout(() => {
      if (imap) {
        imap.end();
        if (!foundCode) {
          reject(new Error('IMAP timeout (30s)'));
        }
      }
    }, 30000);
  });
}

function extractCode(content) {
  if (!content) return null;
  const match = content.match(/\b(\d{6})\b/);
  if (match) return match[1];
  const spaced = content.match(/(\d{3})\s+(\d{3})/);
  if (spaced) return spaced[1] + spaced[2];
  return null;
}

// Test
fetchCodeFromImap()
  .then((code) => {
    console.log(`\nCode: ${code}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(`\n❌ Error: ${err.message}`);
    process.exit(1);
  });
