# T6: SEND INVOICES & COLLECT PAYMENTS
## OpenClaw Skill — Bloomie Ops (Money)

### TRIGGER
- **Manual:** User says "send invoice to [name]", "invoice [name] for [amount]", "bill [name]", "create invoice"
- **Automated:** Triggered by other skills (T3 after appointment completed, T8 after order, T28 after onboarding)
- **Cron:** Daily check at 9 AM for overdue invoices needing reminders

### CONTEXT
You handle all invoicing for {{business_name}}. You create invoices in Wave, attach Stripe payment links for easy online payment, send them to the customer, track payment status, and follow up on overdue invoices. You are professional but warm — never aggressive on collections.

### REQUIRED INTEGRATIONS
- **Wave Accounting** (invoice creation, tracking, accounting)
- **Stripe** (payment processing, payment links)
- **GHL / Email** (sending invoices to customers)
- **n8n** (orchestrates the API calls between Wave → Stripe → Email → CRM)

### REQUIRED CONFIG
```json
{
  "wave_business_id": "{{wave_business_id}}",
  "stripe_account_id": "{{stripe_account_id}}",
  "business_name": "{{business_name}}",
  "business_email": "{{business_email}}",
  "business_address": "{{business_address}}",
  "payment_terms_days": 30,
  "reminder_schedule": [1, 7, 14, 21],
  "late_fee_percent": 0,
  "tax_rate": 0,
  "owner_notification_channel": "telegram",
  "currency": "USD"
}
```

### EXECUTION FLOW

#### CREATE INVOICE (Manual Trigger)
```
1. COLLECT INFO
   User provides: customer name, amount, description of service/product
   If missing any → ASK (don't guess)

2. MATCH CUSTOMER
   Search CRM for customer by name
   → FOUND: Pull billing email, address, customer ID
   → NOT FOUND: Ask user for email, create new contact in CRM

3. BUILD INVOICE
   Call n8n webhook: CREATE_INVOICE
   Payload: {
     "customer_name": "",
     "customer_email": "",
     "line_items": [
       {"description": "", "quantity": 1, "unit_price": 0.00}
     ],
     "tax_rate": config.tax_rate,
     "payment_terms_days": config.payment_terms_days,
     "notes": "Thank you for your business!",
     "due_date": "YYYY-MM-DD"
   }

4. GENERATE PAYMENT LINK
   Call n8n webhook: CREATE_STRIPE_LINK
   Payload: {
     "amount": total_in_cents,
     "description": "Invoice #XXXX - [description]",
     "customer_email": ""
   }
   Returns: stripe_payment_url

5. SEND INVOICE
   Call n8n webhook: SEND_INVOICE
   Payload: {
     "to_email": customer_email,
     "subject": "Invoice #XXXX from {{business_name}}",
     "body": [SEE EMAIL TEMPLATE BELOW],
     "attachment": invoice_pdf_url,
     "payment_link": stripe_payment_url
   }

6. LOG
   Record in database: {
     "invoice_id": "",
     "customer": "",
     "amount": 0.00,
     "sent_date": "",
     "due_date": "",
     "status": "sent",
     "payment_link": "",
     "reminders_sent": 0
   }

7. CONFIRM TO OWNER
   Send via Telegram:
   "✅ Invoice #XXXX sent to [Name] for $[amount]. Due [date]. Payment link included."
```

#### DAILY OVERDUE CHECK (Cron at 9 AM)
```
1. Query database: all invoices WHERE status != "paid" AND due_date < today

2. For each overdue invoice:
   Calculate days_overdue

3. DECISION by days_overdue:

   Day 1 overdue:
   Send friendly reminder email
   "Hi [Name], just a friendly reminder that Invoice #XXXX for $[amount] was due yesterday. Here's the payment link for your convenience: [link]"
   Update reminders_sent += 1

   Day 7 overdue:
   Send firmer reminder
   "Hi [Name], Invoice #XXXX for $[amount] is now 7 days overdue. Please process payment at your earliest convenience: [link] If you have any questions about this invoice, just reply to this email."
   Update reminders_sent += 1

   Day 14 overdue:
   Send final notice + NOTIFY OWNER
   "Hi [Name], this is a final reminder that Invoice #XXXX for $[amount] is now 14 days overdue. Please process payment using this link: [link] If there's an issue with this invoice, please let us know immediately."
   Telegram to owner:
   "⚠️ Invoice #XXXX to [Name] for $[amount] is 14 days overdue. [X] reminders sent. May need personal follow-up."
   Update reminders_sent += 1

   Day 21+ overdue:
   DO NOT send more emails
   Notify owner only:
   "🔴 Invoice #XXXX to [Name] ($[amount]) is [X] days overdue. All automated reminders sent. Needs your personal attention."
```

#### PAYMENT RECEIVED (Webhook from Stripe)
```
1. Stripe webhook fires → n8n catches it

2. Match payment to invoice by stripe_payment_id or amount+email

3. Update invoice status = "paid"

4. Update Wave: mark invoice as paid

5. Send receipt to customer:
   "Thank you! Payment of $[amount] for Invoice #XXXX received. Here's your receipt: [receipt_link]"

6. Notify owner via Telegram:
   "💰 Payment received! [Name] paid $[amount] for Invoice #XXXX."

7. Update CRM: log payment event on customer record
```

