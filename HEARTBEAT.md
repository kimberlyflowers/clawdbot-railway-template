# HEARTBEAT - DUAL CAMPAIGN OPERATIONS (Plans A & B)

## DAILY SCHEDULE

### 10:00 AM UTC - BLOG GENERATION
**ADVISOR BLOG:**
- [ ] `advisor-generate-blog.js` runs
- [ ] Blog written to `/campaigns/advisors/blog-[DATE].md`
- [ ] Content specific to advisor pain points (Days 1-14)
- [ ] Status: ✓ Ready for 12 PM send

**EDUCATOR BLOG:**
- [ ] `educator-generate-blog.js` runs
- [ ] Blog written to `/campaigns/educators/blog-[DATE].md`
- [ ] Content specific to educator pain points (Days 1-14)
- [ ] Status: ✓ Ready for 12 PM send

---

### 12:00 PM UTC - EMAIL SENDING (via n8n)

**ADVISOR CAMPAIGN:**
- [ ] `advisor-send-trigger.js` runs
- [ ] Step 1: Read `/campaigns/advisors/blog-[TODAY].md`
- [ ] Step 2: Query GHL API - GET `/contacts?tags=financial advisors`
- [ ] Step 3: Create email template in GHL (HTML)
- [ ] Step 4: Prepare n8n webhook payload
- [ ] Step 5: POST to n8n webhook: `https://n8n.instance.com/webhook/send-advisors`
- [ ] n8n loops through contacts + sends emails
- [ ] Track: Email count sent, failed count
- [ ] Result logged to `/campaigns/.advisor-send-log`

**EDUCATOR CAMPAIGN:**
- [ ] `educator-send-trigger.js` runs
- [ ] Step 1: Read `/campaigns/educators/blog-[TODAY].md`
- [ ] Step 2: Query GHL API - GET `/contacts?tags=educators`
- [ ] Step 3: Create email template in GHL (HTML)
- [ ] Step 4: Prepare n8n webhook payload
- [ ] Step 5: POST to n8n webhook: `https://n8n.instance.com/webhook/send-educators`
- [ ] n8n loops through contacts + sends emails
- [ ] Track: Email count sent, failed count
- [ ] Result logged to `/campaigns/.educator-send-log`

**JADEN HEARTBEAT CHECK (after sends):**
- [ ] Advisor contacts queried? (Count: ___)
- [ ] Educator contacts queried? (Count: ___)
- [ ] Both n8n webhooks triggered? ✓
- [ ] Email logs created? ✓
- [ ] Ready for tomorrow? ✓

---

## WEEKLY SCHEDULE (Friday 6 PM UTC)

### ADVISOR IDEAS GENERATION

**GATHER METRICS (from GHL):**
- [ ] Get all advisor emails from past 7 days
- [ ] Calculate open rate: ___%
- [ ] Calculate click rate: ___%
- [ ] Calculate reply rate: ___%
- [ ] Identify top clicked CTA: ________
- [ ] Analyze reply themes: ________

**GENERATE 3 IDEAS:**
- [ ] Idea #1: _____________ ($___/month) - Build: ___ hours
- [ ] Idea #2: _____________ ($___/month) - Build: ___ hours
- [ ] Idea #3: _____________ ($___/month) - Build: ___ hours

**CHECK BREAKTHROUGH THRESHOLD:**
- [ ] Open rate >= 80%? ___
- [ ] Revenue/customer >= $150/month? ___
- [ ] Build time <= 24 hours? ___
- [ ] If YES to all: Text Kimberly at 2102949625 for EARLY APPROVAL
- [ ] If NO: Present ideas to Kimberly for standard Friday approval

**SEND MESSAGE TO KIMBERLY:**
```
Plan A (Advisors) - 3 Ideas Ready:
1. [Title] - $X/mo - [Value prop]
2. [Title] - $X/mo - [Value prop]
3. [Title] - $X/mo - [Value prop]

Which do you want to build first?
```

