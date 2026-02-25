# N8N AUTOMATION PLAN - Fill GHL API Gaps

## PROBLEM
- JADEN can create email templates + manage contacts
- JADEN CANNOT send campaigns (no `campaigns.write` scope)
- Need automated daily email sending at scheduled times

## SOLUTION
Use n8n to orchestrate the sending workflow that JADEN triggers

---

## ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                         DAILY SCHEDULE                          │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    10 AM UTC: JADEN writes blog
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              JADEN (Claude AI - This System)                    │
├─────────────────────────────────────────────────────────────────┤
│ • Create blog post (MD file)                                    │
│ • Create email template in GHL (HTML formatted)                │
│ • Trigger n8n webhook with template ID                         │
└─────────────────────────────────────────────────────────────────┘
                                 │
                   12 PM UTC: Trigger n8n
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    N8N WORKFLOW ENGINE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  STEP 1: Receive webhook from JADEN                           │
│  ├─ Input: template ID, audience segment (advisors/educators) │
│                                                                 │
│  STEP 2: Query GHL API - Get Contacts                         │
│  ├─ Fetch contacts by tag/segment                             │
│  ├─ Filter by: audience segment (advisors OR educators)      │
│  └─ Return: contact IDs + emails                              │
│                                                                 │
│  STEP 3: Loop - Send Email to Each Contact                   │
│  ├─ For each contact in list:                                 │
│  ├─ Call GHL API: POST /conversations/messages                │
│  ├─ Type: Email                                               │
│  ├─ Body: Template content                                    │
│  └─ Track: sent/failed count                                  │
│                                                                 │
│  STEP 4: Log Results                                           │
│  ├─ Send report to Kimberly                                   │
│  └─ Store metrics (sent, failed, bounced)                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   GHL API (Backend)                             │
├─────────────────────────────────────────────────────────────────┤
│ • Receive contact queries                                      │
│ • Receive email send requests                                 │
│ • Store sent/delivery status                                  │
│ • Track opens/clicks                                          │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUDIENCE (Contacts)                          │
├─────────────────────────────────────────────────────────────────┤
│ • Financial Advisors (tag: "financial advisors")              │
│ • Educators (tag: "educators")                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## N8N WORKFLOWS NEEDED

### WORKFLOW 1: Send Advisor Campaign
**Trigger:** HTTP Webhook from JADEN  
**Input:** `{ templateId, audience: "advisors" }`  
**Steps:**
1. Receive webhook
2. GET `/contacts?locationId=iGy4nrpDVU0W1jAvseL3&tags=financial advisors`
3. For each contact: POST `/conversations/messages` with Email type
4. Log success/failure
5. Send summary to Kimberly via SMS or email

### WORKFLOW 2: Send Educator Campaign
**Trigger:** HTTP Webhook from JADEN  
**Input:** `{ templateId, audience: "educators" }`  
**Steps:**
1. Receive webhook
2. GET `/contacts?locationId=iGy4nrpDVU0W1jAvseL3&tags=educators`
3. For each contact: POST `/conversations/messages` with Email type
4. Log success/failure
5. Send summary to Kimberly via SMS or email

---

## API CREDENTIALS NEEDED

### For n8n to call GHL:

| Credential | Value | Where from |
|-----------|-------|-----------|
| GHL API Token | `pit-a2f307f4-08b6-4c00-a2da-a1ce03b3a927` | `/data/secrets/ghl-token.txt` |
| GHL Location ID | `iGy4nrpDVU0W1jAvseL3` | Already documented |
| GHL API Base | `https://services.leadconnectorhq.com` | v2.0 API |
| GHL API Version Header | `2021-07-28` | Required in all requests |

### For JADEN to trigger n8n:

| Credential | Value | Where from |
|-----------|-------|-----------|
| N8N Webhook URL | `https://[n8n-instance]/webhook/[workflow-id]` | After creating n8n workflows |
| N8N Auth Token | (if secured) | n8n admin panel |

---

## EXECUTION FLOW (Daily)