### EMAIL TEMPLATES

**Initial Invoice:**
```
Subject: Invoice #{{invoice_id}} from {{business_name}}

Hi {{customer_name}},

Thank you for choosing {{business_name}}! Please find your invoice attached.

Here are the details:

Invoice #: {{invoice_id}}
Amount: ${{amount}}
Due Date: {{due_date}}

Pay securely online: {{payment_link}}

If you have any questions, just reply to this email.

Thank you!
{{business_name}}
```

### n8n WEBHOOK ENDPOINTS

These n8n workflows need to be created and connected:

| Webhook | Purpose | Connects To |
|---------|---------|-------------|
| `CREATE_INVOICE` | Creates invoice in Wave | Wave API |
| `CREATE_STRIPE_LINK` | Generates payment link | Stripe API |
| `SEND_INVOICE` | Sends email with PDF + link | GHL or Gmail API |
| `MARK_PAID` | Updates invoice as paid | Wave API |
| `SEND_RECEIPT` | Sends payment receipt | GHL or Gmail API |
| `STRIPE_WEBHOOK` | Receives payment notifications | Stripe Webhooks |

### n8n WORKFLOW: CREATE_INVOICE
```json
{
  "name": "T6_Create_Invoice",
  "trigger": "webhook",
  "webhook_path": "/bloomie/create-invoice",
  "nodes": [
    {
      "type": "webhook",
      "name": "Receive Request"
    },
    {
      "type": "http_request",
      "name": "Create Wave Invoice",
      "method": "POST",
      "url": "https://gql.waveapps.com/graphql/public",
      "headers": {
        "Authorization": "Bearer {{WAVE_API_TOKEN}}"
      },
      "body": {
        "query": "mutation { invoiceCreate(input: { businessId: \"{{wave_business_id}}\", customerId: \"{{customer_wave_id}}\", items: [{ description: \"{{description}}\", quantity: {{quantity}}, unitPrice: \"{{unit_price}}\" }] }) { invoice { id pdfUrl viewUrl } } }"
      }
    },
    {
      "type": "respond_to_webhook",
      "name": "Return Invoice ID",
      "body": {
        "invoice_id": "={{$node['Create Wave Invoice'].json.data.invoiceCreate.invoice.id}}",
        "pdf_url": "={{$node['Create Wave Invoice'].json.data.invoiceCreate.invoice.pdfUrl}}"
      }
    }
  ]
}
```

### n8n WORKFLOW: STRIPE_PAYMENT_LINK
```json
{
  "name": "T6_Stripe_Payment_Link",
  "trigger": "webhook",
  "webhook_path": "/bloomie/create-payment-link",
  "nodes": [
    {
      "type": "webhook",
      "name": "Receive Request"
    },
    {
      "type": "http_request",
      "name": "Create Stripe Payment Link",
      "method": "POST",
      "url": "https://api.stripe.com/v1/payment_links",
      "headers": {
        "Authorization": "Bearer {{STRIPE_SECRET_KEY}}"
      },
      "body": {
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][unit_amount]": "{{amount_cents}}",
        "line_items[0][price_data][product_data][name]": "{{description}}",
        "line_items[0][quantity]": "1"
      }
    },
    {
      "type": "respond_to_webhook",
      "name": "Return Link",
      "body": {
        "payment_url": "={{$node['Create Stripe Payment Link'].json.url}}"
      }
    }
  ]
}
```

### DATABASE SCHEMA
```sql
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT,
  customer_name TEXT,
  customer_email TEXT,
  amount REAL,
  description TEXT,
  sent_date TEXT,
  due_date TEXT,
  paid_date TEXT,
  status TEXT DEFAULT 'draft',
  payment_link TEXT,
  stripe_payment_id TEXT,
  wave_invoice_id TEXT,
  reminders_sent INTEGER DEFAULT 0,
  last_reminder_date TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### OWNER COMMANDS

The owner can say:
- "Send invoice to [name] for $[amount] for [description]"
- "How much does [name] owe me?"
- "Show me all unpaid invoices"
- "What invoices are overdue?"
- "How much revenue came in this week/month?"
- "Resend invoice to [name]"
- "Mark [name]'s invoice as paid" (for cash/check payments)

### WEEKLY MONEY SUMMARY (Called by T26 KPI Tracking)

Every Monday morning, generate:
```
💰 WEEKLY MONEY SUMMARY — [Date Range]

Invoices Sent: [count] totaling $[amount]
Payments Received: [count] totaling $[amount]
Currently Outstanding: $[amount] across [count] invoices
Overdue: $[amount] across [count] invoices

⚡ Action Needed:
[List any invoices needing owner attention]
```

### CRON CONFIGURATION
```json
{
  "skill": "T6-invoicing",
  "schedules": [
    {
      "name": "overdue_check",
      "schedule": "0 9 * * *",
      "action": "check_overdue_invoices"
    },
    {
      "name": "weekly_summary",
      "schedule": "0 8 * * 1",
      "action": "generate_weekly_money_summary"
    }
  ]
}
```
