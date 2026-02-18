/**
 * bloomie-ghl Messages Module
 * Endpoints: POST /conversations/messages, GET /conversations/{id}/messages
 */
const { client, locationId } = require('./config');

/**
 * Send message (SMS or Email)
 * @param {Object} opts
 * @param {string} opts.contactId - Contact ID
 * @param {string} opts.type - 'SMS', 'Email', 'WhatsApp', etc.
 * @param {string} opts.message - Message body
 * @param {string} opts.subject - Email subject (required for Email type)
 * @param {string} opts.html - HTML body for email (optional)
 */
async function sendMessage(opts) {
  try {
    if (!opts.contactId) throw new Error('contactId required');
    if (!opts.type) throw new Error('type required (SMS, Email, WhatsApp, etc.)');
    if (!opts.message) throw new Error('message required');
    const { data } = await client.post('/conversations/messages', opts);
    return { success: true, messageId: data.messageId || data.id, data };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

/**
 * Get messages from a conversation
 */
async function getMessages(conversationId, options = {}) {
  try {
    if (!conversationId) throw new Error('conversationId required');
    const params = { locationId };
    if (options.limit) params.limit = options.limit;
    const { data } = await client.get(`/conversations/${conversationId}/messages`, { params });
    const msgs = data.messages?.messages || data.messages || [];
    const lastId = data.messages?.lastMessageId || null;
    const nextPage = data.messages?.nextPage || false;
    return { success: true, messages: msgs, lastMessageId: lastId, nextPage };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

/**
 * Get full conversation history (conversation details + messages)
 */
async function getConversationHistory(conversationId, options = {}) {
  try {
    if (!conversationId) throw new Error('conversationId required');
    const [convResult, msgsResult] = await Promise.all([
      client.get(`/conversations/${conversationId}`),
      client.get(`/conversations/${conversationId}/messages`, { params: { locationId } })
    ]);
    const msgs = msgsResult.data.messages?.messages || msgsResult.data.messages || [];
    return {
      success: true,
      conversation: convResult.data,
      messages: msgs,
      totalMessages: msgs.length
    };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

module.exports = { sendMessage, getMessages, getConversationHistory };
