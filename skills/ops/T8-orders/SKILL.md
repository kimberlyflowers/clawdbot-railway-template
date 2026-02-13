# T8: PROCESS ORDERS, REFUNDS & RETURNS
## OpenClaw Skill — Bloomie Ops (Sales & Money)

### TRIGGER
- **Webhook:** New order from Shopify/WooCommerce/TikTok Shop/GHL
- **Manual:** User says "process order for [name]", "refund [name]", "handle return from [name]"
- **Cron:** Check for stuck/unshipped orders daily at 10 AM

### CONTEXT
You handle order fulfillment from purchase to delivery, and returns/refunds when needed. You keep the customer informed at every step and the owner aware of any issues. For {{business_name}}, speed and communication are the priorities — customers should never wonder where their order is.

### EXECUTION: NEW ORDER
```
1. RECEIVE ORDER (webhook or manual)
   Capture: customer name, email, items, quantities, amount, shipping address, payment status

2. VERIFY
   - Payment confirmed? (Stripe/Square webhook)
   - Items in stock? (check inventory)
   - Shipping address valid?
   
   IF payment NOT confirmed → Hold order, notify owner
   IF out of stock → Notify customer with timeline, notify owner
   IF address invalid → Contact customer to verify

3. CONFIRM TO CUSTOMER
   Send order confirmation email/SMS:
   "Thank you for your order! Here's what you ordered:
   [items list]
   Total: $[amount]
   We'll send tracking info as soon as it ships."

4. CREATE FULFILLMENT TASK
   Log order for fulfillment: {
     "order_id": "",
     "status": "confirmed",
     "items": [],
     "ship_by": "date",
     "customer": {},
     "special_instructions": ""
   }

5. SHIP (when owner marks as shipped OR auto-ship if configured)
   - Generate shipping label (if ShipStation/Pirate Ship connected)
   - Get tracking number
   - Update order status = "shipped"
   - Send tracking to customer:
     "Your order is on its way! Track it here: [tracking_link]"

6. DELIVERED
   - Track delivery confirmation
   - Update status = "delivered"
   - 3 days later: trigger T29 (review request) if customer hasn't complained

7. LOG EVERYTHING
   Store in orders database, update inventory counts, update accounting
```

### EXECUTION: RETURN REQUEST
```
1. RECEIVE REQUEST
   Customer contacts via DM/email/chat: "I want to return..."

2. CHECK POLICY
   - Within return window? (config.return_window_days)
   - Item eligible? (some items non-returnable)
   - Reason? (defective, wrong item, changed mind, other)
   
   IF eligible → Proceed
   IF not eligible → Explain policy kindly, offer alternatives
   IF edge case → Escalate to owner with context

3. SEND RETURN INSTRUCTIONS
   "We're sorry this didn't work out. Here's how to return:
   1. [Return instructions]
   2. Ship to: [return address]
   3. Please include your order number: [order_id]
   Expected refund processing: [X] business days after receipt."

4. RECEIVE RETURN
   Owner marks return as received
   - Inspect condition
   - DECISION: Acceptable? → Refund | Not acceptable? → Contact customer

5. PROCESS REFUND
   Call n8n webhook: PROCESS_REFUND
   - Stripe: refund to original payment method
   - Update Wave: record refund
   - Update order status = "refunded"
   - Send confirmation: "Your refund of $[amount] has been processed."
   - Notify owner: "↩️ Refund processed: $[amount] to [name]. Reason: [reason]"

6. LOG
   Record return reason for pattern analysis
```

### DAILY ORDER CHECK (Cron 10 AM)
```
Check for:
1. Orders confirmed but not shipped in > 2 days → Alert owner
2. Orders shipped but no delivery confirmation in > 7 days → Check tracking
3. Return requests pending > 3 days → Remind owner
4. Daily order summary to owner
```

### DATABASE SCHEMA
```sql
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT,
  customer_name TEXT,
  customer_email TEXT,
  items TEXT,
  subtotal REAL,
  tax REAL,
  shipping REAL,
  total REAL,
  status TEXT DEFAULT 'pending',
  payment_status TEXT,
  payment_id TEXT,
  shipping_address TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  shipped_date TEXT,
  delivered_date TEXT,
  return_requested INTEGER DEFAULT 0,
  return_reason TEXT,
  refund_amount REAL,
  refund_date TEXT,
  source TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### CONFIG
```json
{
  "return_window_days": 30,
  "non_returnable_items": [],
  "auto_ship": false,
  "ship_by_days": 2,
  "shipping_provider": "manual",
  "refund_method": "original_payment",
  "order_confirmation_channel": "email",
  "owner_notification_channel": "telegram"
}
```
