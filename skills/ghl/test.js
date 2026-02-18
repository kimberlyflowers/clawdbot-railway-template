/**
 * bloomie-ghl Full Module Test
 * Tests every module against the live GHL API
 */
const ghl = require('./index');

async function runTests() {
  let passed = 0;
  let failed = 0;

  async function test(label, fn) {
    try {
      const result = await fn();
      if (result.success) {
        passed++;
        console.log(`✅ ${label}`);
        return result;
      } else {
        failed++;
        console.log(`❌ ${label} — ${result.error} (${result.status || 'N/A'})`);
        if (result.details) console.log(`   Details: ${JSON.stringify(result.details).slice(0, 120)}`);
        return result;
      }
    } catch (e) {
      failed++;
      console.log(`❌ ${label} — ${e.message}`);
      return null;
    }
  }

  console.log('🧪 bloomie-ghl Full Module Test');
  console.log('=' .repeat(50));
  console.log('');

  // 1. Contacts
  console.log('📋 CONTACTS:');
  const contactsResult = await test('List contacts', () => ghl.contacts.listContacts());
  if (contactsResult?.contacts?.length > 0) {
    const cid = contactsResult.contacts[0].id;
    await test(`Get contact (${cid.slice(0,8)}...)`, () => ghl.contacts.getContact(cid));
  }
  console.log('');

  // 2. Conversations
  console.log('💬 CONVERSATIONS:');
  const convsResult = await test('List conversations', () => ghl.conversations.listConversations());
  if (convsResult?.conversations?.length > 0) {
    const convId = convsResult.conversations[0].id;
    await test(`Get conversation (${convId.slice(0,8)}...)`, () => ghl.conversations.getConversation(convId));
  }
  console.log('');

  // 3. Messages
  console.log('📨 MESSAGES:');
  if (convsResult?.conversations?.length > 0) {
    const convId = convsResult.conversations[0].id;
    await test(`Get messages (${convId.slice(0,8)}...)`, () => ghl.messages.getMessages(convId));
  }
  console.log('');

  // 4. Calendars
  console.log('📅 CALENDARS:');
  const calsResult = await test('List calendars', () => ghl.calendars.listCalendars());
  if (calsResult?.calendars?.length > 0) {
    const calId = calsResult.calendars[0].id;
    console.log(`   Found ${calsResult.calendars.length} calendars`);
    await test(`Get free slots (${calId.slice(0,8)}...)`, () =>
      ghl.calendars.getFreeSlots(calId, '2026-02-17', '2026-02-23'));
  }
  console.log('');

  // 5. Funnels
  console.log('🎯 FUNNELS:');
  const funnelsResult = await test('List funnels', () => ghl.funnels.listFunnels());
  if (funnelsResult?.funnels?.length > 0) {
    const fid = funnelsResult.funnels[0]._id;
    console.log(`   Found ${funnelsResult.count} funnels`);
    await test(`List pages (${fid.slice(0,8)}...)`, () => ghl.funnels.listPages(fid));
  }
  console.log('');

  // 6. Documents (templates)
  console.log('📄 DOCUMENTS:');
  await test('List templates', () => ghl.documents.listTemplates());
  console.log('');

  // 7. Email
  console.log('📧 EMAIL:');
  const emailResult = await test('List email templates', () => ghl.email.listEmailTemplates());
  if (emailResult?.templates?.length > 0) {
    console.log(`   Found ${emailResult.templates.length} templates`);
  }
  console.log('');

  // Summary
  console.log('=' .repeat(50));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  
  if (failed === 0) {
    console.log('🎉 All modules working!');
  } else {
    console.log(`⚠️  ${failed} test(s) need attention`);
  }
}

runTests().catch(console.error);
