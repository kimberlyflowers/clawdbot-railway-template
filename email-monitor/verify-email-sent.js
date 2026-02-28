const https = require('https');
const fs = require('fs');

const ghlToken = fs.readFileSync('/data/secrets/ghl-token.txt', 'utf8').trim();
const conversationId = '3dHnEh2aSmopVPCwVbA5'; // From the response
const contactId = '2TeWXn6h6FocCFEeuek0';

// Get conversation details to verify message is there
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
    console.log(`Status: ${res.statusCode}`);
    try {
      const data = JSON.parse(body);
      
      if (res.statusCode === 200 && data.messages && data.messages.length > 0) {
        const lastMessage = data.messages[data.messages.length - 1];
        
        console.log('\n✓ Message found in conversation thread');
        console.log('From:', lastMessage.from || 'System');
        console.log('Subject:', lastMessage.subject || 'N/A');
        console.log('Body preview:', (lastMessage.body || lastMessage.html || '(empty)').substring(0, 200));
        
        if ((lastMessage.body || lastMessage.html) && lastMessage.subject === 'RE: on-going projects') {
          console.log('\n✅ EMAIL VERIFIED - Content is present and correct');
          process.exit(0);
        } else {
          console.log('\n⚠ Message found but content may be missing or incorrect');
          process.exit(1);
        }
      } else {
        console.log('No messages found or error:', body);
        process.exit(1);
      }
    } catch (e) {
      console.log('Parse error:', body);
      process.exit(1);
    }
  });
});

req.on('error', e => {
  console.error('Error:', e.message);
  process.exit(1);
});

req.end();