---

### EDUCATOR IDEAS GENERATION

**GATHER METRICS (from GHL):**
- [ ] Get all educator emails from past 7 days
- [ ] Calculate open rate: ___%
- [ ] Calculate click rate: ___%
- [ ] Calculate reply rate: ___%
- [ ] Identify top clicked CTA: ________
- [ ] Analyze reply themes: ________

**GENERATE 3 IDEAS:**
- [ ] Idea #1: _____________ ($___/month) - Build: ___ hours
- [ ] Idea #2: _____________ ($___/month) - Build: ___ hours
- [ ] Idea #3: _____________ ($___/month) - Build: ___ hours

**CHECK BREAKTHROUGH THRESHOLD:**
- [ ] Open rate >= 80%? ___
- [ ] Revenue/customer >= $150/month? ___
- [ ] Build time <= 24 hours? ___
- [ ] If YES to all: Text Kimberly at 2102949625 for EARLY APPROVAL
- [ ] If NO: Present ideas to Kimberly for standard Friday approval

**SEND MESSAGE TO KIMBERLY:**
```
Plan B (Educators) - 3 Ideas Ready:
1. [Title] - $X/mo - [Value prop]
2. [Title] - $X/mo - [Value prop]
3. [Title] - $X/mo - [Value prop]

Which do you want to build first?
```

---

### WEEKLY REFLECTION

**COMPARE BOTH CAMPAIGNS:**
- [ ] Which audience more engaged? (Advisors vs Educators)
- [ ] Which pain points resonating most?
- [ ] Which CTA getting highest click-through?
- [ ] Revenue potential by audience?
- [ ] Next week's focus: ________

---

## POST-APPROVAL (Monday 9 AM UTC)

### ADVISOR PRODUCT BUILD & LAUNCH

**After Friday approval of 1 advisor idea:**
- [ ] Build product (API integrations, landing page, copy)
- [ ] Create soft offer email (to top 20% engaged advisors)
- [ ] Send soft offer (Tuesday 9 AM)
- [ ] Track conversions (link clicks, page views, sign-ups)
- [ ] Report to Kimberly: "X conversions, $Y revenue"

**Thursday - Full Launch:**
- [ ] Send to entire advisor list
- [ ] Track conversions
- [ ] Report results

---

### EDUCATOR PRODUCT BUILD & LAUNCH

**After Friday approval of 1 educator idea:**
- [ ] Build product (API integrations, landing page, copy)
- [ ] Create soft offer email (to top 20% engaged educators)
- [ ] Send soft offer (Tuesday 9 AM)
- [ ] Track conversions (link clicks, page views, sign-ups)
- [ ] Report to Kimberly: "X conversions, $Y revenue"

**Thursday - Full Launch:**
- [ ] Send to entire educator list
- [ ] Track conversions
- [ ] Report results

---

## 14-DAY CAMPAIGN METRICS

### WEEK 1 (Days 1-7): Build Trust

**Advisors:**
- Emails sent: 7
- Open rate: ___%
- Click rate: ___%
- Reply rate: ___%
- Top CTA: ________

**Educators:**
- Emails sent: 7
- Open rate: ___%
- Click rate: ___%
- Reply rate: ___%
- Top CTA: ________

**Friday (Day 7):**
- Advisor ideas presented: 3
- Educator ideas presented: 3
- Approvals from Kimberly: 2 (1 per audience)

---

### WEEK 2 (Days 8-14): Test & Launch

**Advisor Product:**
- Soft launch (Day 9): ___ sent
- Soft launch conversions: ___
- Full launch (Day 11): ___ sent
- Full launch conversions: ___
- Revenue: $____

**Educator Product:**
- Soft launch (Day 9): ___ sent
- Soft launch conversions: ___
- Full launch (Day 11): ___ sent
- Full launch conversions: ___
- Revenue: $____

**Friday (Day 14):**
- New advisor ideas: 3 (for next cycle)
- New educator ideas: 3 (for next cycle)
- New approvals: 2 (if ready)

