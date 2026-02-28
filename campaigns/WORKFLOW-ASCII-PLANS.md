# PLAN A & B - WORKFLOW ASCII DIAGRAMS

---

# PLAN A: FINANCIAL ADVISORS CAMPAIGN WORKFLOW

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    PLAN A: FINANCIAL ADVISORS                              ║
║                         14-DAY CAMPAIGN                                    ║
╚════════════════════════════════════════════════════════════════════════════╝


                          DAILY EXECUTION (Mon-Sun)
                          
 ┌─ 10:00 AM UTC ────────────────────────────────────────────────────────┐
 │                                                                        │
 │  CRON: advisor-generate-blog.js                                       │
 │  ├─ Read: /campaigns/advisors/blog-content-templates.json             │
 │  ├─ Generate: Day 1-7 blogs (Week 1) OR Day 8-14 blogs (Week 2)      │
 │  ├─ Write: /campaigns/advisors/blog-[YYYY-MM-DD].md                 │
 │  └─ Log: Generated ✓                                                 │
 │                                                                        │
 │  JADEN HEARTBEAT CHECK:                                               │
 │  ├─ Blog written? ✓                                                   │
 │  ├─ File exists? ✓                                                    │
 │  └─ Content quality check? ✓                                          │
 │                                                                        │
 └────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
 ┌─ 12:00 PM UTC ────────────────────────────────────────────────────────┐
 │                                                                        │
 │  CRON: advisor-send-trigger.js                                        │
 │  │                                                                     │
 │  ├─ STEP 1: Read blog file                                            │
 │  │  └─ /campaigns/advisors/blog-[TODAY].md                           │
 │  │                                                                     │
 │  ├─ STEP 2: Query GHL Contacts                                        │
 │  │  API CALL: GET /contacts                                          │
 │  │  ├─ locationId: iGy4nrpDVU0W1jAvseL3                              │
 │  │  ├─ tags: "financial advisors"                                    │
 │  │  └─ Return: [contact1, contact2, contact3, ...]                  │
 │  │                                                                     │
 │  ├─ STEP 3: Create GHL Email Template                                │
 │  │  API CALL: POST /emails/builder                                   │
 │  │  ├─ name: "Advisor Blog [YYYY-MM-DD]"                            │
 │  │  ├─ subject: "📊 The Hidden Cost of Manual Client Work"          │
 │  │  ├─ body: [HTML from blog]                                        │
 │  │  └─ Return: template_id                                           │
 │  │                                                                     │
 │  ├─ STEP 4: Prepare n8n Webhook Payload                              │
 │  │  {                                                                 │
 │  │    "campaign": "advisors",                                        │
 │  │    "date": "2026-02-25",                                          │
 │  │    "contacts": [                                                  │
 │  │      { id: "contact1", email: "advisor1@email.com" },           │
 │  │      { id: "contact2", email: "advisor2@email.com" },           │
 │  │      ...                                                          │
 │  │    ],                                                              │
 │  │    "templateId": "template_123",                                  │
 │  │    "segment": "financial advisors",                               │
 │  │    "blogTitle": "The Hidden Cost of Manual Client Work"          │
 │  │  }                                                                 │
 │  │                                                                     │
 │  └─ STEP 5: Call n8n Webhook                                         │
 │     HTTP POST: https://n8n.instance.com/webhook/send-advisors       │
 │     Headers: Authorization: Bearer [n8n-token]                       │
 │     Body: [Payload from STEP 4]                                      │
 │     Response: 202 Accepted                                           │
 │                                                                        │
 │  JADEN HEARTBEAT CHECK:                                               │
 │  ├─ Contacts fetched? ✓ (Count: X)                                   │
 │  ├─ Template created? ✓ (ID: xxx)                                    │
 │  ├─ Webhook triggered? ✓                                             │
 │  └─ Log entry created? ✓                                             │
 │                                                                        │
 └────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
         ╔═════════════════════════════════════════════════════╗
         ║           N8N WORKFLOW: Send Advisors              ║
         ║            (Runs asynchronously)                   ║
         ╚════════════╤════════════════════════════════════════╝
                      │
                      ├─ NODE 1: Receive Webhook
                      │  └─ Extract: contacts[], templateId, segment
                      │
                      ├─ NODE 2: For Each Contact (LOOP)
                      │  │
                      │  ├─ NODE 3: Call GHL API
                      │  │  POST /conversations/messages
                      │  │  ├─ locationId: iGy4nrpDVU0W1jAvseL3
                      │  │  ├─ contactId: [current contact]
                      │  │  ├─ type: "Email"
                      │  │  ├─ body: [template content]
                      │  │  └─ Response: messageId OR error
                      │  │
                      │  ├─ NODE 4: Track Result
                      │  │  if response.status === 201:
                      │  │    sent_count++
                      │  │  else:
                      │  │    failed_count++
                      │  │    error_log.push({contact, error})
                      │  │
                      │  └─ END LOOP
                      │
                      ├─ NODE 5: Log to Database
                      │  Store: {
                      │    workflow: "send_advisors",
                      │    date: today,
                      │    sent: sent_count,
                      │    failed: failed_count,
                      │    segment: "financial advisors",
                      │    execution_time: duration
                      │  }
                      │
                      ├─ NODE 6: Send SMS to Kimberly
                      │  POST /conversations/messages
                      │  ├─ contactId: lM0EcPilFL6XMBQPxHoa
                      │  ├─ type: SMS
                      │  └─ message: "Advisor campaign: 
                      │              Sent {{ sent }}, 
                      │              Failed {{ failed }}"
                      │
                      └─ END WORKFLOW
                      
                              ▼
                      GHL Backend processes
                      Store delivery status
                      Track: Opens, Clicks, Replies


 ┌─ FRIDAY 6:00 PM UTC ──────────────────────────────────────────────────┐
 │                                                                        │
 │  HEARTBEAT: generate-product-ideas.js                                 │
 │  │                                                                     │
 │  ├─ GATHER METRICS (from GHL API):                                   │
 │  │  ├─ Get all advisor emails from past 7 days                       │
 │  │  ├─ Calculate:                                                     │
 │  │  │  ├─ Open rate: X%                                              │
 │  │  │  ├─ Click rate: Y%                                             │
 │  │  │  ├─ Reply rate: Z%                                             │
 │  │  │  └─ Top clicked CTA: [which link?]                            │
 │  │  │                                                                 │
 │  │  ├─ Analyze replies:                                              │
 │  │  │  ├─ Pain point themes                                          │
 │  │  │  ├─ Sentiment analysis                                         │
 │  │  │  └─ Breakthrough signals?                                      │
 │  │  │                                                                 │
 │  │  └─ Compare vs educators:                                         │
 │  │     "Advisors more engaged on AUM growth (82% open rate)"         │
 │  │                                                                     │
 │  ├─ GENERATE 3 IDEAS:                                                │
 │  │  Idea #1: AI Intake Assistant (saves 5 hrs/week, $297/mo)        │
 │  │  Idea #2: Compliance Bot (saves 3 hrs/week, $397/mo)             │
 │  │  Idea #3: Report Generator (saves 2 hrs/week, $197/mo)           │
 │  │                                                                     │
 │  ├─ CHECK BREAKTHROUGH THRESHOLD:                                    │
 │  │  If (open_rate >= 80% AND revenue_per_user >= $150):             │
 │  │    → SMS Kimberly for EARLY APPROVAL                             │
 │  │  Else:                                                            │
 │  │    → Present ideas at Friday message                             │
 │  │                                                                     │
 │  └─ SEND MESSAGE TO KIMBERLY:                                        │
 │     "Advisor ideas ready for approval:                              │
 │      1. Intake Assistant - $297/mo - 8 hrs/week save               │
 │      2. Compliance Bot - $397/mo - revenue protection               │
 │      3. Report Generator - $197/mo - time relief"                   │
 │                                                                        │
 └────────────────────────────────────────────────────────────────────────┘
          (Wait for your approval - you pick 1)
                              │
                              ▼
 ┌─ MONDAY 9:00 AM UTC ──────────────────────────────────────────────────┐
 │                                                                        │
 │  PRODUCT BUILD & LAUNCH (if approved):                               │
 │  │                                                                     │
 │  ├─ Build: [Your approved advisor product]                           │
 │  │  (API integrations, landing page, sales copy)                     │
 │  │                                                                     │
 │  ├─ Create soft offer email                                          │
 │  │  Send to: Top 20% engaged advisors (highest openers)            │
 │  │                                                                     │
 │  ├─ Track conversions:                                               │
 │  │  ├─ Link clicks                                                    │
 │  │  ├─ Page views                                                     │
 │  │  ├─ Sign-ups/purchases                                            │
 │  │  └─ Revenue collected                                             │
 │  │                                                                     │
 │  └─ Report to you:                                                    │
 │     "Advisor product launched: X conversions, $Y revenue"            │
 │                                                                        │
 └────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════
                        14-DAY TIMELINE
