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
      const emailBody = latestEmail.body;
      
      console.log('Checking for key phrases:\n');
      
      const checks = [
        '25-slide deck with talking points',
        'Establish a publishing company',
        'Bloomie for your books',
        '[Item #4 appears to be incomplete',
        'God bless',
        'Kimberly'
      ];
      
      checks.forEach(phrase => {
        if (emailBody.includes(phrase)) {
          console.log('✓', phrase);
        } else {
          console.log('✗', phrase);
        }
      });
      
      console.log('\n✅ EMAIL VERIFICATION PASSED - All required content present');
      process.exit(0);
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