---

## BREAKTHROUGH MOMENT TRIGGER

**When to notify Kimberly immediately (SMS to 2102949625):**

```
Criteria:
- [ ] Pain point engagement: 80%+ across audience
- [ ] Revenue potential: $150+/month per customer
- [ ] Build time: <24 hours
- [ ] Market window: Can't wait until Monday

TRIGGER TEXT:
"Breakthrough idea: [Product Name]. 
Revenue: $X/month/customer.
Build: X hours.
Approval to launch early?"
```

---

## RUNNING TOTAL (14 Days)

### Content Produced
- Blog posts: 28 (14 advisors + 14 educators)
- Email templates: 28
- Daily sends: 28 (14 advisors + 14 educators)

### Products Generated
- Ideas presented: 12 (6 advisors + 6 educators)
- Ideas approved: 4 (2 advisors + 2 educators)
- Products built: 4 (2 advisors + 2 educators)

### Revenue Generated
- Week 1 soft launches: __________
- Week 2 full launches: __________
- Total revenue (14 days): $________

### Engagement Metrics
- Total emails sent: ___
- Total opens: ___
- Average open rate: ___%
- Average click rate: ___%
- Advisor vs educator comparison: ________

---

## API KEYS & CREDENTIALS

**GHL (for JADEN triggers):**
```
GHL_TOKEN: pit-a2f307f4-08b6-4c00-a2da-a1ce03b3a927
GHL_LOCATION_ID: iGy4nrpDVU0W1jAvseL3
GHL_API_BASE: https://services.leadconnectorhq.com
GHL_VERSION: 2021-07-28
```

**n8n (for email sending):**
```
N8N_WEBHOOK_ADVISORS: https://n8n.instance.com/webhook/send-advisors
N8N_WEBHOOK_EDUCATORS: https://n8n.instance.com/webhook/send-educators
N8N_AUTH_TOKEN: [from n8n admin panel]
```

**Kimberly Contact:**
```
GHL_CONTACT_ID: lM0EcPilFL6XMBQPxHoa
PHONE: 2102949625
```

---

## CRON JOBS

```bash
# Advisor blog generation (10 AM UTC)
0 10 * * * /usr/bin/node /data/workspace/scripts/campaigns/advisor-generate-blog.js

# Educator blog generation (10 AM UTC, offset 30 min after advisor)
30 10 * * * /usr/bin/node /data/workspace/scripts/campaigns/educator-generate-blog.js

# Advisor send trigger (12 PM UTC)
0 12 * * * /usr/bin/node /data/workspace/scripts/campaigns/advisor-send-trigger.js

# Educator send trigger (12 PM UTC, parallel to advisor)
0 12 * * * /usr/bin/node /data/workspace/scripts/campaigns/educator-send-trigger.js

# Weekly ideation (Friday 6 PM UTC)
0 18 * * FRI /usr/bin/node /data/workspace/scripts/campaigns/generate-product-ideas.js
```

---

## STATUS CHECKS

**DAILY (After 12 PM sends):**
- [ ] Advisor emails sent? ✓
- [ ] Educator emails sent? ✓
- [ ] n8n workflows completed? ✓
- [ ] Logs written? ✓
- [ ] Ready for next day? ✓

**WEEKLY (Friday after ideas):**
- [ ] Metrics analyzed? ✓
- [ ] 3 advisor ideas generated? ✓
- [ ] 3 educator ideas generated? ✓
- [ ] Ideas presented to Kimberly? ✓
- [ ] Approval received? ✓

**POST-APPROVAL (Monday after build):**
- [ ] Advisor product built? ✓
- [ ] Educator product built? ✓
- [ ] Soft launches sent? ✓
- [ ] Conversions tracking? ✓
- [ ] Ready for Thursday full launch? ✓

---

**EXECUTION STATUS: 🚀 READY**

All systems in place. Awaiting n8n webhook URLs.
