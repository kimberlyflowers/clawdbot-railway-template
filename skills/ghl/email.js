/**
 * bloomie-ghl Email Module
 * Endpoints: POST /conversations/messages (type=Email), GET /emails/builder
 */
const { client, locationId } = require('./config');

/**
 * Send email to contact
 * @param {Object} opts
 * @param {string} opts.contactId - Contact ID
 * @param {string} opts.subject - Email subject
 * @param {string} opts.message - Plain text body
 * @param {string} opts.html - HTML body (optional)
 * @param {Array} opts.attachments - Attachment URLs (optional)
 */
async function sendEmail(opts) {
  try {
    if (!opts.contactId) throw new Error('contactId required');
    if (!opts.subject) throw new Error('subject required');
    if (!opts.message && !opts.html) throw new Error('message or html required');
    const payload = {
      contactId: opts.contactId,
      type: 'Email',
      subject: opts.subject,
      message: opts.message || '',
      locationId
    };
    if (opts.html) payload.html = opts.html;
    if (opts.attachments) payload.attachments = opts.attachments;
    const { data } = await client.post('/conversations/messages', payload);
    return { success: true, messageId: data.messageId || data.id, data };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

/**
 * List email templates/builders
 */
async function listEmailTemplates() {
  try {
    const { data } = await client.get('/emails/builder', { params: { locationId } });
    return { success: true, templates: data.builders || [], total: data.total };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

/**
 * Create email template
 * @param {Object} templateData
 * @param {string} templateData.title - Template name
 * @param {string} templateData.html - Template HTML content
 */
async function createTemplate(templateData) {
  try {
    if (!templateData.title) throw new Error('title required');
    const { data } = await client.post('/emails/builder', {
      ...templateData,
      locationId
    });
    return { success: true, template: data };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

/**
 * Update email template
 */
async function updateTemplate(templateId, updates) {
  try {
    if (!templateId) throw new Error('templateId required');
    const { data } = await client.put(`/emails/builder/${templateId}`, {
      ...updates,
      locationId
    });
    return { success: true, template: data };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

/**
 * List email schedules (conversations with pending email messages)
 * Uses conversations search filtered by email type
 */
async function listEmailSchedules() {
  try {
    const { data } = await client.get('/conversations/search', {
      params: { locationId, type: 'TYPE_EMAIL' }
    });
    return { success: true, conversations: data.conversations || [], total: data.total || 0 };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

module.exports = { sendEmail, listEmailTemplates, createTemplate, updateTemplate, listEmailSchedules };
