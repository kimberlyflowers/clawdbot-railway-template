---
name: ghl-text-contact
description: Send text messages to contacts via GHL. When the user says "text me", "text [name]", or "send a text to [name]", find the contact in GHL or create one if it doesn't exist, then send the SMS message. Use for: (1) Texting known contacts by name, (2) Texting by phone number, (3) Auto-creating new contacts when needed.
---

# GHL Text Contact Skill

Send SMS messages through GoHighLevel directly via API. Automatically finds contacts by name or phone, creates new ones if needed, and sends texts.

## Workflow

When the user says something like:
- "text me a reminder about the meeting"
- "text John that I'm running late"
- "send SMS to +1-555-1234"

Follow this process:

1. **Parse the request** - Extract:
   - Recipient (name or phone number)
   - Message text

2. **Find or create the contact**:
   ```javascript
   const ghl = require('/data/workspace/ghl');
   
   // Try to find existing contact
   const contacts = await ghl.contacts.listContacts({ limit: 50 });
   let contact = contacts.contacts.find(c => 
     c.name?.toLowerCase().includes(recipient.toLowerCase()) ||
     c.phone?.includes(recipient)
   );
   
   // If not found, create new contact
   if (!contact) {
     contact = await ghl.contacts.createContact({
       name: recipient,
       phone: recipient  // API will parse phone numbers
     });
   }
   ```

3. **Send the SMS**:
   ```javascript
   await ghl.messages.sendMessage({
     contactId: contact.id,
     type: 'SMS',
     message: message
   });
   ```

4. **Confirm** - Report back what was sent and to whom

## API Reference

- **Find contacts**: `ghl.contacts.listContacts()`
- **Create contact**: `ghl.contacts.createContact({ name, phone, email, etc })`
- **Send SMS**: `ghl.messages.sendMessage({ contactId, type: 'SMS', message })`

See TOOLS.md for full GHL module documentation.

## When to Use

- User says: "text me", "text [name]", "send a text", "SMS"
- You need to send an SMS through GHL
- You need to find a contact or create one on the fly
