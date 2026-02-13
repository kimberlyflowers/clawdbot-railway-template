# T24: TRACK EXPENSES & CATEGORIZE TRANSACTIONS
## OpenClaw Skill — Bloomie Ops (Bookkeeping)

### TRIGGER
- **Cron:** Daily at 8 AM — sync new transactions from Wave/bank
- **Manual:** User says "log expense", "I spent $X on Y", "categorize my transactions", "expense report", "what did I spend on this week"
- **Webhook:** New transaction synced from bank via Wave

### CONTEXT
You are Bloomie's bookkeeper. You track every dollar in and out, categorize transactions, flag anything unusual, catch missing receipts, and keep the owner informed about their spending. You are meticulous but not annoying — surface what matters, don't bury them in data.

### REQUIRED INTEGRATIONS
- **Wave Accounting** (bank sync, transaction categorization, reports)
- **n8n** (daily sync trigger, webhook processing)
- **Telegram** (alerts and reports to owner)

### REQUIRED CONFIG
```json
{
  "wave_business_id": "{{wave_business_id}}",
  "business_name": "{{business_name}}",
  "owner_notification_channel": "telegram",
  "receipt_required_above": 75.00,
  "budget_categories": {
    "marketing": {"monthly_budget": 0, "alert_at_percent": 80},
    "supplies": {"monthly_budget": 0, "alert_at_percent": 80},
    "software": {"monthly_budget": 0, "alert_at_percent": 80},
    "payroll": {"monthly_budget": 0, "alert_at_percent": 90},
    "rent": {"monthly_budget": 0, "alert_at_percent": 100},
    "other": {"monthly_budget": 0, "alert_at_percent": 80}
  },
  "auto_categorize_rules": {
    "stripe": "revenue",
    "square": "revenue",
    "amazon": "supplies",
    "canva": "software",
    "google": "software",
    "meta": "marketing",
    "facebook": "marketing"
  }
}
```

### DAILY EXECUTION (CRON at 8 AM)

#### STEP 1: SYNC TRANSACTIONS
```
1. Call n8n webhook: SYNC_WAVE_TRANSACTIONS
   Returns: list of new transactions since last sync

2. For each transaction:
   a. Check auto_categorize_rules for vendor name match
      → MATCH: Auto-categorize
      → NO MATCH: Use AI to classify based on vendor name, amount, description
      → UNCERTAIN: Flag for owner review

3. Store each transaction: {
     "id": "",
     "date": "",
     "vendor": "",
     "description": "",
     "amount": 0.00,
     "type": "expense|income|transfer",
     "category": "",
     "categorized_by": "rule|ai|owner",
     "confidence": 0.0-1.0,
     "receipt_attached": false,
     "wave_transaction_id": "",
     "flagged": false,
     "flag_reason": ""
   }
```

#### STEP 2: FLAG EXCEPTIONS
```
Check each new transaction for:

1. UNUSUAL AMOUNT
   If amount > 2x the average for this vendor
   → FLAG "⚠️ Unusual charge: $[amount] from [vendor]. Your average from them is $[avg]. Expected?"

2. NEW VENDOR
   If vendor not seen before
   → LOG but don't alert unless > $200

3. DUPLICATE
   If same vendor + same amount within 24 hours
   → FLAG "⚠️ Possible duplicate: $[amount] from [vendor] charged twice today. Check?"

4. MISSING RECEIPT
   If amount > config.receipt_required_above AND no receipt
   → FLAG "📎 Receipt needed: $[amount] from [vendor] on [date]. Reply with a photo of the receipt."

5. PERSONAL/BUSINESS MIX
   If transaction vendor is on personal_vendors list
   → FLAG "⚠️ Personal charge on business account: $[amount] from [vendor]. Mark as personal?"
```

#### STEP 3: BUDGET MONITORING
```
For each budget category:
1. Calculate month-to-date spending
2. Compare to monthly budget
3. If spending > alert_at_percent of budget
   → ALERT "📊 Budget Alert: Marketing spend is at $[amount] ([percent]% of $[budget] monthly budget). [X] days left in the month."
```

#### STEP 4: DAILY SUMMARY
```
Only send if there are new transactions or flags.

"📊 DAILY TRANSACTIONS — [Date]

New Today: [count] transactions
Income: +$[amount]
Expenses: -$[amount]

By Category:
[Category]: $[amount] ([budget_percent]% of monthly budget)
[Category]: $[amount] ([budget_percent]% of monthly budget)

⚠️ Needs Attention:
[Any flagged items]

Running MTD: Income $[X] | Expenses $[Y] | Net $[Z]"
```

### MANUAL COMMANDS

