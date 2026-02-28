const https = require('https');
const fs = require('fs');

const ghlToken = fs.readFileSync('/data/secrets/ghl-token.txt', 'utf8').trim();
const locationId = 'iGy4nrpDVU0W1jAvseL3';
const contactId = '2TeWXn6h6FocCFEeuek0';

const messageBody = `Hi Dad,

Thank you for sending over the project list. I'm ready to move forward on these items and want to make sure I have everything clearly.

Here's what I'm capturing:

1. 25-slide deck with talking points — I'll create this based on the 80-page ACS accreditation document. I'll reach out if I need to clarify any sections.

2. Establish a publishing company — I'm taking notes on this. Can you send me more details on the timeline and scope? Are we looking at a general blueprint or something we launch immediately?

3. Bloomie for your books — I can allocate one of my AI employees to help you write your two books. What's the timeline on this, and do you have an outline or topic breakdown ready?

4. [Item #4 appears to be incomplete in your email] — I noticed the last item didn't come through. Can you resend what you need for #4?

Once I hear back on these clarifications, I can get started right away.

God bless,
Kimberly`;

const payload = JSON.stringify({
  contactId: contactId,
  body: messageBody,
  type: 'Email',
  emailTo: 'cflowers@faith-outreach.org',
  emailFrom: 'flwrs_kmbrly@yahoo.com'
});

const options = {
  hostname: 'services.leadconnectorhq.com',
  port: 443,
  path: `/conversations/messages/inbound?locationId=${locationId}`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ghlToken}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✓✓✓ EMAIL SENT SUCCESSFULLY TO YOUR DAD! ✓✓✓');
      process.exit(0);
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

req.write(payload);
req.end();
