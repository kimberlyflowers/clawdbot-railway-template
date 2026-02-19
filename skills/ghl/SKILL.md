---
name: ghl
description: GoHighLevel CRM integration - contacts, conversations, messages, calendars, funnels, documents, and email automation with full API support.
---

# GoHighLevel (GHL) Skill

**Complete GoHighLevel CRM integration for agents**

## Features

- 👥 **Contacts** - Manage customer database, create/update/delete contacts
- 💬 **Conversations** - Send and track conversations across channels
- 📧 **Messages** - Send SMS, email, WhatsApp messages
- 📅 **Calendars** - Book appointments, check availability
- 🔗 **Funnels** - Access sales funnels and landing pages
- 📄 **Documents** - Send templates and documents to contacts
- 🤖 **Workflows** - Automate business processes
- 🔐 **OAuth 2.0** - Secure token-based authentication

## Setup

### 1. Get API Token
```bash
# Create account at https://app.gohighlevel.com
# Navigate to Settings > API
# Create new API key
# Save to secrets:
echo "your_ghl_api_token" > /data/secrets/ghl-token.txt
```

### 2. Get Location ID
```bash
# In GHL app: Settings > API
# Your Location ID is displayed
# Usually looks like: iGy4nrpDVU0W1jAvseL3
```

## Modules

### Contacts
```javascript
await ghl.contacts.listContacts()
await ghl.contacts.getContact(contactId)
await ghl.contacts.createContact({ firstName, lastName, email, phone })
await ghl.contacts.updateContact(contactId, { firstName, email })
await ghl.contacts.deleteContact(contactId)
```

### Conversations
```javascript
await ghl.conversations.listConversations()
await ghl.conversations.getConversation(conversationId)
await ghl.conversations.createConversation({ contactId, type })
```

### Messages
```javascript
await ghl.messages.sendMessage({
  contactId,
  type: 'SMS' | 'EMAIL' | 'WHATSAPP',
  message: 'Your message here'
})
await ghl.messages.getMessages(conversationId)
await ghl.messages.getHistory(conversationId, limit)
```

### Calendars
```javascript
await ghl.calendars.listCalendars()
await ghl.calendars.getFreeSlots(calendarId, date)
await ghl.calendars.bookAppointment({
  calendarId,
  contactId,
  startTime,
  endTime,
  title
})
```

### Funnels
```javascript
await ghl.funnels.listFunnels()
await ghl.funnels.getFunnel(funnelId)
await ghl.funnels.listPages(funnelId)
await ghl.funnels.getPageDetails(funnelId, pageId)
```

### Documents
```javascript
await ghl.documents.sendDocument({
  contactId,
  documentId
})
await ghl.documents.listTemplates()
await ghl.documents.sendTemplate({
  contactId,
  templateId
})
```

### Email
```javascript
await ghl.email.send({
  contactId,
  subject,
  message
})
await ghl.email.listTemplates()
await ghl.email.create({ name, subject, body })
await ghl.email.update(emailId, { subject, body })
```

## Usage Examples

```javascript
const ghl = require('./index.js');

// Create a contact
const contact = await ghl.contacts.createContact({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '555-0123'
});

// Send SMS
await ghl.messages.sendMessage({
  contactId: contact.id,
  type: 'SMS',
  message: 'Hello! Your appointment is confirmed.'
});

// Book appointment
await ghl.calendars.bookAppointment({
  calendarId: 'cal_123',
  contactId: contact.id,
  startTime: '2026-02-20T10:00:00Z',
  endTime: '2026-02-20T11:00:00Z',
  title: 'Sales Consultation'
});

// Get conversation history
const messages = await ghl.messages.getHistory(conversationId, 50);
```

## API Documentation

- **Docs**: https://docs.gohighlevel.com/
- **API Base**: `https://rest.gohighlevel.com`
- **Auth**: Bearer token in Authorization header
- **Version**: 2021-07-28

## Constants

- **Location ID**: iGy4nrpDVU0W1jAvseL3 (your account location)
- **API Timeout**: 30 seconds
- **Max Results**: 100 per page

## Rate Limits

- 1000 requests per minute
- Implement exponential backoff for 429 responses

## Supported Message Types

- SMS
- EMAIL
- WHATSAPP
- FACEBOOK_MESSENGER
- INSTAGRAM_DM