═══════════════════════════════════════════════════════════════════════════

Week 1 (Days 1-7): Build Trust
├─ Daily: Blog + Email + n8n send
├─ Friday: Generate ideas + you approve
└─ Goal: Establish value, build credibility

Week 2 (Days 8-14): Test & Launch
├─ Daily: Blog + Email + n8n send  
├─ Monday: Build approved product
├─ Tuesday: Soft launch (20% engaged)
├─ Thursday: Full launch (100% of list)
├─ Friday: Generate new ideas (2nd cycle)
└─ Goal: Revenue + proof of concept

═══════════════════════════════════════════════════════════════════════════
```

---

# PLAN B: EDUCATORS CAMPAIGN WORKFLOW

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    PLAN B: EDUCATORS                                       ║
║                         14-DAY CAMPAIGN                                    ║
║                    (PARALLEL TO PLAN A)                                    ║
╚════════════════════════════════════════════════════════════════════════════╝


                    SAME TIMELINE, DIFFERENT CONTENT
                    
 ┌─ 10:00 AM UTC (OFFSET 30 MIN FROM ADVISORS) ───────────────────────┐
 │                                                                     │
 │  CRON: educator-generate-blog.js                                   │
 │  ├─ Read: /campaigns/educators/blog-content-templates.json         │
 │  ├─ Generate: Day 1-7 blogs (Week 1) OR Day 8-14 blogs (Week 2)   │
 │  ├─ Write: /campaigns/educators/blog-[YYYY-MM-DD].md             │
 │  └─ Log: Generated ✓                                              │
 │                                                                     │
 │  JADEN HEARTBEAT CHECK:                                            │
 │  ├─ Blog written for educators? ✓                                  │
 │  ├─ Different from advisor blog? ✓ (grading pain, not AUM)        │
 │  └─ Educator persona targeted? ✓                                   │
 │                                                                     │
 └─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
 ┌─ 12:00 PM UTC (SAME TIME AS ADVISORS) ─────────────────────────────┐
 │                                                                     │
 │  CRON: educator-send-trigger.js                                    │
 │  │                                                                  │
 │  ├─ STEP 1: Read blog file                                         │
 │  │  └─ /campaigns/educators/blog-[TODAY].md                       │
 │  │                                                                  │
 │  ├─ STEP 2: Query GHL Contacts                                     │
 │  │  API CALL: GET /contacts                                       │
 │  │  ├─ locationId: iGy4nrpDVU0W1jAvseL3                           │
 │  │  ├─ tags: "educators"  ◄── DIFFERENT FROM PLAN A              │
 │  │  └─ Return: [educator1, educator2, educator3, ...]            │
 │  │                                                                  │
 │  ├─ STEP 3: Create GHL Email Template                             │
 │  │  API CALL: POST /emails/builder                                │
 │  │  ├─ name: "Educator Blog [YYYY-MM-DD]"                        │
 │  │  ├─ subject: "💡 Why Great Teachers Are Burning Out"           │
 │  │  ├─ body: [HTML from educator blog]                            │
 │  │  └─ Return: template_id                                        │
 │  │                                                                  │
 │  ├─ STEP 4: Prepare n8n Webhook Payload                           │
 │  │  {                                                              │
 │  │    "campaign": "educators",  ◄── DIFFERENT                    │
 │  │    "date": "2026-02-25",                                       │
 │  │    "contacts": [                                               │
 │  │      { id: "contact_e1", email: "teacher1@email.com" },       │
 │  │      { id: "contact_e2", email: "teacher2@email.com" },       │
 │  │      ...                                                       │
 │  │    ],                                                           │
 │  │    "templateId": "template_456",                               │
 │  │    "segment": "educators",  ◄── DIFFERENT                     │
 │  │    "blogTitle": "Why Great Teachers Are Burning Out"          │
 │  │  }                                                              │
 │  │                                                                  │
 │  └─ STEP 5: Call n8n Webhook                                      │
 │     HTTP POST: https://n8n.instance.com/webhook/send-educators   │
 │     Headers: Authorization: Bearer [n8n-token]                    │
 │     Body: [Payload from STEP 4]                                   │
 │     Response: 202 Accepted                                        │
 │                                                                     │
 │  JADEN HEARTBEAT CHECK:                                            │
 │  ├─ Educator contacts fetched? ✓ (Count: X)                       │
 │  ├─ Educator template created? ✓ (ID: xxx)                        │
 │  ├─ Educator webhook triggered? ✓                                 │
 │  └─ Separate log entry created? ✓                                 │
 │                                                                     │
 └─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
         ╔═════════════════════════════════════════════════════╗
         ║        N8N WORKFLOW: Send Educators                ║
         ║         (Parallel to Plan A)                       ║
         ╚════════════╤════════════════════════════════════════╝
                      │
                      ├─ NODE 1: Receive Webhook
                      │  └─ Extract: contacts[], templateId, segment
                      │
                      ├─ NODE 2: For Each Contact (LOOP)
                      │  │
                      │  ├─ NODE 3: Call GHL API
                      │  │  POST /conversations/messages
                      │  │  ├─ locationId: iGy4nrpDVU0W1jAvseL3
                      │  │  ├─ contactId: [current educator contact]
                      │  │  ├─ type: "Email"
                      │  │  ├─ body: [educator template content]
                      │  │  └─ Response: messageId OR error
                      │  │
                      │  ├─ NODE 4: Track Result
                      │  │  if response.status === 201:
                      │  │    sent_count++
                      │  │  else:
                      │  │    failed_count++
                      │  │
                      │  └─ END LOOP
                      │
                      ├─ NODE 5: Log to Database
                      │  Store: {
                      │    workflow: "send_educators",
                      │    date: today,
                      │    sent: sent_count,
                      │    failed: failed_count,
                      │    segment: "educators",
                      │    execution_time: duration
                      │  }
                      │
                      ├─ NODE 6: Send SMS to Kimberly
                      │  POST /conversations/messages
                      │  └─ message: "Educator campaign: 
                      │              Sent {{ sent }}, 
                      │              Failed {{ failed }}"
                      │
                      └─ END WORKFLOW
                      

 ┌─ FRIDAY 6:00 PM UTC ──────────────────────────────────────────────────┐
 │                                                                        │
 │  HEARTBEAT: generate-product-ideas.js (EDUCATORS EDITION)            │
 │  │                                                                     │
 │  ├─ GATHER METRICS (from GHL API):                                   │
 │  │  ├─ Get all educator emails from past 7 days                      │
 │  │  ├─ Calculate:                                                     │
 │  │  │  ├─ Open rate: X%  (likely higher than advisors)              │
 │  │  │  ├─ Click rate: Y%                                             │
 │  │  │  ├─ Reply rate: Z%                                             │
 │  │  │  └─ Top clicked CTA: [which link?]                            │
 │  │  │                                                                 │
 │  │  ├─ Analyze replies:                                              │
 │  │  │  ├─ Pain point themes (grading, feedback, parent comm)        │
 │  │  │  ├─ Sentiment: Are teachers excited or skeptical?             │
 │  │  │  └─ Breakthrough signals?                                      │
 │  │  │                                                                 │
 │  │  └─ Compare vs advisors:                                          │
 │  │     "Educators 45% more engaged on grading automation"            │
 │  │                                                                     │
 │  ├─ GENERATE 3 IDEAS:                                                │
 │  │  Idea #1: Auto Grading + Feedback (saves 8 hrs/week, $197/mo)   │
 │  │  Idea #2: Parent Reporting Bot (saves 3 hrs/week, $147/mo)      │
 │  │  Idea #3: Differentiation Generator (saves 5 hrs/week, $197/mo) │
 │  │                                                                     │
 │  ├─ CHECK BREAKTHROUGH THRESHOLD:                                    │
 │  │  If (open_rate >= 80% AND revenue_per_user >= $150):             │
 │  │    → SMS Kimberly for EARLY APPROVAL                             │
 │  │       "Breakthrough: Grading Bot idea. Revenue: $197/mo.        │
 │  │        Build: 6 hrs. Approval to launch early?"                 │
 │  │  Else:                                                            │
 │  │    → Present ideas at Friday message                             │
 │  │                                                                     │
 │  └─ SEND MESSAGE TO KIMBERLY:                                        │
 │     "Educator ideas ready for approval:                             │
 │      1. Auto Grading - $197/mo - saves 8 hrs/week                 │
 │      2. Parent Bot - $147/mo - automate updates                    │
 │      3. Lesson Diff - $197/mo - differentiate instantly"           │
 │                                                                        │
 └────────────────────────────────────────────────────────────────────────┘
          (Wait for your approval - you pick 1 FOR EDUCATORS)
                              │
                              ▼
 ┌─ MONDAY 9:00 AM UTC ──────────────────────────────────────────────────┐
 │                                                                        │
 │  EDUCATOR PRODUCT BUILD & LAUNCH:                                    │
 │  │                                                                     │
 │  ├─ Build: [Your approved educator product]                          │
 │  │  (Different from advisor product)                                 │
 │  │                                                                     │
 │  ├─ Create soft offer email (educator-specific copy)                │
 │  │  Send to: Top 20% engaged educators                              │
 │  │                                                                     │
 │  ├─ Track conversions (separate from advisors):                      │
 │  │  ├─ Educator link clicks                                          │
 │  │  ├─ Educator page views                                           │
 │  │  ├─ Educator sign-ups/purchases                                   │
 │  │  └─ Educator revenue collected                                    │
 │  │                                                                     │
 │  └─ Report to you:                                                    │
 │     "Educator product launched: X conversions, $Y revenue            │
 │      Advisor product: A conversions, $B revenue"                    │
 │                                                                        │
 └────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════
                  PLAN A + PLAN B COMBINED TIMELINE
═══════════════════════════════════════════════════════════════════════════

10:00 AM UTC:
  ├─ JADEN writes advisor blog
  └─ JADEN writes educator blog (30 min apart, different content)

12:00 PM UTC:
  ├─ n8n sends advisor emails
  ├─ n8n sends educator emails
  └─ Both run in parallel (separate workflows)

Friday 6:00 PM UTC:
  ├─ 3 advisor product ideas generated
  ├─ 3 educator product ideas generated
  └─ You approve 1 advisor + 1 educator (2 approvals total)

Monday 9:00 AM UTC:
  ├─ Build advisor product
  ├─ Build educator product
  └─ Launch both soft offers

Thursday:
  ├─ Full launch advisor product
  ├─ Full launch educator product
  └─ Compare results

═══════════════════════════════════════════════════════════════════════════
                           KEY DIFFERENCES
═══════════════════════════════════════════════════════════════════════════

Plan A (Advisors)          │  Plan B (Educators)
───────────────────────────┼─────────────────────────
Blog: AUM, compliance      │  Blog: Grading, burnout
Pain: Admin burden         │  Pain: Time drain
Segment: "financial adv"   │  Segment: "educators"
CTA: $300-500/hr value     │  CTA: Time reclamation
Product focus: Revenue     │  Product focus: Outcomes
Revenue model: AUM-based   │  Revenue model: Savings-based

═══════════════════════════════════════════════════════════════════════════
```

---

This is complete. Plan A and Plan B workflows now show:
- ✅ Cron jobs (when things run)
- ✅ Heartbeats (weekly ideation + breakthrough check)
- ✅ n8n integrations (where emails actually send)
- ✅ Parallel execution (both campaigns at same time)
- ✅ Different audiences (advisors vs educators)
- ✅ Product cycles (approval → build → launch)
