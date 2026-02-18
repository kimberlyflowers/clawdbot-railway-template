/**
 * bloomie-ghl Calendars Module
 * Endpoints: GET /calendars/, GET /calendars/{id}/free-slots
 */
const { client, locationId } = require('./config');

/**
 * List all calendars
 */
async function listCalendars() {
  try {
    const { data } = await client.get('/calendars/', { params: { locationId } });
    return { success: true, calendars: data.calendars || [] };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

/**
 * Get free slots for a calendar
 * @param {string} calendarId - Calendar ID
 * @param {string|number} startDate - Start date (YYYY-MM-DD string or epoch ms)
 * @param {string|number} endDate - End date (YYYY-MM-DD string or epoch ms)
 * @param {Object} options
 * @param {string} options.timezone - Timezone (e.g. 'America/New_York')
 * @param {string} options.userId - Filter by user
 */
async function getFreeSlots(calendarId, startDate, endDate, options = {}) {
  try {
    if (!calendarId) throw new Error('calendarId required');
    if (!startDate || !endDate) throw new Error('startDate and endDate required');
    // Convert date strings to epoch ms if needed
    const toEpoch = (d) => typeof d === 'number' ? d : new Date(d).getTime();
    const params = { startDate: toEpoch(startDate), endDate: toEpoch(endDate) };
    if (options.timezone) params.timezone = options.timezone;
    if (options.userId) params.userId = options.userId;
    const { data } = await client.get(`/calendars/${calendarId}/free-slots`, { params });
    return { success: true, slots: data };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

/**
 * Book appointment (via POST /calendars/events/appointments)
 */
async function bookAppointment(calendarId, appointmentData) {
  try {
    if (!calendarId) throw new Error('calendarId required');
    if (!appointmentData.contactId) throw new Error('contactId required');
    if (!appointmentData.startTime) throw new Error('startTime required');
    const { data } = await client.post('/calendars/events/appointments', {
      calendarId,
      locationId,
      ...appointmentData
    });
    return { success: true, appointment: data };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

module.exports = { listCalendars, getFreeSlots, bookAppointment };
