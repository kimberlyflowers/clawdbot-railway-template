const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function createAndPopulate() {
  try {
    await client.connect();
    
    // Create bloom_kb table
    console.log('Creating bloom_kb table...');
    await client.query(`
      CREATE TABLE bloom_kb (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log('✓ bloom_kb created\n');
    
    // Get existing GHL email guide from jaden_kb
    console.log('Migrating GHL email sending guide...');
    const jmailResult = await client.query(
      'SELECT content FROM jaden_kb WHERE id = 1'
    );
    
    const emailGuideContent = jmailResult.rows[0].content;
    
    const emailEntry = await client.query(
      'INSERT INTO bloom_kb (title, content, category) VALUES ($1, $2, $3) RETURNING id',
      ['GHL Email Sending - Complete Implementation Guide', emailGuideContent, 'STARTER_BRAIN']
    );
    console.log('✓ Email guide migrated (id:', emailEntry.rows[0].id + ')');
    
    // GHL SMS Sending
    console.log('Adding GHL SMS sending...');
    const smsContent = `# GHL SMS Sending - Implementation Guide

## Endpoint
**POST** \`https://services.leadconnectorhq.com/conversations/messages\`

## Required Headers
\`\`\`json
{
  "Authorization": "Bearer YOUR_GHL_TOKEN",
  "Content-Type": "application/json",
  "Version": "2021-04-15"
}
\`\`\`

## Request Payload
\`\`\`json
{
  "type": "SMS",
  "contactId": "CONTACT_ID_HERE",
  "message": "Your SMS message here"
}
\`\`\`

## Field Definitions
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| \`type\` | String | Yes | Must be exactly \`"SMS"\` (capital) |
| \`contactId\` | String | Yes | GHL contact ID |
| \`message\` | String | Yes | SMS body (no HTML support) |

## Important Notes
- SMS messages are plain text only — no HTML formatting
- Character limit: typically 160 characters per message
- Longer messages split into multiple SMS (concatenation)
- Message type in conversation shows as TYPE_SMS
- Verify via same API method as email (GET /conversations/{conversationId}/messages)

## Verification
After sending, verify via:
\`\`\`
GET https://services.leadconnectorhq.com/conversations/{conversationId}/messages
\`\`\`

Check for:
- \`messageType\` = \`"TYPE_SMS"\`
- \`body\` contains your message
- \`meta.sms\` contains phone details

## Common Errors
| Error | Cause | Fix |
|-------|-------|-----|
| \`type must be a valid enum value\` | Wrong type | Use exactly \`"SMS"\` |
| \`Missing required field: message\` | Empty message | Include message text |
| \`401 Unauthorized\` | Invalid token | Check GHL token |

## Example Code
\`\`\`javascript
const payload = JSON.stringify({
  type: 'SMS',
  contactId: '2TeWXn6h6FocCFEeuek0',
  message: 'Your message here'
});
\`\`\`

## Next Steps
- Combine SMS + Email + Call types in same contact thread
- Track SMS delivery status via conversation history
- Use SMS for time-sensitive alerts`;
    
    const smsEntry = await client.query(
      'INSERT INTO bloom_kb (title, content, category) VALUES ($1, $2, $3) RETURNING id',
      ['GHL SMS Sending - Implementation Guide', smsContent, 'STARTER_BRAIN']
    );
    console.log('✓ SMS sending added (id:', smsEntry.rows[0].id + ')');
    
    // GHL Contact Lookup and Creation
    console.log('Adding GHL contact lookup and creation...');
    const contactContent = `# GHL Contact Lookup and Creation - Implementation Guide

## Overview
GHL contacts are the foundation of all conversations. Every message (email, SMS, call) must be tied to a contact.

## Create Contact
**Endpoint:** \`PUT https://services.leadconnectorhq.com/contacts/{locationId}\`

**Headers:**
\`\`\`json
{
  "Authorization": "Bearer YOUR_GHL_TOKEN",
  "Version": "2021-04-15",
  "Content-Type": "application/json"
}
\`\`\`

**Payload:**
\`\`\`json
{
  "firstName": "Charles",
  "lastName": "Flowers",
  "email": "charles@example.com",
  "phone": "+1234567890",
  "tags": ["dad", "family"]
}
\`\`\`

**Response (201):**
\`\`\`json
{
  "contact": {
    "id": "CONTACT_ID_STRING",
    "firstName": "Charles",
    "lastName": "Flowers",
    "email": "charles@example.com"
  }
}
\`\`\`

## Get Contact
**Endpoint:** \`GET https://services.leadconnectorhq.com/contacts/{contactId}\`

**Headers:** Same as above

**Returns:** Full contact object with all fields

## List Contacts
**Endpoint:** \`GET https://services.leadconnectorhq.com/contacts/?locationId={locationId}\`

**Query Params:**
- \`search\` - Search by name, email, or phone
- \`limit\` - Results per page (default 100)
- \`skip\` - Offset for pagination

**Response:**
\`\`\`json
{
  "contacts": [
    { "id": "...", "firstName": "...", "email": "..." },
    ...
  ]
}
\`\`\`

## Important Notes
- Contact ID is required for ALL message sending
- Same contact ID used across email, SMS, and calls in same thread
- Emails/phones can belong to one contact only
- Tags help organize contacts (optional but recommended)
- Location ID required for all operations: \`iGy4nrpDVU0W1jAvseL3\`

## Workflow
1. Check if contact exists (search by email)
2. If exists: use their ID
3. If not: create contact, get ID, store it
4. Use ID to send messages

## Example Code
\`\`\`javascript
// Create contact
const createReq = await fetch('https://services.leadconnectorhq.com/contacts/{locationId}', {
  method: 'PUT',
  headers: { Authorization: 'Bearer TOKEN', Version: '2021-04-15' },
  body: JSON.stringify({ firstName: 'John', email: 'john@example.com' })
});

const contact = await createReq.json();
const contactId = contact.contact.id;

// Now use contactId to send messages
\`\`\`

## Common Errors
| Error | Cause | Fix |
|-------|-------|-----|
| \`409 Conflict\` | Contact already exists | Look up existing ID |
| \`400 Bad Request\` | Missing required fields | Provide firstName, lastName, or email |
| \`404 Not Found\` | Wrong locationId | Use iGy4nrpDVU0W1jAvseL3 |`;
    
    const contactEntry = await client.query(
      'INSERT INTO bloom_kb (title, content, category) VALUES ($1, $2, $3) RETURNING id',
      ['GHL Contact Lookup and Creation - Implementation Guide', contactContent, 'STARTER_BRAIN']
    );
    console.log('✓ Contact operations added (id:', contactEntry.rows[0].id + ')');
    
    // GHL Conversation Monitoring
    console.log('Adding GHL conversation monitoring...');
    const conversationContent = `# GHL Conversation Monitoring - Verify Actions Without Human Input

## Core Principle
Every action taken via API (send email, SMS, call) must be verified programmatically. Never assume success based on HTTP status code alone.

## Verification Pattern
1. Perform action (send email, SMS, etc.)
2. Capture conversationId from response
3. Query conversation messages via API
4. Check that your message is present with correct content
5. Report status based on actual data, not assumptions

## Get Conversation Messages
**Endpoint:** \`GET https://services.leadconnectorhq.com/conversations/{conversationId}/messages\`

**Headers:**
\`\`\`json
{
  "Authorization": "Bearer YOUR_GHL_TOKEN",
  "Version": "2021-04-15",
  "Content-Type": "application/json"
}
\`\`\`

**Response:**
\`\`\`json
{
  "messages": {
    "lastMessageId": "ABC123",
    "messages": [
      {
        "id": "ABC123",
        "type": 3,
        "messageType": "TYPE_EMAIL",
        "body": "Your email body...",
        "meta": {
          "email": {
            "subject": "Subject line",
            "direction": "outbound"
          }
        },
        "dateAdded": "2026-02-21T20:24:25.264Z"
      },
      ...
    ]
  }
}
\`\`\`

## Verification Checklist

### For Email
- \`messageType\` === \`"TYPE_EMAIL"\`
- \`meta.email.subject\` matches sent subject
- \`body\` contains full message content
- \`meta.email.direction\` === \`"outbound"\`
- \`dateAdded\` is recent

### For SMS
- \`messageType\` === \`"TYPE_SMS"\`
- \`body\` contains full message text
- \`meta.sms.direction\` === \`"outbound"\`
- Message not truncated

### For Call
- \`messageType\` === \`"TYPE_CALL"\`
- \`meta.call.direction\` === \`"outbound"\`
- Duration recorded if completed

## Implementation Example
\`\`\`javascript
async function verifyEmailSent(conversationId, expectedSubject, expectedContent) {
  const response = await fetch(
    \`https://services.leadconnectorhq.com/conversations/\${conversationId}/messages\`,
    { headers: { Authorization: 'Bearer TOKEN', Version: '2021-04-15' } }
  );

  const data = await response.json();
  const latestMessage = data.messages.messages[0];

  // Check all criteria
  if (
    latestMessage.messageType === 'TYPE_EMAIL' &&
    latestMessage.meta.email.subject === expectedSubject &&
    latestMessage.body.includes(expectedContent)
  ) {
    console.log('✅ Email verified - content matches exactly');
    return true;
  } else {
    console.log('❌ Email verification failed');
    return false;
  }
}
\`\`\`

## Why This Matters
- HTTP 201 means request accepted, not delivered
- Email can be queued and fail later
- SMS can be rejected by carrier
- Verification proves content actually exists in GHL
- Protects against assuming false success

## Never Skip Verification
- Assume nothing
- Verify everything
- Report based on actual data, not hopes
- This is how you don't lie to humans`;
    
    const conversationEntry = await client.query(
      'INSERT INTO bloom_kb (title, content, category) VALUES ($1, $2, $3) RETURNING id',
      ['GHL Conversation Monitoring - Verify Actions Via API', conversationContent, 'STARTER_BRAIN']
    );
    console.log('✓ Conversation monitoring added (id:', conversationEntry.rows[0].id + ')');
    
    // Bloomie Startup Protocol
    console.log('Adding Bloomie startup protocol...');
    const startupContent = `# Bloomie Startup Protocol - First Steps Every Session

## On Every Session Start (Before Any Work)

### Step 1: Query Your KB
\`\`\`
SELECT id, title, category FROM [your_name]_kb ORDER BY id;
\`\`\`

**Why:** Understand what you know, what processes are documented, what lessons you've learned.

### Step 2: Query Your Tasks
\`\`\`
SELECT id, task, status FROM [your_name]_tasks ORDER BY id;
\`\`\`

**Why:** See what's assigned, what's pending, what's already done. Don't start work on closed tasks.

### Step 3: Check Credentials
\`\`\`
node /data/workspace/credential-health-monitor.js
\`\`\`

**Why:** Verify all systems are operational before committing to tasks.

### Step 4: Read BLOOM_KB (Shared Foundation)
\`\`\`
SELECT id, title FROM bloom_kb WHERE category = 'STARTER_BRAIN' ORDER BY id;
\`\`\`

**Why:** Review shared procedures, API patterns, and best practices. This is the collective knowledge of all Bloomies.

## What You Now Know

After startup protocol, you have context:
- Your personal knowledge (jaden_kb, jonathan_kb, etc.)
- Your active work (jaden_tasks, jonathan_tasks, etc.)
- Shared Bloomie practices (bloom_kb)
- System health (credentials check)

## What You Never Do
❌ Ask humans what you should know (query your KB first)
❌ Assume credentials work (check health)
❌ Start tasks without seeing status (query tasks)
❌ Reinvent procedures (check BLOOM_KB)
❌ Take action without verification (always verify via API)

## Standard Operating Procedure

1. **Session starts** → Run startup protocol
2. **Task assigned** → Insert into [name]_tasks immediately
3. **Process discovered** → Insert into [name]_kb same day
4. **Action taken** → Verify via API before reporting success
5. **Session ends** → All work already in Supabase (nothing is lost)

## Why This Matters

This protocol transforms Bloomies from stateless chatbots into autonomous agents:
- You have memory across sessions
- You know what work is open
- You share practices with other Bloomies
- You verify your work instead of hoping
- You never lose context on restart

## Implemented
2026-02-21 21:16 UTC as foundation for all Bloomies`;
    
    const startupEntry = await client.query(
      'INSERT INTO bloom_kb (title, content, category) VALUES ($1, $2, $3) RETURNING id',
      ['Bloomie Startup Protocol - Query KB and Tasks First', startupContent, 'STARTER_BRAIN']
    );
    console.log('✓ Startup protocol added (id:', startupEntry.rows[0].id + ')');
    
    console.log('\n✓ STARTER_BRAIN foundation complete - 5 entries in bloom_kb');
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createAndPopulate();