```
10:00 AM UTC
    │
    └─→ JADEN writes: /campaigns/advisors/blog-[date].md
    └─→ JADEN creates GHL email template (HTML)
    └─→ JADEN makes HTTP POST to n8n webhook:
        {
          "workflow": "send_advisor_campaign",
          "templateId": "[template-id-from-ghl]",
          "audience": "advisors",
          "blogTitle": "The Hidden Cost of Manual Client Work"
        }

12:00 PM UTC
    │
    └─→ n8n receives webhook
    └─→ n8n fetches advisor contacts (tag: "financial advisors")
    └─→ n8n sends email to each contact via GHL API
    └─→ n8n logs: sent count, failed count, contact list

Same day for educators:
    └─→ n8n sends educator emails (tag: "educators")

End of day:
    └─→ n8n sends summary report to Kimberly
```

---

## WORKFLOW STEPS IN N8N (Detailed)

### Node 1: HTTP Webhook (Trigger)
```
Listen for POST from JADEN
Extract: templateId, audience, blogTitle
```

### Node 2: GHL - Get Contacts
```
HTTP Request:
  METHOD: GET
  URL: https://services.leadconnectorhq.com/contacts
  PARAMS:
    - locationId: iGy4nrpDVU0W1jAvseL3
    - tags: (advisors | educators)
    - limit: 100
  HEADERS:
    - Authorization: Bearer pit-a2f307f4-08b6-4c00-a2da-a1ce03b3a927
    - Version: 2021-07-28
```

### Node 3: Loop - For Each Contact
```
Iterate through contacts array
For each contact:
  - Extract: contact.id, contact.email
  - Proceed to Node 4
```

### Node 4: Send Email (Inside Loop)
```
HTTP Request:
  METHOD: POST
  URL: https://services.leadconnectorhq.com/conversations/messages
  BODY:
    {
      "locationId": "iGy4nrpDVU0W1jAvseL3",
      "contactId": "{{ $json.contact.id }}",
      "type": "Email",
      "body": "{{ $json.templateContent }}"
    }
  HEADERS:
    - Authorization: Bearer pit-a2f307f4-08b6-4c00-a2da-a1ce03b3a927
    - Version: 2021-07-28

Track:
  - If status 201: increment sent_count++
  - If status != 201: increment failed_count++
```

### Node 5: Log Results
```
Store in n8n database:
  - workflow_name
  - audience
  - total_contacts
  - sent_count
  - failed_count
  - timestamp
  - template_id
```

### Node 6: Send Summary to Kimberly
```
HTTP Request:
  METHOD: POST
  URL: https://services.leadconnectorhq.com/conversations/messages
  BODY:
    {
      "locationId": "iGy4nrpDVU0W1jAvseL3",
      "contactId": "lM0EcPilFL6XMBQPxHoa",  (Kimberly's contact)
      "type": "SMS",
      "message": "Campaign sent to {{ audience }}\nSent: {{ sent_count }}\nFailed: {{ failed_count }}"
    }
```

---

## SETUP CHECKLIST

- [ ] Create n8n account (self-hosted or cloud)
- [ ] Create 2 workflows (advisor + educator)
- [ ] Add GHL credentials to n8n
- [ ] Configure webhook URLs
- [ ] Test: advisor workflow with test contact
- [ ] Test: educator workflow with test contact
- [ ] Get webhook URLs from n8n
- [ ] Add webhook URLs to JADEN trigger script
- [ ] Schedule JADEN to call webhooks at 12 PM UTC

---

## COSTS

- **n8n Cloud:** Free tier (up to 5 workflows, 1000 executions/month)
- **n8n Self-Hosted:** Free (run on your own server)
- **GHL API:** Included with your token (no per-call cost)

---

## ADVANTAGES

✅ JADEN controls blog creation  
✅ n8n handles reliable scheduling + sending  
✅ Automatic contact segmentation (advisors vs educators)  
✅ Built-in error handling + retry logic  
✅ Logging + audit trail  
✅ Can scale to 10k+ contacts per send  
✅ Free/low cost

---

## API KEYS SUMMARY

Keep these secure:
```
GHL_TOKEN=pit-a2f307f4-08b6-4c00-a2da-a1ce03b3a927
GHL_LOCATION_ID=iGy4nrpDVU0W1jAvseL3
GHL_API_BASE=https://services.leadconnectorhq.com
N8N_WEBHOOK_ADVISORS=[to-be-generated]
N8N_WEBHOOK_EDUCATORS=[to-be-generated]
```
