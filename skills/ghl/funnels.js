/**
 * bloomie-ghl Funnels Module
 * Endpoints: GET /funnels/funnel/list, GET /funnels/page
 */
const { client, locationId } = require('./config');

/**
 * List all funnels
 */
async function listFunnels() {
  try {
    const { data } = await client.get('/funnels/funnel/list', { params: { locationId } });
    return { success: true, funnels: data.funnels || [], count: data.count || 0 };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

/**
 * Get funnel details by ID
 */
async function getFunnel(funnelId) {
  try {
    if (!funnelId) throw new Error('funnelId required');
    const { data } = await client.get('/funnels/funnel/list', { params: { locationId } });
    const funnel = (data.funnels || []).find(f => f._id === funnelId);
    if (!funnel) throw new Error(`Funnel ${funnelId} not found`);
    return { success: true, funnel };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

/**
 * List pages in a funnel
 * @param {string} funnelId - Funnel ID
 * @param {Object} options
 * @param {number} options.limit - Max pages (default: 20)
 * @param {number} options.offset - Offset for pagination (default: 0)
 */
async function listPages(funnelId, options = {}) {
  try {
    if (!funnelId) throw new Error('funnelId required');
    const limit = options.limit || 20;
    const offset = options.offset || 0;
    const { data } = await client.get('/funnels/page', {
      params: { funnelId, locationId, limit, offset }
    });
    // Response is an array of pages
    const pages = Array.isArray(data) ? data : (data.pages || []);
    return { success: true, pages, count: pages.length };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

/**
 * Get page details
 */
async function getPageDetails(funnelId, pageId) {
  try {
    if (!funnelId) throw new Error('funnelId required');
    if (!pageId) throw new Error('pageId required');
    const result = await listPages(funnelId, { limit: 100, offset: 0 });
    if (!result.success) return result;
    const page = result.pages.find(p => p._id === pageId);
    if (!page) throw new Error(`Page ${pageId} not found in funnel ${funnelId}`);
    return { success: true, page };
  } catch (e) {
    return { success: false, error: e.message, status: e.response?.status, details: e.response?.data };
  }
}

module.exports = { listFunnels, getFunnel, listPages, getPageDetails };
