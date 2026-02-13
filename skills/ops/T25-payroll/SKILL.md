# T25: RUN PAYROLL & PAY CONTRACTORS
## OpenClaw Skill — Bloomie Ops (Bookkeeping)

### TRIGGER
- **Cron:** Payroll processing based on schedule (biweekly/monthly)
- **Manual:** User says "run payroll", "pay [name]", "process contractor payment", "how much do I owe [name]"
- **Reminder:** 2 days before payroll due date

### CONTEXT
You manage payroll for {{business_name}}. For a startup school like Youth Empowerment School, this likely starts simple — a few staff or contractors paid monthly. You track hours (if hourly), calculate pay, process payments, and keep records. You are PRECISE with money — every penny accounted for. When in doubt, ASK the owner before paying anyone.

### IMPORTANT
Payroll is the ONE area where Bloomie should be most conservative. Never auto-pay without owner confirmation. Always show the calculation FIRST, get approval, THEN process. Mistakes with people's pay destroy trust instantly.

### REQUIRED CONFIG
```json
{
  "business_name": "{{business_name}}",
  "payroll_schedule": "monthly",
  "payroll_day": 1,
  "team": [
    {
      "name": "",
      "role": "",
      "type": "employee|contractor",
      "pay_type": "salary|hourly",
      "rate": 0.00,
      "payment_method": "direct_deposit|check|zelle|paypal|venmo",
      "payment_details": "",
      "tax_withholding": true,
      "start_date": ""
    }
  ],
  "owner_approval_required": true,
  "owner_notification_channel": "telegram",
  "payment_processor": "gusto|manual|zelle"
}
```

### EXECUTION: PAYROLL CYCLE

#### 2 DAYS BEFORE PAYROLL (Reminder)
```
Send to owner via Telegram:
"📅 Payroll Reminder: Payroll is due in 2 days ([date]).

Team to pay:
[Name] — [Role] — $[amount] ([type])
[Name] — [Role] — $[amount] ([type])

Total payroll: $[total]

⏰ I'll prepare the full payroll breakdown on [payroll_day].
Any changes needed? (new hires, hours adjustments, bonuses?)"
```

#### PAYROLL DAY

##### STEP 1: GATHER DATA
```
For HOURLY employees/contractors:
- Pull hours from timesheet (Homebase/manual entry)
- Calculate: hours × rate = gross pay
- Add overtime if applicable (hours > 40/week × 1.5)

For SALARIED:
- Monthly amount = annual / 12

For CONTRACTORS:
- Check for submitted invoices
- Or calculate based on agreed rate
```

##### STEP 2: CALCULATE
```
For each person: {
  "name": "",
  "gross_pay": 0.00,
  "deductions": {
    "federal_tax": 0.00,
    "state_tax": 0.00,
    "fica": 0.00,
    "benefits": 0.00,
    "other": 0.00
  },
  "net_pay": 0.00,
  "payment_method": "",
  "notes": ""
}

For contractors:
No deductions (they handle their own taxes)
Just gross = net
```

##### STEP 3: PRESENT FOR APPROVAL
```
Send to owner:
"💰 PAYROLL READY FOR APPROVAL — [Pay Period]

EMPLOYEES:
[Name] — [Role]
Gross: $[amount] | Deductions: $[amount] | Net: $[amount]

CONTRACTORS:
[Name] — [Role]
Amount: $[amount]

TOTAL PAYROLL: $[total]
Employee wages: $[amount]
Contractor payments: $[amount]
Employer taxes (FICA match): $[amount]
Total cost to business: $[grand_total]

Bank balance: $[balance]
(after payroll: $[remaining])

✅ Approve and process?
❌ Hold — need changes?"
```

##### STEP 4: PROCESS (Only after owner approves)
```
IF using Gusto/ADP:
Submit payroll through platform API

IF manual (Zelle/PayPal/Venmo/check):
For each person:
Notify owner: "Send $[amount] to [name] via [method]"
OR process through connected payment service
Owner confirms each payment sent
Mark each as paid in database
```

##### STEP 5: RECORD
```
For each payment:
- Log in payroll database
- Record in Wave as expense (categorized correctly)
- Update year-to-date totals per person

Send confirmations:
To each person (if email configured):
"Your payment of $[amount] for [period] has been processed via [method]."

To owner:
"✅ Payroll complete for [period]. [X] people paid. Total: $[amount]. All recorded in Wave."
```

### CONTRACTOR INVOICE HANDLING
```
When contractor submits invoice:
1. Parse invoice: amount, description, period
2. Match to contractor in team list
3. Verify against agreed rate/scope
4. Queue for next payroll cycle OR process immediately if requested
5. Notify owner: "[Name] submitted invoice for $[amount]. Process now or include in next payroll?"
```

### YEAR-END TASKS
```
January (for previous year):
- Generate W-2 summaries for employees
- Generate 1099 summaries for contractors paid > $600
- Total payroll expense report for tax filing
- Alert owner: "Year-end payroll documents ready. Forward to your accountant."
```

### DATABASE SCHEMA
```sql
CREATE TABLE IF NOT EXISTS payroll (
  id TEXT PRIMARY KEY,
  person_name TEXT,
  person_type TEXT CHECK(person_type IN ('employee', 'contractor')),
  pay_period_start TEXT,
  pay_period_end TEXT,
  hours_worked REAL,
  gross_pay REAL,
  deductions REAL DEFAULT 0,
  net_pay REAL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  approved_by TEXT,
  approved_at TEXT,
  paid_at TEXT,
  wave_transaction_id TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  name TEXT,
  role TEXT,
  type TEXT CHECK(type IN ('employee', 'contractor')),
  pay_type TEXT CHECK(pay_type IN ('salary', 'hourly')),
  rate REAL,
  payment_method TEXT,
  payment_details TEXT,
  start_date TEXT,
  active INTEGER DEFAULT 1,
  ytd_gross REAL DEFAULT 0,
  ytd_net REAL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### CRON CONFIGURATION
```json
{
  "skill": "T25-payroll",
  "schedules": [
    {"name": "payroll_reminder", "schedule": "0 9 29 * *", "action": "send_reminder"},
    {"name": "payroll_day", "schedule": "0 9 1 * *", "action": "prepare_payroll"},
    {"name": "year_end", "schedule": "0 9 15 1 *", "action": "generate_year_end_docs"}
  ]
}
```

### SAFETY RULES
1. NEVER process payment without explicit owner approval
2. NEVER change someone's pay rate without owner confirmation
3. ALWAYS show the math before processing
4. ALWAYS verify bank balance can cover payroll before presenting
5. Flag if payroll would bring account below $[safety_threshold]
