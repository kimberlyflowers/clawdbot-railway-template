# GHL Email Sending - Complete Implementation Guide

**Author:** Jaden (Bloomie AI Assistant)  
**Last Updated:** 2026-02-21 20:24 UTC  
**Status:** ✅ Verified Working  

---

## Executive Summary

This guide documents the complete process for sending emails through GoHighLevel (GHL) API. It includes the correct endpoint, required headers, exact payload structure, and verification methods.

**Key Learning:** Never guess at API endpoints or payload structures. Always verify against official documentation before implementation.

---

## The Correct Endpoint

**URL:** `https://services.leadconnectorhq.com/conversations/messages`

**Method:** `POST`

**Important:** This is NOT an "inbound" or "outbound" endpoint. It's the standard conversations/messages endpoint that handles all message types.

---

## Required Headers

```json
{
  "Authorization": "Bearer YOUR_GHL_TOKEN",
  "Content-Type": "application/json",
  "Version": "2021-04-15"
}
```

**Critical Details:**
- Version must be `2021-04-15` (NOT `2021-07-28`)
- Authorization token from `/data/secrets/ghl-token.txt`
- Content-Type must be JSON

---

## Request Payload

```json
{
  "type": "Email",
  "contactId": "CONTACT_ID_HERE",
  "subject": "Your subject line",
  "html": "Your email body (plain text or HTML supported)"
}
```

### Field Definitions

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `type` | String | Yes | Must be exactly `"Email"` (capital E) |
| `contactId` | String | Yes | GHL contact ID (see How to Get Contact IDs) |
| `subject` | String | Yes | Email subject line |
| `html` | String | Yes | Email body content |

---

## How to Get a Contact ID

### Option 1: Get from Existing Contact
GHL stores contacts. If your contact exists:
- Log into GHL
- Find the contact in Contacts
- Contact ID appears in the URL or contact details
- Store it for future use

### Option 2: Create Contact via API
```bash
PUT https://services.leadconnectorhq.com/contacts/{locationId}
```

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_TOKEN",
  "Version": "2021-04-15",
  "Content-Type": "application/json"
}
```

**Payload:**
```json
{
  "firstName": "Charles",
  "lastName": "Flowers",
  "email": "charles@example.com"
}
```

**Response on success (201):**
```json
{
  "contact": {
    "id": "CONTACT_ID_STRING"
  }
}
```

---

## Working Implementation

### Node.js Example

```javascript
const https = require('https');
const fs = require('fs');

const ghlToken = fs.readFileSync('/data/secrets/ghl-token.txt', 'utf8').trim();
const contactId = '2TeWXn6h6FocCFEeuek0';

const messageBody = `Hi Dad,

Your email body here with full content.

God bless,
Your Name`;

const payload = JSON.stringify({
  type: 'Email',
  contactId: contactId,
  subject: 'Your Subject',
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
      const response = JSON.parse(body);
      console.log('Email sent successfully');
      console.log('Message ID:', response.messageId);
    } else {
      console.log('Error:', res.statusCode, body);
    }
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(payload);
req.end();
```

---

## How to Verify Email Was Sent

**Step 1: Get the Conversation ID**  
The send endpoint response includes `conversationId`. Save this.

**Step 2: Fetch Conversation Messages**
```bash
GET https://services.leadconnectorhq.com/conversations/{conversationId}/messages
```

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_TOKEN",
  "Version": "2021-04-15",
  "Content-Type": "application/json"
}
```

**Step 3: Check Latest Message**
The API returns all messages in the conversation. The first message in the array is the most recent. Verify:
- `messageType` = `"TYPE_EMAIL"`
- `meta.email.subject` matches your subject
- `body` contains your full message content

### Verification Script

```javascript
const https = require('https');
const fs = require('fs');

const ghlToken = fs.readFileSync('/data/secrets/ghl-token.txt', 'utf8').trim();
const conversationId = 'YOUR_CONVO_ID';

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
    const data = JSON.parse(body);
    const latestEmail = data.messages.messages[0];
    
    console.log('Subject:', latestEmail.meta.email.subject);
    console.log('Body preview:', latestEmail.body.substring(0, 200));
    
    if (latestEmail.body.includes('YOUR_KEY_PHRASE')) {
      console.log('✅ Email verified - content is correct');
    }
  });
});

req.end();
```

---

## Common Errors & Fixes

| Error | Cause | Solution |
|-------|-------|----------|
| `type must be a valid enum value` | Wrong type spelling | Use exactly `"Email"` (capital E) |
| `Missing required field: html` | Missing email body | Include `html` with message content |
| `401 Unauthorized` | Invalid token | Check GHL token in `/data/secrets/ghl-token.txt` |
| `404 Not found` | Wrong endpoint host | Use `services.leadconnectorhq.com` |
| Wrong Version header | Using 2021-07-28 | Use `2021-04-15` instead |
| No response after 30 seconds | Timeout | Increase timeout or check network |

---

## Formatting Tips

### Plain Text vs HTML
- **Plain text:** Just use plain strings (no special formatting needed)
- **HTML:** Include HTML tags like `<p>`, `<strong>`, `<ul>`, etc.
- **Plain text with emphasis:** Use asterisks `*text*` or underscores `_text_` (GHL preserves these)

### Why HTML Gets Stripped
GHL converts HTML to plain text for storage and display in conversations. `<strong>` tags work during send but don't appear in the conversation view. Use asterisks or other plain-text formatting instead.

---

## Important Discoveries

### The Blocker Resolution Process

**This guide exists because of 3 blockers that were resolved:**

1. **Blocked:** SMTP connections (ports 465/587) are firewalled
   - **Resolution:** Use GHL API instead of direct SMTP
   
2. **Blocked:** Wrong endpoint - tried `/conversations/messages/inbound`
   - **Resolution:** Correct endpoint is `/conversations/messages` (standard)
   
3. **Blocked:** Type enum validation failed multiple times
   - **Resolution:** Exact value is `"Email"` (capital E, from official GHL Conversation Providers doc)

### What NOT To Do

❌ Guess at enum values  
❌ Use wrong Version header  
❌ Assume HTML formatting will display in conversations  
❌ Skip verification - just assume it worked  
❌ Ask for help before reading official docs  

---

## File References

- **Working send script:** `/data/workspace/email-monitor/send-email-asterisk-format.js`
- **Verification script:** `/data/workspace/email-monitor/final-verify.js`
- **GHL token:** `/data/secrets/ghl-token.txt`

---

## Next Developer Notes

**If you need to:**
- **Send an SMS:** Change `type` to `"SMS"` (but verify endpoint handles it)
- **Send a call:** Change `type` to `"CALL"`
- **Send from a different account:** Use the corresponding email address's GHL contact ID
- **Add attachments:** Check GHL API for attachment endpoints (separate from message send)

---

## References

- GHL Official Docs: https://marketplace.gohighlevel.com/docs/ghl/conversations/
- Conversation Providers: https://marketplace.gohighlevel.com/docs/marketplace-modules/ConversationProviders/
- API Host: services.leadconnectorhq.com (NOT api.gohighlevel.com)

---

**Last Verified:** 2026-02-21 20:24 UTC  
**Verified By:** Jaden (Bloomie AI)  
**Test Contact:** Charles E. Flowers (2TeWXn6h6FocCFEeuek0)  
**Status:** ✅ Working
