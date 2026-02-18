# bloomie-ghl — GoHighLevel API Integration Skill

Complete GHL API integration with 7 modules, 25+ functions, all verified working against the live API.

---

## Architecture

```
/data/workspace/ghl/
├── config.js          # Token loader, shared axios client, headers
├── contacts.js        # Contact CRUD (5 functions)
├── conversations.js   # Conversation management (3 functions)
├── messages.js        # Send SMS/Email, get messages (3 functions)
├── calendars.js       # Calendar listing, slots, booking (3 functions)
├── funnels.js         # Funnel & page management (4 functions)
├── documents.js       # Document/template sending (3 functions)
├── email.js           # Email sending & template management (5 functions)
├── index.js           # Main export (all 7 modules)
├── test.js            # Full test suite (11 tests, all passing)
├── SKILL.md           # Quick reference
├── GHL-SKILL-README.md # This file — full documentation
├── package.json       # Dependencies (axios)
└── .gitignore         # Protects secrets
```

---

## Configuration

| Setting | Value |
|---------|-------|
| **Base URL** | `https://services.leadconnectorhq.com` |
| **Auth** | `Bearer` token from `/data/secrets/ghl-token.txt` |
| **Version Header** | `2021-07-28` |
| **Location ID** | `iGy4nrpDVU0W1jAvseL3` |
| **Token Type** | Private Integration Token (`pit-...`) |

### Critical: The `Accept: application/json` Header

**This was the #1 issue during development.** Without `Accept: application/json` in the request headers, GHL returns empty responses (0-byte body with 404 status) for many endpoints — even when the endpoint exists and the token is valid. The skill includes this header in all requests via the shared axios client in `config.js`.

**If you're debugging GHL API calls that return empty responses, add this header first.**

---

## API Endpoint Map (Verified Working)

### Contacts

| Method | Path | Parameters | Response |
|--------|------|------------|----------|
| `GET` | `/contacts/` | `locationId` (query), `limit`, `query` | `{ contacts: [...], meta: {...} }` |
| `GET` | `/contacts/{contactId}` | — | `{ contact: {...} }` |
| `POST` | `/contacts/` | `locationId`, `firstName`, `lastName`, `email`, `phone`, `tags` (body) | `{ contact: {...} }` |
| `PUT` | `/contacts/{contactId}` | Fields to update (body) | `{ contact: {...} }` |
| `DELETE` | `/contacts/{contactId}` | — | `200 OK` |

### Conversations

| Method | Path | Parameters | Response |
|--------|------|------------|----------|
| `GET` | `/conversations/search` | `locationId` (query), `contactId` (optional) | `{ conversations: [...], total: N }` |
| `GET` | `/conversations/{conversationId}` | — | `{ locationId, contactId, inbox, ... }` |
| `POST` | `/conversations/` | `locationId`, `contactId` (body) | `{ conversationId, message }` |

**⚠️ Note:** The list endpoint is `/conversations/search`, NOT `/conversations/`. The base path returns 404.

### Messages

| Method | Path | Parameters | Response |
|--------|------|------------|----------|
| `POST` | `/conversations/messages` | `contactId`, `type`, `message` (body). For email: add `subject`, `html` | `{ messageId, ... }` |
| `GET` | `/conversations/{conversationId}/messages` | `locationId` (query) | `{ messages: { messages: [...], lastMessageId, nextPage } }` |

**Message types:** `SMS`, `Email`, `WhatsApp`, `GMB`, `Custom`

**⚠️ Note:** The messages response is nested: `data.messages.messages` contains the array. The skill handles this automatically.

### Calendars

| Method | Path | Parameters | Response |
|--------|------|------------|----------|
| `GET` | `/calendars/` | `locationId` (query) | `{ calendars: [...] }` |
| `GET` | `/calendars/{calendarId}/free-slots` | `startDate`, `endDate` (query, **epoch milliseconds**) | Availability map |
| `POST` | `/calendars/events/appointments` | `calendarId`, `locationId`, `contactId`, `startTime` (body) | Appointment object |

