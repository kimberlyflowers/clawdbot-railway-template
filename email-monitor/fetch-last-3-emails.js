const Imap = require('imap');
const fs = require('fs');

const gmailPassword = fs.readFileSync('/data/secrets/gmail-app-password.txt', 'utf8').trim();
const yahooPassword = fs.readFileSync('/data/secrets/yahoo-app-password.txt', 'utf8').trim();

async function fetchEmails(accountEmail, password, host, accountName) {
  return new Promise((resolve) => {
    const imap = new Imap({
      user: accountEmail,
      password: password,
      host: host,
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    });

    const emails = [];

    imap.on('ready', function() {
      imap.openBox('INBOX', false, function(err, box) {
        if (err) {
          console.log(`[${accountName}] Box error: ${err.message}`);
          imap.end();
          return resolve([]);
        }

        imap.search([['HEADER', 'FROM', 'cflowers']], function(err, results) {
          if (err) {
            console.log(`[${accountName}] Search error: ${err.message}`);
            imap.end();
            return resolve([]);
          }

          if (results.length === 0) {
            console.log(`[${accountName}] No emails from cflowers`);
            imap.end();
            return resolve([]);
          }

          // Get last 3
          const lastThree = results.slice(-3);
          console.log(`[${accountName}] Found ${results.length} total, fetching last 3...`);
          
          const f = imap.fetch(lastThree, { bodies: '' });
          let processed = 0;

          f.on('message', function(msg, seqno) {
            let rawText = '';
            
            msg.on('body', function(stream, info) {
              stream.on('data', function(chunk) {
                rawText += chunk.toString('utf-8');
              });
              stream.on('end', function() {
                emails.push({
                  account: accountName,
                  raw: rawText
                });
                processed++;
                if (processed === lastThree.length) {
                  imap.end();
                }
              });
            });
          });

          f.on('error', function(err) {
            console.log(`[${accountName}] Fetch error: ${err.message}`);
            imap.end();
            resolve([]);
          });
        });
      });
    });

    imap.on('error', function(err) {
      console.log(`[${accountName}] IMAP error: ${err.message}`);
      resolve([]);
    });

    imap.on('end', function() {
      resolve(emails);
    });

    imap.connect();
  });
}

function parseEmail(rawText) {
  const lines = rawText.split('\r\n');
  let from = '';
  let subject = '';
  let date = '';
  let to = '';
  let inBody = false;
  let body = [];
  
  for (let line of lines) {
    if (inBody) {
      body.push(line);
    } else if (line.match(/^From:\s*(.+)$/i)) {
      from = RegExp.$1;
    } else if (line.match(/^To:\s*(.+)$/i)) {
      to = RegExp.$1;
    } else if (line.match(/^Subject:\s*(.+)$/i)) {
      subject = RegExp.$1;
    } else if (line.match(/^Date:\s*(.+)$/i)) {
      date = RegExp.$1;
    } else if (line === '') {
      inBody = true;
    }
  }
  
  return { from, to, subject, date, body: body.join('\n') };
}

async function main() {
  console.log('Fetching emails...\n');
  const gmailEmails = await fetchEmails('thevisualbrandingexpert@gmail.com', gmailPassword, 'imap.gmail.com', 'GMAIL');
  const yahooEmails = await fetchEmails('flwrs_kmbrly@yahoo.com', yahooPassword, 'imap.mail.yahoo.com', 'YAHOO');
  
  const allEmails = [...gmailEmails, ...yahooEmails]
    .map(e => {
      const parsed = parseEmail(e.raw);
      return { ...parsed, account: e.account, raw: e.raw };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  if (allEmails.length === 0) {
    console.log('No emails found');
    return;
  }

  allEmails.forEach((email, idx) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`EMAIL #${idx + 1}`);
    console.log(`${'='.repeat(80)}`);
    console.log(`Account: ${email.account}`);
    console.log(`From: ${email.from}`);
    console.log(`To: ${email.to}`);
    console.log(`Subject: ${email.subject}`);
    console.log(`Date: ${email.date}`);
    console.log(`\n--- MESSAGE ---\n`);
    console.log(email.body);
    console.log(`\n${'='.repeat(80)}\n`);
  });
}

main();
