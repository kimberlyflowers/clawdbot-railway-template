/**
 * bloomie-ghl Conversations Module
 * Endpoints: GET /conversations/search, GET /conversations/{id}, POST /conversations/
 */
const { client, locationId } = require('./config');

async function listConversations(options = {}) {
  try {
    const params = { locationId };
    if (options.contactId) params.contactId = options.contactId;
    const { data } = await client.get('/conversations/search', { params });
    return { success: true, conversations: data.conversations || [], total: data.total || 0 };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

async function getConversation(conversationId) {
  try {
    if (!conversationId) throw new Error('conversationId required');
    const { data } = await client.get(`/conversations/${conversationId}`);
    return { success: true, conversation: data };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

async function createConversation(contactId) {
  try {
    if (!contactId) throw new Error('contactId required');
    const { data } = await client.post('/conversations/', { locationId, contactId });
    return { success: true, conversationId: data.conversationId, message: data.message };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

module.exports = { listConversations, getConversation, createConversation };
