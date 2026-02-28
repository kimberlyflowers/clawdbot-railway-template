const https = require('https');
const fs = require('fs');

const ghlToken = fs.readFileSync('/data/secrets/ghl-token.txt', 'utf8').trim();
const contactId = '2TeWXn6h6FocCFEeuek0';

const messageBody = `<p>Hi Dad,</p>

<p>Thank you for sending over the project list. I'm ready to move forward on these items and want to make sure I have everything clearly.</p>

<p>Here's what I'm capturing:</p>

<ol>
<li><strong>25-slide deck with talking points</strong> — I'll create this based on the 80-page ACS accreditation document. I'll reach out if I need to clarify any sections.</li>
<li><strong>Establish a publishing company</strong> — I'm taking notes on this. Can you send me more details on the timeline and scope? Are we looking at a general blueprint or something we launch immediately?</li>
<li><strong>Bloomie for your books</strong> — I can allocate one of my AI employees to help you write your two books. What's the timeline on this, and do you have an outline or topic breakdown ready?</li>
<li><strong>[Item #4 appears to be incomplete in your email]</strong> — I noticed the last item didn't come through. Can you resend what you need for #4?</li>
</ol>

<p>Once I hear back on these clarifications, I can get started right away.</p>

<p>God bless,<br/>
Kimberly</p>`;

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
    console.log(`Status: ${res.statusCode}`);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✓ Email sent with correct payload');
      console.log('Response:', body);
    } else {
      console.log('Error:', body);
    }
    process.exit(res.statusCode >= 200 && res.statusCode < 300 ? 0 : 1);
  });
});

req.on('error', e => {
  console.error('Error:', e.message);
  process.exit(1);
});

req.write(payload);
req.end();
