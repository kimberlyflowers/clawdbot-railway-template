const https = require('https');
const fs = require('fs');

const ghlToken = fs.readFileSync('/data/secrets/ghl-token.txt', 'utf8').trim();
const locationId = 'iGy4nrpDVU0W1jAvseL3';
const contactId = '2TeWXn6h6FocCFEeuek0';

const options = {
  hostname: 'services.leadconnectorhq.com',
  port: 443,
  path: `/conversations?locationId=${locationId}&contactId=${contactId}`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${ghlToken}`,
    'Accept': 'application/json',
    'Version': '2021-07-28'
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const data = JSON.parse(body);
        if (data.conversations && data.conversations.length > 0) {
          const convoId = data.conversations[0].id;
          console.log('✓ Found conversation ID:', convoId);
          process.exit(0);
        } else {
          console.log('No conversations found. Response:', body);
          process.exit(1);
        }
      } catch (e) {
        console.log('Parse error:', body);
        process.exit(1);
      }
    } else {
      console.log('Response:', body);
      process.exit(1);
    }
  });
});

req.on('error', e => {
  console.error('Error:', e.message);
  process.exit(1);
});

req.end();
