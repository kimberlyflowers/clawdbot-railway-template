const Imap = require('imap');
const { simpleParser } = require('mailparser');
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

let foundEmail = false;

imap.on('ready', function() {
  imap.openBox('INBOX', false, function(err, box) {
    if (err) {
      console.error('Box error:', err.message);
      imap.end();
      return;
    }
    
    imap.search([['HEADER', 'FROM', 'cflowers']], function(err, results) {
      if (err) {
        console.error('Search error:', err.message);
        imap.end();
        return;
      }
      
      if (results.length === 0) {
        console.log('No emails from cflowers found');
        imap.end();
        return;
      }
      
      const lastResult = results.slice(-1);
      
      // Fetch both headers and body
      const f = imap.fetch(lastResult, { bodies: '' });
      
      f.on('message', function(msg, seqno) {
        let text = '';
        let from = '';
        let subject = '';
        let date = '';
        
        msg.on('body', function(stream, info) {
          stream.on('data', function(chunk) {
            text += chunk.toString('utf-8');
          });
          stream.on('end', function() {
            // Parse the raw message
            const lines = text.split('\r\n');
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
            
            if (!foundEmail) {
              foundEmail = true;
              console.log('=== LAST EMAIL FROM DAD ===');
              console.log('From:', from || '(not found)');
              console.log('Subject:', subject || '(no subject)');
              console.log('Date:', date || '(not found)');
              console.log('\n--- MESSAGE ---\n');
              console.log(body.join('\n').substring(0, 2000));
              console.log('\n=== END ===');
              imap.end();
            }
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
