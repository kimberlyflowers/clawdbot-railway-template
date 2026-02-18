/**
 * bloomie-ghl Contacts Module
 * Endpoints: GET /contacts/, GET /contacts/{id}, POST /contacts/, PUT /contacts/{id}, DELETE /contacts/{id}
 */
const { client, locationId } = require('./config');

async function listContacts(options = {}) {
  try {
    const params = { locationId, limit: options.limit || 100 };
    if (options.query) params.query = options.query;
    const { data } = await client.get('/contacts/', { params });
    return { success: true, contacts: data.contacts || [], meta: data.meta };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

async function getContact(contactId) {
  try {
    if (!contactId) throw new Error('contactId required');
    const { data } = await client.get(`/contacts/${contactId}`);
    return { success: true, contact: data.contact || data };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

async function createContact(contactData) {
  try {
    if (!contactData.firstName && !contactData.email && !contactData.phone)
      throw new Error('At least firstName, email, or phone required');
    const { data } = await client.post('/contacts/', { ...contactData, locationId });
    return { success: true, contact: data.contact || data };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

async function updateContact(contactId, updates) {
  try {
    if (!contactId) throw new Error('contactId required');
    const { data } = await client.put(`/contacts/${contactId}`, updates);
    return { success: true, contact: data.contact || data };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

async function deleteContact(contactId) {
  try {
    if (!contactId) throw new Error('contactId required');
    await client.delete(`/contacts/${contactId}`);
    return { success: true, message: `Contact ${contactId} deleted` };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

module.exports = { listContacts, getContact, createContact, updateContact, deleteContact };
