#!/usr/bin/env node

/**
 * Send daily email campaign to Educators
 * Runs at 12 PM UTC daily
 * Reads blog post for day, creates email, sends to educator segment
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const GHL_TOKEN = fs.readFileSync('/data/secrets/ghl-token.txt', 'utf8').trim();
const EDUCATOR_SEGMENT_ID = 'educators'; // GHL segment name

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];

// Read blog post for today
const blogPath = path.join(__dirname, '..', '..', 'campaigns', 'educators', `blog-${today}.md`);

if (!fs.existsSync(blogPath)) {
  console.error(`Blog post not found: ${blogPath}`);
  process.exit(1);
}

const blogContent = fs.readFileSync(blogPath, 'utf8');

// Extract title and create email
const lines = blogContent.split('\n');
const titleLine = lines.find(line => line.startsWith('# '));
const title = titleLine ? titleLine.replace('# ', '').trim() : 'Daily Insight for Educators';

// Create email body (HTML version of blog)
const emailSubject = `💡 ${title}`;
const emailBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
  <p style="color: #666; font-size: 14px;">Hi there,</p>
  
  <div style="color: #333; font-size: 16px; line-height: 1.6;">
    ${blogContent.replace(/^# .*$/m, '').replace(/\n/g, '<br/>')}
  </div>
  
  <p style="color: #666; font-size: 14px; margin-top: 30px;">
    Reply to this email with your thoughts. We read every response.
  </p>
</div>
`;

// Send via GHL API
const ghlApiCall = (method, endpoint, body = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'rest.gohighlevel.com',
      path: `/v1${endpoint}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

// Main execution
(async () => {
  try {
    console.log(`[${new Date().toISOString()}] Sending educator campaign email...`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`Segment: ${EDUCATOR_SEGMENT_ID}`);

    // Get contacts in educator segment from GHL
    const contactsResponse = await ghlApiCall('GET', `/contacts?search=${EDUCATOR_SEGMENT_ID}`);
    
    if (!contactsResponse.data.contacts || contactsResponse.data.contacts.length === 0) {
      console.log('No contacts found in educator segment');
      process.exit(0);
    }

    const educatorContacts = contactsResponse.data.contacts;
    console.log(`Found ${educatorContacts.length} educators to email`);

    // Send email to each educator
    let sent = 0;
    let failed = 0;

    for (const contact of educatorContacts) {
      try {
        await ghlApiCall('POST', '/messages/email', {
          to: contact.email,
          subject: emailSubject,
          body: emailBody,
          from: 'noreply@bloom-ai.com'
        });
        sent++;
      } catch (err) {
        console.error(`Failed to send to ${contact.email}: ${err.message}`);
        failed++;
      }
    }

    // Log results
    const logEntry = `${new Date().toISOString()} | Educators | Sent: ${sent} | Failed: ${failed} | Subject: ${emailSubject}\n`;
    fs.appendFileSync(path.join(__dirname, '..', '..', 'campaigns', '.email-log'), logEntry);

    console.log(`✅ Campaign sent: ${sent} emails delivered`);
    if (failed > 0) console.log(`⚠️ Failed: ${failed} emails`);

  } catch (error) {
    console.error('Error sending campaign:', error);
    process.exit(1);
  }
})();
