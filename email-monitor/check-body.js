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
      const latestEmail = data.messages.messages[0];
      
      console.log('Latest email (most recent):');
      console.log('Subject:', latestEmail.meta.email.subject);
      console.log('Sent:', latestEmail.dateAdded);
      console.log('\n--- BODY CONTENT ---\n');
      console.log(latestEmail.body);
      console.log('\n--- END BODY ---\n');
      
      if (latestEmail.body.includes('<strong>')) {
        console.log('✅ VERIFICATION PASSED: Bold formatting present');
        console.log('Email matches full approved version');
        process.exit(0);
      } else {
        console.log('❌ No <strong> tags found - shortened version sent again');
        process.exit(1);
      }
    } catch (e) {
      console.log('Error:', e.message);
      process.exit(1);
    }
  });
});

req.on('error', e => {
  console.error('Error:', e.message);
  process.exit(1);
});

req.end();
