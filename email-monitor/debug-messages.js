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
    try {
      const data = JSON.parse(body);
      const allMessages = data.messages.messages;
      
      console.log(`Total messages: ${allMessages.length}\n`);
      
      allMessages.slice(0, 5).forEach((msg, idx) => {
        console.log(`Message ${idx}:`);
        console.log(`  Type: ${msg.messageType}`);
        console.log(`  Direction: ${msg.direction}`);
        if (msg.meta && msg.meta.email) {
          console.log(`  Subject: ${msg.meta.email.subject}`);
        }
        console.log(`  Date: ${msg.dateAdded}`);
        console.log(`  Body length: ${msg.body ? msg.body.length : 0}`);
        if (msg.body && msg.body.includes('<strong>')) {
          console.log(`  ✓ Has <strong> tags`);
        }
        console.log('');
      });
    } catch (e) {
      console.log('Error:', e.message);
    }
  });
});

req.on('error', e => {
  console.error('Error:', e.message);
});

req.end();