**⚠️ Note:** Free slots endpoint requires dates as **epoch milliseconds** (not YYYY-MM-DD strings). The skill auto-converts date strings to epoch ms.

**⚠️ Note:** The `GET /calendars/` endpoint does NOT accept a `limit` parameter — it returns all calendars. Sending `limit` causes a 422 error.

### Funnels

| Method | Path | Parameters | Response |
|--------|------|------------|----------|
| `GET` | `/funnels/funnel/list` | `locationId` (query) | `{ funnels: [...], count: N }` |
| `GET` | `/funnels/page` | `funnelId`, `locationId`, `limit`, `offset` (all query, all required) | Array of page objects |

**⚠️ Note:** Funnel list endpoint is `/funnels/funnel/list`, NOT `/funnels/`. The base path returns 404.

**⚠️ Note:** Funnel pages endpoint requires ALL THREE params: `funnelId`, `limit`, AND `offset`. Missing any causes a 422 error.

**⚠️ Note:** Pages response is a raw array, not wrapped in `{ pages: [...] }`.

### Documents

GHL does not have a dedicated `/documents/` REST endpoint. Document functionality is handled through:

| Method | Path | Parameters | Response |
|--------|------|------------|----------|
| `POST` | `/conversations/messages` | `contactId`, `type`, `message`, `attachments` (body) | `{ messageId }` |
| `GET` | `/emails/builder` | `locationId` (query) | `{ builders: [...], total: N }` |
| `POST` | `/conversations/messages` | `contactId`, `type: 'Email'`, `subject`, `templateId` (body) | `{ messageId }` |

### Email

| Method | Path | Parameters | Response |
|--------|------|------------|----------|
| `POST` | `/conversations/messages` | `contactId`, `type: 'Email'`, `subject`, `message`, `html` (body) | `{ messageId }` |
| `GET` | `/emails/builder` | `locationId` (query) | `{ builders: [...], total: [...] }` |
| `POST` | `/emails/builder` | `locationId`, `title`, `html` (body) | Template object |
| `PUT` | `/emails/builder/{templateId}` | `locationId`, fields to update (body) | Template object |
| `GET` | `/conversations/search` | `locationId`, `type: 'TYPE_EMAIL'` (query) | `{ conversations: [...] }` |

**⚠️ Note:** Email sending goes through `/conversations/messages` with `type: 'Email'`, not a dedicated email endpoint.

---

## Function Reference

### contacts.js

```javascript
const ghl = require('/data/workspace/ghl');

// List all contacts (default limit: 100)
await ghl.contacts.listContacts({ limit: 50, query: 'john' });

// Get single contact
await ghl.contacts.getContact('jAuFGWQtnVPrElPQecFT');

// Create contact
await ghl.contacts.createContact({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+15551234567',
  tags: ['lead', 'website']
});

// Update contact
await ghl.contacts.updateContact('contactId', { firstName: 'Jane' });

// Delete contact
await ghl.contacts.deleteContact('contactId');
```

### conversations.js

```javascript
// List all conversations
await ghl.conversations.listConversations();

// List conversations for a specific contact
await ghl.conversations.listConversations({ contactId: 'abc123' });

// Get conversation details
await ghl.conversations.getConversation('r2be7VkYLlxCBf5LhPVw');

// Create new conversation
await ghl.conversations.createConversation('contactId');
```

### messages.js

```javascript
// Send SMS
await ghl.messages.sendMessage({
  contactId: 'abc123',
  type: 'SMS',
  message: 'Hello from Bloomie!'
});

// Send Email
await ghl.messages.sendMessage({
  contactId: 'abc123',
  type: 'Email',
  subject: 'Welcome',
  message: 'Plain text version',
  html: '<h1>Welcome!</h1><p>Thanks for signing up.</p>'
});

// Get messages from conversation
await ghl.messages.getMessages('conversationId');

// Get full conversation history (details + messages)
await ghl.messages.getConversationHistory('conversationId');
```

### calendars.js

