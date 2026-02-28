const Imap = require('imap');
const fs = require('fs');

const yahooPassword = fs.readFileSync('/data/secrets/yahoo-app-password.txt', 'utf8').trim();

const imap = new Imap({
  user: 'flwrs_kmbrly@yahoo.com',
  password: yahooPassword,
  host: 'imap.mail.yahoo.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

imap.on('ready', function() {
  imap.openBox('INBOX', false, function(err, box) {
    if (err) throw err;

    imap.search([['HEADER', 'FROM', 'cflowers']], function(err, results) {
      if (err) throw err;

      if (results.length === 0) {
        console.log('No emails found');
        imap.end();
        return;
      }

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
            
            console.log('=== FULL EMAIL FROM DAD ===');
            console.log('From:', from);
            console.log('Subject:', subject);
            console.log('Date:', date);
            console.log('\n--- MESSAGE ---\n');
            console.log(body.join('\n'));
            console.log('\n=== END ===');
            
            imap.end();
          });
        });
      });

      f.on('error', function(err) {
        console.error('Fetch error:', err.message);
        imap.end();
      });
    });
  });
});

imap.on('error', function(err) {
  console.error('IMAP error:', err.message);
  process.exit(1);
});

imap.on('end', function() {
  process.exit(0);
});

imap.connect();
