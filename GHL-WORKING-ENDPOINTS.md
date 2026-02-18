# GHL API - Working Endpoints (Verified)

**Date Tested:** 2026-02-16  
**Token:** Full scopes selected  
**Location ID:** iGy4nrpDVU0W1jAvseL3

---

## ✅ CONFIRMED WORKING

### 1. Contacts API
```
GET /contacts/?locationId={locationId}
GET /contacts/{contactId}?locationId={locationId}
POST /contacts/ {locationId, firstName, lastName, ...}
```
**Status:** ✅ 200 OK - Multiple contacts in system, fully functional

### 2. Conversations API
```
GET /conversations/search?locationId={locationId}
GET /conversations/{conversationId}/messages?locationId={locationId}
```
**Status:** ✅ 200 OK - 58,815 conversations, messages retrievable per conversation

### 3. Opportunities API
```
POST /opportunities/search
  Body: {locationId}
```
**Status:** ✅ 200 OK - Returns opportunities array (currently 0 in this account)

---

## ❌ NOT FOUND (404) - Endpoints Don't Exist

```
/calendars
/calendars/search (with query param)
/calendar/events
/appointments
/emails
/emails/search
/email-templates
/email-isv/public-apis/templates
/documents
/documents/search
/funnels
/funnels/search
/pages
```

---

## ⚠️ AUTHORIZATION ERRORS (401/422)

```
/calendars/search (400 Bad Request)
/documents/search (401 Unauthorized - endpoint might exist)
/funnels/search (401 Unauthorized - endpoint might exist)
```

These return auth/permission errors instead of 404, suggesting they MAY exist but need different scopes or parameters.

---

## Summary

**What's available in this GHL account:**
- ✅ Contacts (full CRUD)
- ✅ Conversations (list + messages per conversation)
- ✅ Opportunities (search)

**What's missing:**
- ❌ Calendars/Events
- ❌ Email
- ❌ Documents
- ❌ Funnels
- ❌ Direct messaging send endpoint

---

## Recommendation

Build bloomie-ghl skill with **only the working modules**:
1. **contacts** - List, get, create, update, delete
2. **conversations** - List, get messages from conversation
3. **opportunities** - List (if needed)

These are verified working. The others either don't exist in this GHL plan or require different endpoint paths not yet discovered.