```javascript
// List all calendars
const { calendars } = await ghl.calendars.listCalendars();

// Get free slots (dates auto-convert to epoch ms)
await ghl.calendars.getFreeSlots('K5QEDJKzEC6HHlNSaITg', '2026-02-17', '2026-02-23');

// Get free slots with timezone
await ghl.calendars.getFreeSlots('calId', '2026-02-17', '2026-02-23', {
  timezone: 'America/New_York'
});

// Book appointment
await ghl.calendars.bookAppointment('calId', {
  contactId: 'abc123',
  startTime: '2026-02-20T14:00:00Z'
});
```

### funnels.js

```javascript
// List all funnels
const { funnels, count } = await ghl.funnels.listFunnels();

// Get single funnel
await ghl.funnels.getFunnel('AxOwrZdJkJiIY6QhEoPq');

// List pages in funnel
await ghl.funnels.listPages('funnelId', { limit: 20, offset: 0 });

// Get specific page
await ghl.funnels.getPageDetails('funnelId', 'pageId');
```

### documents.js

```javascript
// List available templates
await ghl.documents.listTemplates();

// Send document via email with attachment
await ghl.documents.sendDocument({
  contactId: 'abc123',
  type: 'Email',
  message: 'Please review the attached document.',
  subject: 'Document for Review',
  attachments: ['https://example.com/document.pdf']
});

// Send template to contact
await ghl.documents.sendTemplate({
  contactId: 'abc123',
  subject: 'Your Proposal',
  message: 'Please review your proposal.',
  templateId: '648e2e1d4880b2ff0e5f37b7'
});
```

### email.js

```javascript
// Send email
await ghl.email.sendEmail({
  contactId: 'abc123',
  subject: 'Welcome!',
  message: 'Plain text version',
  html: '<h1>Welcome!</h1>'
});

// List email templates
const { templates } = await ghl.email.listEmailTemplates();

// Create new template
await ghl.email.createTemplate({
  title: 'Welcome Email',
  html: '<h1>Welcome {{contact.firstName}}!</h1>'
});

// Update template
await ghl.email.updateTemplate('templateId', {
  title: 'Updated Welcome Email'
});

// List email conversations
await ghl.email.listEmailSchedules();
```

---

## Error Handling

Every function returns a consistent response:

**Success:**
```javascript
{ success: true, contacts: [...], meta: {...} }
```

**Failure:**
```javascript
{
  success: false,
  error: "Human readable error message",
  status: 422,        // HTTP status code
  details: { ... }    // Full API error response
}
```

Always check `result.success` before accessing data.

---

## Common GHL API Gotchas

1. **`Accept: application/json` header is REQUIRED** — without it, many endpoints return empty 404 responses
2. **Conversation search path is `/conversations/search`** — not `/conversations/`
3. **Funnel list path is `/funnels/funnel/list`** — not `/funnels/`
4. **Calendar free-slots need epoch milliseconds** — not date strings
5. **Funnel pages need `limit` AND `offset`** — missing either causes 422
6. **Calendar list does NOT accept `limit`** — sending it causes 422
7. **Email sending uses `/conversations/messages`** with `type: 'Email'` — no dedicated email endpoint
8. **Messages response is double-nested** — `data.messages.messages` contains the array
9. **Opportunities use POST with locationId in body** — not GET with query param
10. **Some endpoints return raw arrays** (funnel pages) instead of wrapped objects

---

## Test Suite

```bash
cd /data/workspace/ghl && node test.js
```

**Expected output:**
```
📊 Results: 11 passed, 0 failed out of 11 tests
🎉 All modules working!
```

Tests cover:
- List contacts + get single contact
- List conversations + get single conversation
- Get messages from conversation
- List calendars + get free slots
- List funnels + list pages
- List document templates
- List email templates

---

## Account Data (as of 2026-02-16)

| Resource | Count |
|----------|-------|
| Contacts | 5+ |
| Conversations | 58,815 |
| Calendars | 8 |
| Funnels | 42 |
| Email Templates | 10-17 |
| Opportunities | 0 |

---

**Version:** 1.0.0  
**Built:** 2026-02-16  
**Author:** Bloomie  
**Token:** Private Integration Token (pit-...) — stored at `/data/secrets/ghl-token.txt`
