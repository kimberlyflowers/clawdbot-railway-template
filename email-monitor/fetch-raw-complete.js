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

      const lastResult = results.slice(-1);
      const f = imap.fetch(lastResult, { bodies: '' });
      
      f.on('message', function(msg, seqno) {
        let allData = '';
        
        msg.on('body', function(stream, info) {
          stream.on('data', function(chunk) {
            allData += chunk.toString('utf-8');
          });
          stream.on('end', function() {
            // Save to file for analysis
            fs.writeFileSync('/tmp/full-email-raw.txt', allData);
            console.log('Raw email saved to /tmp/full-email-raw.txt');
            console.log(`Total characters: ${allData.length}`);
            console.log('\n--- COMPLETE EMAIL CONTENT ---\n');
            console.log(allData);
            console.log('\n--- END OF EMAIL ---');
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
