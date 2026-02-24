const https = require('https');
const fs = require('fs');

const ghlToken = fs.readFileSync('/data/secrets/ghl-token.txt', 'utf8').trim();
const locationId = 'iGy4nrpDVU0W1jAvseL3'; // From TOOLS.md

// First, find or create contact for dad
const contactPayload = JSON.stringify({
  firstName: 'Charles',
  lastName: 'Flowers',
  email: 'cflowers@faith-outreach.org'
});

const contactOptions = {
  hostname: 'api.gohighlevel.com',
  port: 443,
  path: `/v1/contacts/?locationId=${locationId}`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ghlToken}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

const contactReq = https.request(contactOptions, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const contactData = JSON.parse(body);
      const contactId = contactData.contact?.id || contactData.id;
      
      if (!contactId) {
        console.error('Failed to get contact ID:', body);
        process.exit(1);
      }

      // Now send email via conversations API
      const emailPayload = JSON.stringify({
        conversationProviderId: contactId,
        message: `Hi Dad,

Thank you for sending over the project list. I'm ready to move forward on these items and want to make sure I have everything clearly.

Here's what I'm capturing:

1. 25-slide deck with talking points — I'll create this based on the 80-page ACS accreditation document. I'll reach out if I need to clarify any sections.

2. Establish a publishing company — I'm taking notes on this. Can you send me more details on the timeline and scope? Are we looking at a general blueprint or something we launch immediately?

3. Bloomie for your books — I can allocate one of my AI employees to help you write your two books. What's the timeline on this, and do you have an outline or topic breakdown ready?

4. [Item #4 appears to be incomplete in your email] — I noticed the last item didn't come through. Can you resend what you need for #4?

Once I hear back on these clarifications, I can get started right away.

God bless,
Kimberly`,
        type: 'EMAIL'
      });

      const emailOptions = {
        hostname: 'api.gohighlevel.com',
        port: 443,
        path: `/v1/conversations/messages?locationId=${locationId}`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ghlToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      };

      const emailReq = https.request(emailOptions, (res) => {
        let emailBody = '';
        res.on('data', chunk => emailBody += chunk);
        res.on('end', () => {
          console.log(`Status: ${res.statusCode}`);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✓ Email sent successfully via GHL!');
            process.exit(0);
          } else {
            console.log('Error:', emailBody);
            process.exit(1);
          }
        });
      });

      emailReq.on('error', e => {
        console.error('Email request error:', e.message);
        process.exit(1);
      });

      emailReq.write(emailPayload);
      emailReq.end();
    } catch (e) {
      console.error('Parse error:', e.message);
      process.exit(1);
    }
  });
});

contactReq.on('error', e => {
  console.error('Contact request error:', e.message);
  process.exit(1);
});

contactReq.write(contactPayload);
contactReq.end();
