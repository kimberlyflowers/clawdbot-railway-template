const https = require('https');
const fs = require('fs');

const ghlToken = fs.readFileSync('/data/secrets/ghl-token.txt', 'utf8').trim();
const locationId = 'iGy4nrpDVU0W1jAvseL3';

const payload = JSON.stringify({
  locationId: locationId,
  firstName: 'Charles',
  lastName: 'Flowers',
  email: 'cflowers@faith-outreach.org',
  tags: ['dad', 'family']
});

const options = {
  hostname: 'services.leadconnectorhq.com',
  port: 443,
  path: `/contacts/`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ghlToken}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
    'Content-Length': payload.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    try {
      const data = JSON.parse(body);
      if (res.statusCode === 201) {
        console.log('✓ Contact created successfully!');
        console.log('Contact ID:', data.contact?.id);
        process.exit(0);
      } else {
        console.log('Response:', body);
        process.exit(1);
      }
    } catch (e) {
      console.log('Response:', body);
      process.exit(1);
    }
  });
});

req.on('error', e => {
  console.error('Error:', e.message);
  process.exit(1);
});

req.write(payload);
req.end();
