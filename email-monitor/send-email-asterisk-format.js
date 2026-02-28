const https = require('https');
const fs = require('fs');

const ghlToken = fs.readFileSync('/data/secrets/ghl-token.txt', 'utf8').trim();
const contactId = '2TeWXn6h6FocCFEeuek0';

// Using asterisks for emphasis instead of HTML (works in plain text)
const messageBody = `Hi Dad,

Thank you for sending over the project list. I'm ready to move forward on these items and want to make sure I have everything clearly.

Here's what I'm capturing:

1. *25-slide deck with talking points* — I'll create this based on the 80-page ACS accreditation document. I'll reach out if I need to clarify any sections.

2. *Establish a publishing company* — I'm taking notes on this. Can you send me more details on the timeline and scope? Are we looking at a general blueprint or something we launch immediately?

3. *Bloomie for your books* — I can allocate one of my AI employees to help you write your two books. What's the timeline on this, and do you have an outline or topic breakdown ready?

4. *[Item #4 appears to be incomplete in your email]* — I noticed the last item didn't come through. Can you resend what you need for #4?

Once I hear back on these clarifications, I can get started right away.

God bless,
Kimberly`;

const payload = JSON.stringify({
  type: 'Email',
  contactId: contactId,
  subject: 'RE: on-going projects',
  html: messageBody
});

const options = {
  hostname: 'services.leadconnectorhq.com',
  port: 443,
  path: `/conversations/messages`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ghlToken}`,
    'Content-Type': 'application/json',
    'Version': '2021-04-15',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const response = JSON.parse(body);
        console.log('Status: 201 - Email sent with asterisk formatting');
        console.log('Message ID:', response.messageId);
      } catch (e) {
        console.log('Sent but parse error:', body);
      }
      process.exit(0);
    } else {
      console.log('Error:', res.statusCode, body);
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
