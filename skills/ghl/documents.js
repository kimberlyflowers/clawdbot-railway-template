/**
 * bloomie-ghl Documents Module
 * 
 * NOTE: GHL does not have a dedicated /documents/ REST endpoint.
 * Document/contract sending is handled through conversations/messages.
 * This module provides document-related helpers using available endpoints.
 */
const { client, locationId } = require('./config');

/**
 * Send document/file via conversation message
 * Uses the conversations/messages endpoint with attachment
 * @param {Object} opts
 * @param {string} opts.contactId - Contact ID
 * @param {string} opts.type - 'SMS' or 'Email'
 * @param {string} opts.message - Message text
 * @param {string} opts.subject - Email subject (for Email type)
 * @param {Array} opts.attachments - Array of attachment URLs
 */
async function sendDocument(opts) {
  try {
    if (!opts.contactId) throw new Error('contactId required');
    if (!opts.type) throw new Error('type required (SMS or Email)');
    if (!opts.message) throw new Error('message required');
    const { data } = await client.post('/conversations/messages', {
      ...opts,
      locationId
    });
    return { success: true, messageId: data.messageId || data.id, data };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

/**
 * List email templates (can be used as document templates)
 * Uses GET /emails/builder endpoint
 */
async function listTemplates() {
  try {
    const { data } = await client.get('/emails/builder', { params: { locationId } });
    const builders = data.builders || [];
    return { success: true, templates: builders, total: data.total };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

/**
 * Send template via email to contact
 * @param {Object} opts
 * @param {string} opts.contactId - Contact ID
 * @param {string} opts.templateId - Email template/builder ID
 * @param {string} opts.subject - Email subject
 * @param {string} opts.message - Fallback message text
 */
async function sendTemplate(opts) {
  try {
    if (!opts.contactId) throw new Error('contactId required');
    if (!opts.subject) throw new Error('subject required');
    const payload = {
      contactId: opts.contactId,
      type: 'Email',
      subject: opts.subject,
      message: opts.message || '',
      locationId
    };
    if (opts.templateId) payload.templateId = opts.templateId;
    if (opts.html) payload.html = opts.html;
    const { data } = await client.post('/conversations/messages', payload);
    return { success: true, messageId: data.messageId || data.id, data };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

module.exports = { sendDocument, listTemplates, sendTemplate };
