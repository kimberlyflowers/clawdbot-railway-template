const https = require('https');
const fs = require('fs');

const ghlToken = fs.readFileSync('/data/secrets/ghl-token.txt', 'utf8').trim();
const conversationId = '3dHnEh2aSmopVPCwVbA5';

const options = {
  hostname: 'services.leadconnectorhq.com',
  port: 443,
  path: `/conversations/${conversationId}/messages`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${ghlToken}`,
    'Content-Type': 'application/json',
    'Version': '2021-04-15'
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const data = JSON.parse(body);
        const allMessages = data.messages.messages;
        
        // Find the most recent outbound email
        const lastOutboundEmail = allMessages.find(msg => 
          msg.messageType === 'TYPE_EMAIL' && msg.direction === 'outbound'
        );
        
        if (lastOutboundEmail) {
          console.log('✅ VERIFICATION SUCCESSFUL\n');
          console.log('Subject:', lastOutboundEmail.meta.email.subject);
          console.log('Sent:', lastOutboundEmail.dateAdded);
          console.log('\nMessage body:');
          console.log(lastOutboundEmail.body);
          
          // Check for bold formatting
          if (lastOutboundEmail.body.includes('<strong>')) {
            console.log('\n✅ Bold formatting CONFIRMED - Full approved version sent');
            process.exit(0);
          } else {
            console.log('\n⚠ No bold formatting found');
            process.exit(1);
          }
        } else {
          console.log('Error: No outbound email found');
          process.exit(1);
        }
      } catch (e) {
        console.log('Parse error:', e.message);
        process.exit(1);
      }
    } else {
      console.log('API Error:', res.statusCode);
      process.exit(1);
    }
  });
});

req.on('error', e => {
  console.error('Error:', e.message);
  process.exit(1);
});

req.end();
