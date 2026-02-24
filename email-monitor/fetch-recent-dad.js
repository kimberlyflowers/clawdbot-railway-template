const Imap = require('imap');
const fs = require('fs');

const gmailPassword = fs.readFileSync('/data/secrets/gmail-app-password.txt', 'utf8').trim();
const yahooPassword = fs.readFileSync('/data/secrets/yahoo-app-password.txt', 'utf8').trim();

async function checkAccount(accountEmail, password, host, accountName) {
  return new Promise((resolve) => {
    const imap = new Imap({
      user: accountEmail,
      password: password,
      host: host,
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    });

    let emailFound = null;

    imap.on('ready', function() {
      imap.openBox('INBOX', false, function(err, box) {
        if (err) {
          console.log(`[${accountName}] Box error: ${err.message}`);
          imap.end();
          return resolve(null);
        }

        imap.search([['HEADER', 'FROM', 'cflowers']], function(err, results) {
          if (err) {
            console.log(`[${accountName}] Search error: ${err.message}`);
            imap.end();
            return resolve(null);
          }

          if (results.length === 0) {
            console.log(`[${accountName}] No emails from cflowers`);
            imap.end();
            return resolve(null);
          }

          console.log(`[${accountName}] Found ${results.length} emails from cflowers, fetching newest...`);
          const lastResult = results.slice(-1);
          
          const f = imap.fetch(lastResult, { bodies: '' });
          
          f.on('message', function(msg, seqno) {
            let rawText = '';
            
            msg.on('body', function(stream, info) {
              stream.on('data', function(chunk) {
                rawText += chunk.toString('utf-8');
              });
              stream.on('end', function() {
                // Parse headers
                const lines = rawText.split('\r\n');
                let from = '';
                let subject = '';
                let date = '';
                let inBody = false;
                let body = [];
                
                for (let line of lines) {
                  if (inBody) {
                    body.push(line);
                  } else if (line.match(/^From:\s*(.+)$/i)) {
                    from = RegExp.$1;
                  } else if (line.match(/^Subject:\s*(.+)$/i)) {
                    subject = RegExp.$1;
                  } else if (line.match(/^Date:\s*(.+)$/i)) {
                    date = RegExp.$1;
                  } else if (line === '') {
                    inBody = true;
                  }
                }
                
                emailFound = {
                  account: accountName,
                  from,
                  subject,
                  date,
                  body: body.join('\n').substring(0, 1500)
                };
                
                imap.end();
              });
            });
          });

          f.on('error', function(err) {
            console.log(`[${accountName}] Fetch error: ${err.message}`);
            imap.end();
            resolve(null);
          });
        });
      });
    });

    imap.on('error', function(err) {
      console.log(`[${accountName}] IMAP error: ${err.message}`);
      resolve(null);
    });

    imap.on('end', function() {
      resolve(emailFound);
    });

    imap.connect();
  });
}

async function main() {
  const gmailResult = await checkAccount('thevisualbrandingexpert@gmail.com', gmailPassword, 'imap.gmail.com', 'GMAIL');
  const yahooResult = await checkAccount('flwrs_kmbrly@yahoo.com', yahooPassword, 'imap.mail.yahoo.com', 'YAHOO');
  
  console.log('\n=== MOST RECENT EMAIL FROM DAD ===');
  
  const latest = [gmailResult, yahooResult]
    .filter(x => x !== null)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  
  if (latest) {
    console.log(`Account: ${latest.account}`);
    console.log(`From: ${latest.from}`);
    console.log(`Subject: ${latest.subject}`);
    console.log(`Date: ${latest.date}`);
    console.log('\n--- MESSAGE ---\n');
    console.log(latest.body);
  } else {
    console.log('No recent emails found from cflowers');
  }
  
  console.log('\n=== END ===');
}

main();
