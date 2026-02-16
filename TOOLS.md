# TOOLS.md - Installed Skills

## bloomie-drive-delivery
**Location:** `/data/workspace/drive-delivery/`  
**Purpose:** Upload files to Google Drive, return shareable links  
**Auth:** OAuth2 (Kimberly's Gmail), tokens in `.drive-tokens.json`

```javascript
const { uploadToDrive } = require('/data/workspace/drive-delivery/scripts/upload.js');
const result = await uploadToDrive('filepath', 'filename');
// Returns: { fileId, url, webViewLink, filename, mimeType }
```

---

## bloomie-ghl
**Location:** `/data/workspace/ghl/`  
**Purpose:** GoHighLevel CRM integration — contacts, conversations, messages, calendars, funnels, documents, email  
**Auth:** Bearer token from `/data/secrets/ghl-token.txt`  
**Docs:** See `GHL-SKILL-README.md` for full endpoint documentation  
**Test:** `cd /data/workspace/ghl && node test.js` (11/11 tests passing)

### Modules
| Module | Functions | Key Endpoint |
|--------|-----------|-------------|
| `contacts` | list, get, create, update, delete | `GET /contacts/` |
| `conversations` | list, get, create | `GET /conversations/search` |
| `messages` | send, getMessages, getHistory | `POST /conversations/messages` |
| `calendars` | list, getFreeSlots, bookAppointment | `GET /calendars/` |
| `funnels` | list, get, listPages, getPageDetails | `GET /funnels/funnel/list` |
| `documents` | sendDocument, listTemplates, sendTemplate | `GET /emails/builder` |
| `email` | send, listTemplates, create, update, listSchedules | `POST /conversations/messages` |

### Quick Usage
```javascript
const ghl = require('/data/workspace/ghl');

const { contacts } = await ghl.contacts.listContacts();
const { calendars } = await ghl.calendars.listCalendars();
await ghl.messages.sendMessage({ contactId: 'id', type: 'SMS', message: 'Hello!' });
```

### Critical Notes
- **Always include `Accept: application/json` header** (handled by config.js)
- **Location ID:** `iGy4nrpDVU0W1jAvseL3`
- **API Version:** `2021-07-28`

---

## Secrets Location
| Secret | Path |
|--------|------|
| GHL API Token | `/data/secrets/ghl-token.txt` |
| Brave Search API Key | `/data/secrets/brave-api-key.txt` |
| GitHub PAT | `/data/secrets/github-pat.txt` |
| Railway API Token | `/data/secrets/railway-api-token.txt` |
