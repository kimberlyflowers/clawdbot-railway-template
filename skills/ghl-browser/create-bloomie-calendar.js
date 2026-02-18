/**
 * Bloomie Calendar & Booking Setup
 * Creates calendar integration and appointment booking system in GHL
 * 
 * Usage: node create-bloomie-calendar.js
 * Prerequisites: Valid GHL session + GHL API token
 */

const fs = require('fs');
const path = require('path');

const GHL_TOKEN = fs.readFileSync('/data/secrets/ghl-token.txt', 'utf8').trim();
const LOCATION_ID = 'iGy4nrpDVU0W1jAvseL3';
const API_BASE = 'https://services.leadconnectorhq.com/services/api/v1';

/**
 * Get all calendars for the location
 */
async function getCalendars() {
  console.log('📅 Fetching available calendars...\n');

  const response = await fetch(`${API_BASE}/calendars/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${GHL_TOKEN}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  const data = await response.json();
  const calendars = data.calendars || [];

  if (calendars.length === 0) {
    console.log('No calendars found. You may need to create one in GHL dashboard first.');
    return [];
  }

  console.log(`✓ Found ${calendars.length} calendar(s):\n`);
  calendars.forEach((cal, i) => {
    console.log(`${i + 1}. ${cal.name || 'Unnamed'}`);
    console.log(`   ID: ${cal._id || cal.id}`);
    if (cal.email) console.log(`   Email: ${cal.email}`);
    if (cal.timezone) console.log(`   Timezone: ${cal.timezone}`);
    console.log();
  });

  return calendars;
}

/**
 * Get availability slots for a calendar
 */
async function getAvailabilitySlots(calendarId) {
  console.log(`🔍 Checking availability for calendar ${calendarId}...\n`);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startDate = tomorrow.toISOString().split('T')[0];

  const response = await fetch(`${API_BASE}/calendars/getFreeSlots`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${GHL_TOKEN}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    console.log('⚠️  Could not fetch free slots. Calendar may not be configured.');
    return null;
  }

  const data = await response.json();
  console.log('✓ Free slots available');
  return data;
}

/**
 * Create a test appointment
 */
async function bookTestAppointment(calendarId, contact = {}) {
  console.log('📝 Creating test appointment...\n');

  const defaultContact = {
    firstName: 'Test',
    lastName: 'Prospect',
    email: 'test@bloomie.ai',
    phone: '+1 (555) 000-0000',
    ...contact,
  };

  const payload = {
    calendarId,
    contactId: defaultContact.email, // Use email as ID for this test
    startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    title: 'Bloomie AI Employee Demo',
    description: 'Test appointment for Bloomie sales funnel',
    ...defaultContact,
  };

  const response = await fetch(`${API_BASE}/calendars/bookAppointment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GHL_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.log(`⚠️  Booking failed: ${response.statusText}`);
    return null;
  }

  const data = await response.json();
  console.log('✓ Appointment created');
  return data;
}

/**
 * Display calendar integration instructions
 */
async function showIntegrationGuide() {
  console.log('\n' + '='.repeat(70));
  console.log('📅 BLOOMIE CALENDAR INTEGRATION GUIDE');
  console.log('='.repeat(70));

  console.log(`
✅ WHAT TO DO NEXT:

1. **Add Calendar to GHL:**
   - Go to: https://app.gohighlevel.com/
   - Navigate: Calendars (or Settings → Calendar)
   - Connect your calendar (Google Calendar, Outlook, etc.)

2. **Set Availability:**
   - Set your booking hours (e.g., Mon-Fri 9am-5pm)
   - Set appointment duration (recommended: 30 min for calls)
   - Set timezone

3. **Add to Bloomie Page:**
   - On the Bloomie funnel page, add a "Book a Call" button
   - Link to your calendar booking URL:
     https://app.gohighlevel.com/calendars/[YOUR-CALENDAR-ID]
   
4. **Test:**
   - Click your "Book a Call" button
   - Schedule a test appointment
   - Verify it appears in your GHL calendar

5. **Integrate with Follow-Up:**
   - When appointment is booked, trigger follow-up automation
   - Send confirmation email with meeting link
   - Set reminder 24 hours before call

📞 CALL AUTOMATION READY:
   Your AI employee will now:
   - Make 150+ outbound calls daily
   - Book qualified prospects into YOUR calendar
   - Send confirmation & reminder emails
   - Track all meetings in GHL

='.repeat(70));

  console.log('\n💡 TIP: Configure "Redirect after booking" to send prospects to:');
  console.log('   - Thank you page');
  console.log('   - PDF download (lead magnet)');
  console.log('   - Email sequence start');
}

/**
 * MAIN EXECUTION
 */
(async () => {
  console.log('🌸 Bloomie Calendar Setup for GHL');
  console.log('='.repeat(70) + '\n');

  try {
    // Get available calendars
    const calendars = await getCalendars();

    if (calendars.length === 0) {
      console.log('⚠️  No calendars configured yet.');
      console.log('\n📝 Quick Setup:');
      console.log('   1. Go to GHL Settings → Calendars');
      console.log('   2. Connect your calendar (Google, Outlook, etc.)');
      console.log('   3. Set your availability');
      console.log('   4. Run this script again\n');
      process.exit(0);
    }

    // Use first calendar for test
    const primaryCalendar = calendars[0];
    const calendarId = primaryCalendar._id || primaryCalendar.id;

    console.log(`📌 Using calendar: ${primaryCalendar.name || 'Primary'}\n`);

    // Get availability
    await getAvailabilitySlots(calendarId);

    // Book test appointment
    const testAppt = await bookTestAppointment(calendarId, {
      firstName: 'Bloomie',
      lastName: 'Demo',
      email: 'demo@bloomie.ai',
    });

    if (testAppt) {
      console.log(`\n✅ Test Appointment Created:`);
      console.log(`   ID: ${testAppt.id || 'N/A'}`);
      console.log(`   Status: ${testAppt.status || 'pending'}`);
    }

    // Show integration guide
    await showIntegrationGuide();

    console.log('\n✅ Calendar setup complete!\n');
    console.log('📊 Next Steps:');
    console.log('   1. Test booking from your Bloomie funnel page');
    console.log('   2. Set up follow-up automation in GHL');
    console.log('   3. Configure AI employee to book into this calendar');
    console.log('   4. Monitor your calendar for inbound bookings\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
})();
