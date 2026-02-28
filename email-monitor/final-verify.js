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
      
      console.log('✅ FINAL VERIFICATION\n');
      console.log('Subject:', latestEmail.meta.email.subject);
      console.log('Sent:', latestEmail.dateAdded);
      console.log('\n--- EMAIL BODY ---\n');
      console.log(latestEmail.body);
      console.log('\n--- END ---\n');
      
      // Check for all required content with emphasis markers
      const hasItem1 = latestEmail.body.includes('*25-slide deck with talking points*');
      const hasItem2 = latestEmail.body.includes('*Establish a publishing company*');
      const hasItem3 = latestEmail.body.includes('*Bloomie for your books*');
      const hasItem4 = latestEmail.body.includes('*[Item #4 appears to be incomplete in your email]*');
      const hasClosure = latestEmail.body.includes('God bless,\nKimberly');
      
      if (hasItem1 && hasItem2 && hasItem3 && hasItem4 && hasClosure) {
        console.log('✅ VERIFICATION PASSED');
        console.log('All approved content with formatting is present');
        console.log('- Item 1: ✓ 25-slide deck (with emphasis)');
        console.log('- Item 2: ✓ Publishing company (with emphasis)');
        console.log('- Item 3: ✓ Bloomie for books (with emphasis)');
        console.log('- Item 4: ✓ Incomplete item marker (with emphasis)');
        console.log('- Closure: ✓ Full signature');
        process.exit(0);
      } else {
        console.log('❌ Missing content elements');
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
