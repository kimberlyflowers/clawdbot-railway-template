const Imap = require('imap');
const fs = require('fs');

const gmailPassword = fs.readFileSync('/data/secrets/gmail-app-password.txt', 'utf8').trim();

const imap = new Imap({
  user: 'thevisualbrandingexpert@gmail.com',
  password: gmailPassword,
  host: 'imap.gmail.com',
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
        console.log('No emails from cflowers found');
        imap.end();
        return;
      }
      
      console.log(`Found ${results.length} emails from cflowers`);
      const lastResult = results.slice(-1);
      
      // Fetch headers only
      const f = imap.fetch(lastResult, { bodies: 'HEADER' });
      
      f.on('message', function(msg, seqno) {
        let header = '';
        msg.on('body', function(stream, info) {
          stream.on('data', function(chunk) {
            header += chunk.toString();
          });
          stream.on('end', function() {
            console.log('\n=== LAST EMAIL FROM DAD ===');
            console.log(header);
            console.log('=== END ===\n');
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
