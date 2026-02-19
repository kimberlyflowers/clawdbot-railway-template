const fs = require('fs');
const https = require('https');
const { URL } = require('url');

// Load API token
const GHL_TOKEN = fs.readFileSync('/data/secrets/ghl-token.txt', 'utf8').trim();
const API_BASE = 'https://rest.gohighlevel.com';
const LOCATION_ID = 'iGy4nrpDVU0W1jAvseL3';

/**
 * Make HTTP request to GHL API
 */
const apiRequest = async (method, endpoint, body = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${endpoint}`);
    
    const timeout = setTimeout(() => {
      reject(new Error('API request timeout (30s)'));
    }, 30000);
    
    const options = {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GHL_TOKEN}`
      },
      timeout: 30000
    };
    
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        clearTimeout(timeout);
        try {
          const result = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(result);
          } else {
            reject(new Error(result.error?.message || `HTTP ${res.statusCode}`));
          }
        } catch (err) {
          reject(new Error(`Parse error: ${err.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    
    req.on('timeout', () => {
      clearTimeout(timeout);
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
};

// ==================== CONTACTS ====================

const contacts = {
  listContacts: async (limit = 100) => {
    try {
      const result = await apiRequest('GET', `/v1/contacts/?locationId=${LOCATION_ID}&limit=${limit}`);
      return { success: true, contacts: result.contacts || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getContact: async (contactId) => {
    try {
      const result = await apiRequest('GET', `/v1/contacts/${contactId}`);
      return { success: true, contact: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  createContact: async (contactData) => {
    try {
      const result = await apiRequest('POST', `/v1/contacts/`, {
        locationId: LOCATION_ID,
        ...contactData
      });
      return { success: true, contact: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updateContact: async (contactId, contactData) => {
    try {
      const result = await apiRequest('PUT', `/v1/contacts/${contactId}`, contactData);
      return { success: true, contact: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  deleteContact: async (contactId) => {
    try {
      await apiRequest('DELETE', `/v1/contacts/${contactId}`);
      return { success: true, message: 'Contact deleted' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// ==================== CONVERSATIONS ====================

const conversations = {
  listConversations: async () => {
    try {
      const result = await apiRequest('GET', `/v1/conversations/search?locationId=${LOCATION_ID}`);
      return { success: true, conversations: result.conversations || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getConversation: async (conversationId) => {
    try {
      const result = await apiRequest('GET', `/v1/conversations/${conversationId}`);
      return { success: true, conversation: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  createConversation: async (conversationData) => {
    try {
      const result = await apiRequest('POST', `/v1/conversations/`, {
        locationId: LOCATION_ID,
        ...conversationData
      });
      return { success: true, conversation: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// ==================== MESSAGES ====================

const messages = {
  sendMessage: async (messageData) => {
    try {
      const result = await apiRequest('POST', `/v1/conversations/messages`, {
        locationId: LOCATION_ID,
        ...messageData
      });
      return { success: true, message: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getMessages: async (conversationId) => {
    try {
      const result = await apiRequest('GET', `/v1/conversations/${conversationId}/messages`);
      return { success: true, messages: result.messages || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getHistory: async (conversationId, limit = 50) => {
    try {
      const result = await apiRequest('GET', `/v1/conversations/${conversationId}/messages?limit=${limit}`);
      return { success: true, messages: result.messages || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// ==================== CALENDARS ====================

const calendars = {
  listCalendars: async () => {
    try {
      const result = await apiRequest('GET', `/v1/calendars/?locationId=${LOCATION_ID}`);
      return { success: true, calendars: result.calendars || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getFreeSlots: async (calendarId, date) => {
    try {
      const result = await apiRequest('GET', `/v1/calendars/${calendarId}/availability?date=${date}`);
      return { success: true, slots: result.slots || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  bookAppointment: async (appointmentData) => {
    try {
      const result = await apiRequest('POST', `/v1/calendars/appointments`, {
        locationId: LOCATION_ID,
        ...appointmentData
      });
      return { success: true, appointment: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// ==================== FUNNELS ====================

const funnels = {
  listFunnels: async () => {
    try {
      const result = await apiRequest('GET', `/v1/funnels/funnel/list?locationId=${LOCATION_ID}`);
      return { success: true, funnels: result.funnels || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getFunnel: async (funnelId) => {
    try {
      const result = await apiRequest('GET', `/v1/funnels/${funnelId}`);
      return { success: true, funnel: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  listPages: async (funnelId) => {
    try {
      const result = await apiRequest('GET', `/v1/funnels/${funnelId}/pages`);
      return { success: true, pages: result.pages || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getPageDetails: async (funnelId, pageId) => {
    try {
      const result = await apiRequest('GET', `/v1/funnels/${funnelId}/pages/${pageId}`);
      return { success: true, page: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// ==================== DOCUMENTS ====================

const documents = {
  sendDocument: async (documentData) => {
    try {
      const result = await apiRequest('POST', `/v1/emails/send`, {
        locationId: LOCATION_ID,
        ...documentData
      });
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  listTemplates: async () => {
    try {
      const result = await apiRequest('GET', `/v1/emails/builder?locationId=${LOCATION_ID}`);
      return { success: true, templates: result.templates || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  sendTemplate: async (templateData) => {
    try {
      const result = await apiRequest('POST', `/v1/emails/send`, {
        locationId: LOCATION_ID,
        ...templateData
      });
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// ==================== EMAIL ====================

const email = {
  send: async (emailData) => {
    try {
      const result = await apiRequest('POST', `/v1/conversations/messages`, {
        locationId: LOCATION_ID,
        type: 'EMAIL',
        ...emailData
      });
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  listTemplates: async () => {
    try {
      const result = await apiRequest('GET', `/v1/emails/builder?locationId=${LOCATION_ID}`);
      return { success: true, templates: result.templates || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  create: async (emailData) => {
    try {
      const result = await apiRequest('POST', `/v1/emails/`, {
        locationId: LOCATION_ID,
        ...emailData
      });
      return { success: true, email: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  update: async (emailId, emailData) => {
    try {
      const result = await apiRequest('PUT', `/v1/emails/${emailId}`, emailData);
      return { success: true, email: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Export all modules
module.exports = {
  contacts,
  conversations,
  messages,
  calendars,
  funnels,
  documents,
  email
};
