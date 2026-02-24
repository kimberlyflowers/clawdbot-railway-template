#!/usr/bin/env node

/**
 * GHL Text Contact Script
 * 
 * Usage: node send-text.js <recipient-name-or-phone> "<message-text>"
 * 
 * Examples:
 *   node send-text.js "John Doe" "Hey, can you call me later?"
 *   node send-text.js "+1234567890" "Meeting at 3pm"
 */

const fs = require('fs');
const path = require('path');

// Load GHL module from workspace
const ghl = require('/data/workspace/ghl');

async function findOrCreateContact(nameOrPhone) {
  try {
    // First, try to find existing contact
    console.log(`Searching for contact: "${nameOrPhone}"`);
    
    const searchResult = await ghl.contacts.listContacts({
      query: nameOrPhone,
      limit: 10
    });

    if (searchResult.contacts && searchResult.contacts.length > 0) {
      console.log(`Found ${searchResult.contacts.length} contact(s)`);
      return searchResult.contacts[0]; // Return first match
    }

    // If no contact found, create one
    console.log(`No contact found. Creating new contact: "${nameOrPhone}"`);
    
    // Determine if input looks like a phone or a name
    const isPhone = /^[\d\-\+\(\)\s]{7,}$/.test(nameOrPhone);
    
    const contactData = isPhone
      ? { 
          phone: nameOrPhone.replace(/\s/g, ''),
          name: `Contact ${nameOrPhone}` 
        }
      : { 
          name: nameOrPhone,
          firstName: nameOrPhone.split(' ')[0],
          lastName: nameOrPhone.split(' ').slice(1).join(' ')
        };

    const newContact = await ghl.contacts.createContact(contactData);
    console.log(`Created contact: ${newContact.id}`);
    return newContact;

  } catch (err) {
    console.error('Error finding/creating contact:', err.message);
    throw err;
  }
}

async function sendText(contactId, message) {
  try {
    console.log(`Sending text to contact ${contactId}...`);
    
    const result = await ghl.messages.sendMessage({
      contactId: contactId,
      type: 'SMS',
      message: message
    });

    console.log('Text sent successfully!');
    return result;

  } catch (err) {
    console.error('Error sending text:', err.message);
    throw err;
  }
}

async function main() {
  const recipient = process.argv[2];
  const message = process.argv[3];

  if (!recipient || !message) {
    console.error('Usage: node send-text.js <recipient-name-or-phone> "<message>"');
    process.exit(1);
  }

  try {
    const contact = await findOrCreateContact(recipient);
    await sendText(contact.id, message);
    console.log('\n✓ Done');
  } catch (err) {
    console.error('\n✗ Failed:', err.message);
    process.exit(1);
  }
}

main();