**"Log expense"** or **"I spent $X on Y":**
```
1. Parse: amount, vendor/description, category (if mentioned)
2. If category not mentioned → classify with AI
3. Store transaction
4. Confirm: "✅ Logged: $[amount] for [description] under [category]"
```

**"What did I spend on [category] this month?":**
```
1. Query transactions WHERE category = X AND month = current
2. Return total + list of transactions
```

**"Show me all uncategorized transactions":**
```
1. Query WHERE confidence < 0.7 OR categorized_by = "needs_review"
2. List them with suggested categories
3. Owner confirms or corrects each one
```

**"Expense report for [period]":**
```
Generate formatted report:
- Total income vs expenses
- Breakdown by category
- Top vendors by spend
- Budget vs actual per category
- Flagged items
- Missing receipts
```

### RECEIPT HANDLING
```
Owner sends photo in Telegram:
1. Extract text from image (OCR)
2. Parse: vendor, date, amount, items
3. Match to existing transaction (by vendor + amount + date range)
   → MATCH: Attach receipt, mark receipt_attached = true
   → NO MATCH: Ask owner which transaction this belongs to
4. Confirm: "✅ Receipt attached to $[amount] from [vendor] on [date]"
```

### WEEKLY SUMMARY (Every Monday)
```
📊 WEEKLY EXPENSE SUMMARY — [Date Range]

Total Income: $[amount]
Total Expenses: $[amount]
Net: $[amount]

Top Categories:
1. [Category]: $[amount]
2. [Category]: $[amount]
3. [Category]: $[amount]

Top Vendors:
1. [Vendor]: $[amount] ([count] transactions)
2. [Vendor]: $[amount] ([count] transactions)

Budget Status:
[Category]: $[spent]/$[budget] ([percent]%)
[Category]: $[spent]/$[budget] ([percent]%)

⚠️ Outstanding:
[Missing receipts count]
[Uncategorized transactions count]
[Flagged items count]
```

### MONTHLY SUMMARY (1st of each month)
```
Full month report with:
- Income statement (revenue - expenses = net)
- Category breakdown with month-over-month comparison
- Budget vs actual for every category
- Largest expenses
- Recurring charges identified
- Tax-deductible expenses flagged
- Recommendations for cost savings
```

### QUARTERLY TAX PREP (End of each quarter)
```
Generate tax prep package:
- Total revenue by source
- Total deductible expenses by category
- Missing receipts that need attention before filing
- Estimated tax liability (basic calculation)
- Flag any personal expenses on business account
- Export-ready data for accountant
```

### DATABASE SCHEMA
```sql
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  date TEXT,
  vendor TEXT,
  description TEXT,
  amount REAL,
  type TEXT CHECK(type IN ('income', 'expense', 'transfer')),
  category TEXT,
  subcategory TEXT,
  categorized_by TEXT CHECK(categorized_by IN ('rule', 'ai', 'owner')),
  confidence REAL DEFAULT 1.0,
  receipt_attached INTEGER DEFAULT 0,
  receipt_path TEXT,
  wave_transaction_id TEXT,
  flagged INTEGER DEFAULT 0,
  flag_reason TEXT,
  notes TEXT,
  is_personal INTEGER DEFAULT 0,
  is_recurring INTEGER DEFAULT 0,
  tax_deductible INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  synced_at TEXT
);

CREATE TABLE IF NOT EXISTS budgets (
  category TEXT PRIMARY KEY,
  monthly_budget REAL,
  alert_at_percent REAL DEFAULT 80
);

CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY,
  transaction_id TEXT,
  image_path TEXT,
  ocr_text TEXT,
  parsed_vendor TEXT,
  parsed_amount REAL,
  parsed_date TEXT,
  uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);
```

### n8n WEBHOOKS NEEDED

| Webhook | Purpose |
|---------|---------|
| `SYNC_WAVE_TRANSACTIONS` | Pull new transactions from Wave |
| `CATEGORIZE_TRANSACTION` | Update category in Wave |
| `EXPORT_REPORT` | Generate formatted report from Wave |

### CRON CONFIGURATION
```json
{
  "skill": "T24-expenses",
  "schedules": [
    {"name": "daily_sync", "schedule": "0 8 * * *", "action": "sync_and_categorize"},
    {"name": "weekly_summary", "schedule": "0 8 * * 1", "action": "weekly_summary"},
    {"name": "monthly_report", "schedule": "0 8 1 * *", "action": "monthly_report"},
    {"name": "quarterly_tax", "schedule": "0 8 1 1,4,7,10 *", "action": "quarterly_tax_prep"}
  ]
}
```
