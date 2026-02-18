# bloomie-ghl Skill

GoHighLevel (GHL) API integration. 7 modules, all verified working.

**Base URL:** `https://services.leadconnectorhq.com`  
**Auth:** Bearer token from `/data/secrets/ghl-token.txt`  
**Version Header:** `2021-07-28`  
**Location ID:** `iGy4nrpDVU0W1jAvseL3`

---

## Quick Start

```javascript
const ghl = require('/data/workspace/ghl');

// List contacts
const { contacts } = await ghl.contacts.listContacts();

// Send SMS
await ghl.messages.sendMessage({
  contactId: 'abc123',
  type: 'SMS',
  message: 'Hello!'
});

// List calendars
const { calendars } = await ghl.calendars.listCalendars();
```

---

## 1. Contacts (`ghl.contacts`)

| Function | Endpoint | Description |
|----------|----------|-------------|
| `listContacts(options)` | `GET /contacts/` | List contacts. Options: `limit`, `query` |
| `getContact(id)` | `GET /contacts/{id}` | Get single contact |
| `createContact(data)` | `POST /contacts/` | Create contact. Fields: `firstName`, `lastName`, `email`, `phone`, `tags` |
| `updateContact(id, updates)` | `PUT /contacts/{id}` | Update contact fields |
| `deleteContact(id)` | `DELETE /contacts/{id}` | Delete contact |

---

## 2. Conversations (`ghl.conversations`)

| Function | Endpoint | Description |
|----------|----------|-------------|
| `listConversations(options)` | `GET /conversations/search` | List all conversations. Options: `contactId` |
| `getConversation(id)` | `GET /conversations/{id}` | Get conversation details |
| `createConversation(contactId)` | `POST /conversations/` | Create new conversation for contact |

---

## 3. Messages (`ghl.messages`)

| Function | Endpoint | Description |
|----------|----------|-------------|
| `sendMessage(opts)` | `POST /conversations/messages` | Send SMS/Email. Opts: `contactId`, `type` (SMS/Email), `message`, `subject` |
| `getMessages(convId, options)` | `GET /conversations/{id}/messages` | Get messages from conversation |
| `getConversationHistory(convId)` | Multiple | Get conversation details + all messages |

**Message types:** `SMS`, `Email`, `WhatsApp`, `GMB`, `Custom`

---

## 4. Calendars (`ghl.calendars`)

| Function | Endpoint | Description |
|----------|----------|-------------|
| `listCalendars()` | `GET /calendars/` | List all calendars (8 found) |
| `getFreeSlots(calId, start, end, opts)` | `GET /calendars/{id}/free-slots` | Get available slots. Dates as YYYY-MM-DD or epoch ms |
| `bookAppointment(calId, data)` | `POST /calendars/events/appointments` | Book appointment for contact |

---

## 5. Funnels (`ghl.funnels`)

| Function | Endpoint | Description |
|----------|----------|-------------|
| `listFunnels()` | `GET /funnels/funnel/list` | List all funnels (42 found) |
| `getFunnel(id)` | `GET /funnels/funnel/list` | Get single funnel by ID |
| `listPages(funnelId, opts)` | `GET /funnels/page` | List pages in funnel. Opts: `limit`, `offset` |
| `getPageDetails(funnelId, pageId)` | `GET /funnels/page` | Get single page details |

---

## 6. Documents (`ghl.documents`)

| Function | Endpoint | Description |
|----------|----------|-------------|
| `sendDocument(opts)` | `POST /conversations/messages` | Send doc via SMS/Email with attachments |
| `listTemplates()` | `GET /emails/builder` | List available templates (17 found) |
| `sendTemplate(opts)` | `POST /conversations/messages` | Send template to contact via email |

---

## 7. Email (`ghl.email`)

| Function | Endpoint | Description |
|----------|----------|-------------|
| `sendEmail(opts)` | `POST /conversations/messages` | Send email. Opts: `contactId`, `subject`, `message`, `html` |
| `listEmailTemplates()` | `GET /emails/builder` | List email templates |
| `createTemplate(data)` | `POST /emails/builder` | Create new email template |
| `updateTemplate(id, updates)` | `PUT /emails/builder/{id}` | Update existing template |
| `listEmailSchedules()` | `GET /conversations/search` | List email conversations |

---

## Error Handling

All functions return `{ success: true/false, ... }`. On failure:

```javascript
{
  success: false,
  error: "Human readable error",
  status: 422,
  details: { /* API error response */ }
}
```

---

## Critical Notes

- **Accept header required:** All requests include `Accept: application/json` — without it, some endpoints return empty responses
- **Token stored at:** `/data/secrets/ghl-token.txt` — never commit this
- **Location ID hardcoded in config.js** — change if switching GHL accounts
- **Dates for calendar slots:** Pass as `YYYY-MM-DD` strings or epoch milliseconds
- **Funnel pages require both `limit` and `offset`** parameters

---

## Testing

```bash
cd /data/workspace/ghl && node test.js
```

Expected: `🎉 All modules working!` (11/11 tests pass)

---

**Last verified:** 2026-02-16  
**Version:** 1.0.0
