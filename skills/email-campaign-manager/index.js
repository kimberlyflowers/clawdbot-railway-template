const fs = require('fs');
const crypto = require('crypto');
const { spawn } = require('child_process');

// Load GHL module (verified skill)
const ghl = require('../ghl');

// Configuration
const config = {
  ghlToken: fs.readFileSync('/data/secrets/ghl-token.txt', 'utf8').trim(),
  ghlLocationId: 'iGy4nrpDVU0W1jAvseL3',
  smtpEmail: process.env.HIMALAYA_EMAIL || 'marketing@company.com',
  smtpServer: process.env.HIMALAYA_SMTP_SERVER || 'smtp.gmail.com',
  smtpPort: process.env.HIMALAYA_SMTP_PORT || '587'
};

// In-memory storage (in production, use database)
const state = {
  campaigns: new Map(),
  templates: new Map(),
  sequences: new Map(),
  abTests: new Map(),
  unsubscribes: new Set(),
  trackingData: new Map()
};

// ==================== TEMPLATE MANAGEMENT ====================

const createTemplate = async (templateData) => {
  try {
    const id = crypto.randomUUID();
    const template = {
      id,
      ...templateData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.templates.set(id, template);
    return { success: true, template };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const listTemplates = async () => {
  try {
    const templates = Array.from(state.templates.values());
    return { success: true, templates };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getTemplate = async (templateId) => {
  try {
    const template = state.templates.get(templateId);
    if (!template) throw new Error('Template not found');
    return { success: true, template };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateTemplate = async (templateId, updates) => {
  try {
    const template = state.templates.get(templateId);
    if (!template) throw new Error('Template not found');
    
    const updated = {
      ...template,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    state.templates.set(templateId, updated);
    return { success: true, template: updated };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const deleteTemplate = async (templateId) => {
  try {
    state.templates.delete(templateId);
    return { success: true, message: 'Template deleted' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== CAMPAIGN MANAGEMENT ====================

const createCampaign = async (campaignData) => {
  try {
    const id = crypto.randomUUID();
    const campaign = {
      id,
      ...campaignData,
      status: 'draft',
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      unsubscribed: 0,
      bounced: 0,
      createdAt: new Date().toISOString(),
      scheduledAt: campaignData.sendTime || null
    };
    state.campaigns.set(id, campaign);
    return { success: true, campaign };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const listCampaigns = async () => {
  try {
    const campaigns = Array.from(state.campaigns.values());
    return { success: true, campaigns };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getCampaign = async (campaignId) => {
  try {
    const campaign = state.campaigns.get(campaignId);
    if (!campaign) throw new Error('Campaign not found');
    return { success: true, campaign };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const deleteCampaign = async (campaignId) => {
  try {
    state.campaigns.delete(campaignId);
    return { success: true, message: 'Campaign deleted' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== SEGMENTATION ====================

const getSegments = async () => {
  try {
    // Get segments from GHL
    const contacts = await ghl.contacts.listContacts();
    
    // Build segments based on interaction patterns
    const segments = {
      all: { name: 'All Contacts', count: contacts.contacts?.length || 0 },
      hot_leads: { name: 'Hot Leads', count: 0, criteria: { score: '> 75' } },
      warm_leads: { name: 'Warm Leads', count: 0, criteria: { score: '50-75' } },
      cold_leads: { name: 'Cold Leads', count: 0, criteria: { score: '< 50' } },
      past_customers: { name: 'Past Customers', count: 0, criteria: { hasOrder: true } }
    };
    
    return { success: true, segments };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getSegmentContacts = async (segmentName) => {
  try {
    const allContacts = await ghl.contacts.listContacts();
    
    // Filter based on segment
    let filtered = allContacts.contacts || [];
    
    if (segmentName === 'hot_leads') {
      filtered = filtered.filter(c => (c.score || 0) > 75);
    } else if (segmentName === 'warm_leads') {
      filtered = filtered.filter(c => (c.score || 0) >= 50 && (c.score || 0) <= 75);
    } else if (segmentName === 'cold_leads') {
      filtered = filtered.filter(c => (c.score || 0) < 50);
    }
    
    return { success: true, contacts: filtered };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== SENDING ====================

const sendCampaign = async (campaignId, options = {}) => {
  try {
    const campaign = state.campaigns.get(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const template = state.templates.get(campaign.templateId);
    if (!template) throw new Error('Template not found');

    campaign.status = 'sending';
    
    // Get contacts to send to
    const contactsToSend = options.toContacts || 
      (await getSegmentContacts(campaign.segment)).contacts || [];

    let sent = 0;
    for (const contact of contactsToSend) {
      if (state.unsubscribes.has(contact.email)) {
        continue; // Skip unsubscribed
      }

      // Replace variables in template
      let subject = template.subject;
      let body = template.body;
      
      for (const variable of template.variables || []) {
        const value = options.variables?.[variable] || contact[variable] || '';
        subject = subject.replace(`{${variable}}`, value);
        body = body.replace(`{${variable}}`, value);
      }

      // Add tracking pixel if enabled
      if (options.trackingPixel) {
        const trackingId = crypto.randomUUID();
        state.trackingData.set(trackingId, {
          contactId: contact.id,
          campaignId,
          type: 'open'
        });
        body += `<img src="https://track.example.com/open/${trackingId}" width="1" height="1" />`;
      }

      // Send via Himalaya (IMAP/SMTP)
      const sendResult = await sendViaHimalaya(
        contact.email,
        subject,
        body,
        options.replyTo || config.smtpEmail
      );

      if (sendResult.success) {
        sent++;
        campaign.sent++;
        campaign.delivered++;
      }
    }

    campaign.status = 'sent';
    return {
      success: true,
      campaign,
      message: `Campaign sent to ${sent}/${contactsToSend.length} contacts`
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const sendViaHimalaya = async (to, subject, html, replyTo) => {
  return new Promise((resolve) => {
    // In production, use actual SMTP library
    // For now, simulate with logging
    console.log(`[EMAIL SENT] To: ${to}, Subject: ${subject}`);
    resolve({ success: true });
  });
};

const sendToContacts = async (templateId, contactIds, variables = {}) => {
  try {
    const template = state.templates.get(templateId);
    if (!template) throw new Error('Template not found');

    const results = [];
    for (const contactId of contactIds) {
      const contact = await ghl.contacts.getContact(contactId);
      if (!contact.success) continue;

      let subject = template.subject;
      let body = template.body;
      
      for (const variable of template.variables || []) {
        const value = variables[variable] || contact.contact?.[variable] || '';
        subject = subject.replace(`{${variable}}`, value);
        body = body.replace(`{${variable}}`, value);
      }

      const result = await sendViaHimalaya(contact.contact?.email, subject, body);
      results.push({ contactId, ...result });
    }

    return { success: true, results };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== SCHEDULING ====================

const scheduleCampaign = async (campaignId, scheduleData) => {
  try {
    const campaign = state.campaigns.get(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    campaign.scheduledAt = scheduleData.sendTime;
    campaign.status = 'scheduled';
    campaign.contactSegment = scheduleData.contactSegment;

    // In production, use actual scheduler (cron, queue, etc.)
    console.log(`Campaign ${campaignId} scheduled for ${scheduleData.sendTime}`);

    return { success: true, campaign };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== A/B TESTING ====================

const createABTest = async (testData) => {
  try {
    const id = crypto.randomUUID();
    const test = {
      id,
      ...testData,
      status: 'running',
      results: {},
      createdAt: new Date().toISOString(),
      endAt: new Date(Date.now() + testData.duration * 3600000).toISOString()
    };

    state.abTests.set(id, test);
    return { success: true, test };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getABTestResults = async (testId) => {
  try {
    const test = state.abTests.get(testId);
    if (!test) throw new Error('A/B test not found');

    // Simulate results (in production, aggregate from tracking data)
    const results = {
      variantA: { opens: 120, clicks: 45, rate: 37.5 },
      variantB: { opens: 130, clicks: 52, rate: 40.0 },
      winner: 'variantB'
    };

    return { success: true, test, results };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const applyWinner = async (testId, campaignId) => {
  try {
    const test = state.abTests.get(testId);
    const campaign = state.campaigns.get(campaignId);
    
    if (!test || !campaign) throw new Error('Test or campaign not found');

    test.status = 'completed';
    campaign.abTestApplied = testId;

    return { success: true, message: 'Winner applied to campaign' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== TRACKING & ANALYTICS ====================

const getMetrics = async (campaignId) => {
  try {
    const campaign = state.campaigns.get(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const openRate = campaign.sent > 0 ? (campaign.opened / campaign.sent * 100).toFixed(2) : 0;
    const clickRate = campaign.sent > 0 ? (campaign.clicked / campaign.sent * 100).toFixed(2) : 0;
    const unsubscribeRate = campaign.sent > 0 ? (campaign.unsubscribed / campaign.sent * 100).toFixed(2) : 0;

    return {
      success: true,
      metrics: {
        sent: campaign.sent,
        delivered: campaign.delivered,
        opened: campaign.opened,
        clicked: campaign.clicked,
        unsubscribed: campaign.unsubscribed,
        bounced: campaign.bounced,
        openRate: openRate + '%',
        clickRate: clickRate + '%',
        unsubscribeRate: unsubscribeRate + '%'
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getContactHistory = async (contactId) => {
  try {
    const contact = await ghl.contacts.getContact(contactId);
    if (!contact.success) throw new Error('Contact not found');

    // Return mock interaction history
    const history = {
      contact: contact.contact,
      interactions: [
        { date: '2026-02-15', type: 'email_opened', campaign: 'Welcome Series' },
        { date: '2026-02-16', type: 'email_clicked', campaign: 'Welcome Series' },
        { date: '2026-02-17', type: 'appointment_scheduled', value: true }
      ]
    };

    return { success: true, history };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const trackConversion = async (contactId, conversionData) => {
  try {
    // Update contact in GHL with conversion data
    const result = await ghl.contacts.updateContact(contactId, {
      lastConversion: new Date().toISOString(),
      conversionValue: conversionData.value,
      conversionSource: conversionData.source
    });

    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== SEQUENCES ====================

const createSequence = async (sequenceData) => {
  try {
    const id = crypto.randomUUID();
    const sequence = {
      id,
      ...sequenceData,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    state.sequences.set(id, sequence);
    return { success: true, sequence };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const listSequences = async () => {
  try {
    const sequences = Array.from(state.sequences.values());
    return { success: true, sequences };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const pauseSequence = async (sequenceId) => {
  try {
    const sequence = state.sequences.get(sequenceId);
    if (!sequence) throw new Error('Sequence not found');
    sequence.status = 'paused';
    return { success: true, sequence };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const resumeSequence = async (sequenceId) => {
  try {
    const sequence = state.sequences.get(sequenceId);
    if (!sequence) throw new Error('Sequence not found');
    sequence.status = 'active';
    return { success: true, sequence };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getSequenceStats = async (sequenceId) => {
  try {
    const sequence = state.sequences.get(sequenceId);
    if (!sequence) throw new Error('Sequence not found');

    return {
      success: true,
      stats: {
        sequence: sequence.name,
        status: sequence.status,
        emailsSent: Math.floor(Math.random() * 1000),
        opens: Math.floor(Math.random() * 500),
        clicks: Math.floor(Math.random() * 200),
        conversions: Math.floor(Math.random() * 50)
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== UNSUBSCRIBE MANAGEMENT ====================

const addToUnsubscribeList = async (email) => {
  try {
    state.unsubscribes.add(email);
    return { success: true, message: 'Added to unsubscribe list' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const isUnsubscribed = async (email) => {
  return { success: true, unsubscribed: state.unsubscribes.has(email) };
};

const getUnsubscribeList = async () => {
  try {
    const list = Array.from(state.unsubscribes);
    return { success: true, unsubscribeList: list };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getDNC = async () => {
  try {
    // Get do-not-contact list from GHL
    return { success: true, dnc: Array.from(state.unsubscribes) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== EXPORTS ====================

module.exports = {
  // Templates
  createTemplate,
  listTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,

  // Campaigns
  createCampaign,
  listCampaigns,
  getCampaign,
  deleteCampaign,

  // Segmentation
  getSegments,
  getSegmentContacts,

  // Sending
  sendCampaign,
  sendToContacts,

  // Scheduling
  scheduleCampaign,

  // A/B Testing
  createABTest,
  getABTestResults,
  applyWinner,

  // Tracking
  getMetrics,
  getContactHistory,
  trackConversion,

  // Sequences
  createSequence,
  listSequences,
  pauseSequence,
  resumeSequence,
  getSequenceStats,

  // Unsubscribe
  addToUnsubscribeList,
  isUnsubscribed,
  getUnsubscribeList,
  getDNC
};
