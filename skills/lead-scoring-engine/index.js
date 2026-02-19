const fs = require('fs');
const crypto = require('crypto');

// Load verified GHL skill
const ghl = require('../ghl');

// Configuration
const config = {
  ghlToken: fs.readFileSync('/data/secrets/ghl-token.txt', 'utf8').trim(),
  ghlLocationId: 'iGy4nrpDVU0W1jAvseL3'
};

// In-memory state (use database in production)
const state = {
  scoringRules: {
    'email_open': 2,
    'email_click': 5,
    'website_visit': 3,
    'form_submission': 10,
    'phone_call': 15,
    'meeting': 25,
    'trial_signup': 50,
    'contract_download': 10
  },
  fitCriteria: {
    companySize: [],
    industry: [],
    budget: '',
    region: []
  },
  thresholds: {
    hot: 75,
    warm: 50,
    cold: 0
  },
  autoTriggers: {},
  autoTriggersEnabled: true,
  contactScores: new Map(),
  scoreHistory: new Map(),
  activities: new Map()
};

// ==================== CORE SCORING ====================

const calculateScore = (contact, activities = []) => {
  let engagementScore = 0;
  let fitScore = 0;
  let recencyScore = 0;

  // Engagement score (max 50)
  for (const activity of activities) {
    engagementScore += state.scoringRules[activity.type] || 0;
  }
  engagementScore = Math.min(engagementScore, 50);

  // Fit score (max 30)
  let fitPoints = 0;
  if (state.fitCriteria.companySize.length > 0 && 
      state.fitCriteria.companySize.includes(contact.companySize)) {
    fitPoints += 10;
  }
  if (state.fitCriteria.industry.length > 0 && 
      state.fitCriteria.industry.includes(contact.industry)) {
    fitPoints += 10;
  }
  if (state.fitCriteria.region.length > 0 && 
      state.fitCriteria.region.includes(contact.region)) {
    fitPoints += 10;
  }
  fitScore = Math.min(fitPoints, 30);

  // Recency score (max 20)
  if (activities.length > 0) {
    const lastActivityDate = new Date(activities[activities.length - 1].date);
    const daysSinceLastActivity = Math.floor((Date.now() - lastActivityDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastActivity < 7) recencyScore = 20;
    else if (daysSinceLastActivity < 14) recencyScore = 15;
    else if (daysSinceLastActivity < 30) recencyScore = 10;
    else recencyScore = 5;
  }

  const totalScore = engagementScore + fitScore + recencyScore;

  return {
    total: Math.min(totalScore, 100),
    breakdown: {
      engagement: engagementScore,
      fit: fitScore,
      recency: recencyScore
    }
  };
};

const getSegment = (score) => {
  if (score >= state.thresholds.hot) return 'hot';
  if (score >= state.thresholds.warm) return 'warm';
  return 'cold';
};

const scoreContact = async (contactId) => {
  try {
    const contact = await ghl.contacts.getContact(contactId);
    if (!contact.success) throw new Error('Contact not found');

    const contactData = contact.contact;
    const activities = state.activities.get(contactId) || [];
    
    const scoring = calculateScore(contactData, activities);
    const segment = getSegment(scoring.total);

    const scoreRecord = {
      contactId,
      name: `${contactData.firstName} ${contactData.lastName}`,
      email: contactData.email,
      company: contactData.company || 'Unknown',
      segment,
      score: scoring.total,
      scoreBreakdown: scoring.breakdown,
      scoredAt: new Date().toISOString(),
      lastActivity: activities.length > 0 ? activities[activities.length - 1].date : null,
      activityCount: activities.length
    };

    state.contactScores.set(contactId, scoreRecord);

    // Update GHL contact with score
    await ghl.contacts.updateContact(contactId, {
      score: scoring.total,
      segment: segment,
      lastScoredAt: new Date().toISOString()
    });

    // Track score history
    if (!state.scoreHistory.has(contactId)) {
      state.scoreHistory.set(contactId, []);
    }
    state.scoreHistory.get(contactId).push({
      score: scoring.total,
      segment,
      date: new Date().toISOString()
    });

    // Check auto-triggers
    if (state.autoTriggersEnabled && state.autoTriggers[scoring.total]) {
      triggerAutoAction(scoreRecord, state.autoTriggers[scoring.total]);
    }

    return { success: true, score: scoreRecord };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const scoreAllContacts = async () => {
  try {
    const allContacts = await ghl.contacts.listContacts();
    if (!allContacts.success) throw new Error('Failed to fetch contacts');

    let scored = 0;
    let failed = 0;

    for (const contact of allContacts.contacts || []) {
      const result = await scoreContact(contact.id);
      if (result.success) scored++;
      else failed++;
    }

    return {
      success: true,
      totalScored: scored,
      totalFailed: failed,
      message: `Scored ${scored} contacts, ${failed} failed`
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getScore = async (contactId) => {
  try {
    const score = state.contactScores.get(contactId);
    if (!score) {
      // Score if not found
      const result = await scoreContact(contactId);
      if (!result.success) throw new Error('Could not score contact');
      return { success: true, score: result.score };
    }
    return { success: true, score };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getScoreHistory = async (contactId, limit = 30) => {
  try {
    const history = state.scoreHistory.get(contactId) || [];
    return {
      success: true,
      history: history.slice(-limit)
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const batchScore = async (contactIds) => {
  try {
    const results = [];
    for (const contactId of contactIds) {
      const result = await scoreContact(contactId);
      results.push({ contactId, ...result });
    }
    return { success: true, results };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== SEGMENTATION ====================

const getSegments = async () => {
  try {
    const hot = Array.from(state.contactScores.values()).filter(s => s.segment === 'hot');
    const warm = Array.from(state.contactScores.values()).filter(s => s.segment === 'warm');
    const cold = Array.from(state.contactScores.values()).filter(s => s.segment === 'cold');

    return {
      success: true,
      segments: {
        hot: { count: hot.length, avgScore: hot.length > 0 ? (hot.reduce((a, b) => a + b.score, 0) / hot.length).toFixed(1) : 0 },
        warm: { count: warm.length, avgScore: warm.length > 0 ? (warm.reduce((a, b) => a + b.score, 0) / warm.length).toFixed(1) : 0 },
        cold: { count: cold.length, avgScore: cold.length > 0 ? (cold.reduce((a, b) => a + b.score, 0) / cold.length).toFixed(1) : 0 }
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getSegmentContacts = async (segment) => {
  try {
    const contacts = Array.from(state.contactScores.values())
      .filter(s => s.segment === segment)
      .sort((a, b) => b.score - a.score);
    
    return { success: true, segment, count: contacts.length, contacts };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getTopProspects = async (limit = 10) => {
  try {
    const sorted = Array.from(state.contactScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    return { success: true, prospects: sorted };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getAtRiskLeads = async () => {
  try {
    const atRisk = [];
    
    for (const [contactId, scoreHistory] of state.scoreHistory) {
      if (scoreHistory.length < 2) continue;
      
      const current = scoreHistory[scoreHistory.length - 1].score;
      const previous = scoreHistory[scoreHistory.length - 2].score;
      
      if (previous - current >= 10) {
        // Score dropped by 10+ points
        const contact = state.contactScores.get(contactId);
        if (contact) {
          atRisk.push({
            ...contact,
            previousScore: previous,
            scoreDrop: previous - current
          });
        }
      }
    }

    return { success: true, atRiskLeads: atRisk };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== CUSTOMIZATION ====================

const setCustomRules = async (rules) => {
  try {
    state.scoringRules = { ...state.scoringRules, ...rules };
    return { success: true, rules: state.scoringRules };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const setFitCriteria = async (criteria) => {
  try {
    state.fitCriteria = criteria;
    return { success: true, criteria: state.fitCriteria };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const setThresholds = async (thresholds) => {
  try {
    state.thresholds = thresholds;
    return { success: true, thresholds: state.thresholds };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== AUTO-TRIGGERS ====================

const setAutoTriggers = async (triggers) => {
  try {
    state.autoTriggers = triggers;
    return { success: true, triggers: state.autoTriggers };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const pauseAutoTriggers = async () => {
  try {
    state.autoTriggersEnabled = false;
    return { success: true, message: 'Auto-triggers paused' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const resumeAutoTriggers = async () => {
  try {
    state.autoTriggersEnabled = true;
    return { success: true, message: 'Auto-triggers resumed' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const triggerAutoAction = async (scoreRecord, trigger) => {
  // In production, integrate with campaign manager and notifications
  console.log(`🚀 Auto-trigger: ${trigger.action} for ${scoreRecord.name} (score: ${scoreRecord.score})`);
  
  if (trigger.action === 'send_to_sales') {
    // Notify sales team via Slack/Discord
    console.log(`📢 Sales alert: New hot lead - ${scoreRecord.name}`);
  } else if (trigger.action === 'send_campaign') {
    // Trigger email campaign
    console.log(`📧 Campaign triggered: ${trigger.campaignId}`);
  }
};

// ==================== ANALYTICS ====================

const getAnalytics = async () => {
  try {
    const allScores = Array.from(state.contactScores.values());
    
    const segments = await getSegments();
    const topProspects = await getTopProspects(5);
    const atRisk = await getAtRiskLeads();

    const avgScore = allScores.length > 0 ? (allScores.reduce((a, b) => a + b.score, 0) / allScores.length).toFixed(1) : 0;

    return {
      success: true,
      analytics: {
        totalContacts: allScores.length,
        averageScore: avgScore,
        segments: segments.segments,
        distribution: {
          hot: segments.segments.hot.count,
          warm: segments.segments.warm.count,
          cold: segments.segments.cold.count
        },
        topProspects,
        atRiskCount: atRisk.atRiskLeads.length,
        scoringRules: state.scoringRules,
        thresholds: state.thresholds
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getReport = async (options = {}) => {
  try {
    const { startDate, endDate, groupBy = 'segment' } = options;
    
    const allScores = Array.from(state.contactScores.values());
    
    let report = {
      period: { startDate, endDate },
      totalContacts: allScores.length,
      bySegment: {
        hot: allScores.filter(s => s.segment === 'hot').length,
        warm: allScores.filter(s => s.segment === 'warm').length,
        cold: allScores.filter(s => s.segment === 'cold').length
      },
      scoreDistribution: {
        '0-25': allScores.filter(s => s.score < 25).length,
        '25-50': allScores.filter(s => s.score >= 25 && s.score < 50).length,
        '50-75': allScores.filter(s => s.score >= 50 && s.score < 75).length,
        '75-100': allScores.filter(s => s.score >= 75).length
      }
    };

    return { success: true, report };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const exportScores = async (format = 'csv') => {
  try {
    const scores = Array.from(state.contactScores.values());
    
    if (format === 'json') {
      return { success: true, data: scores };
    } else if (format === 'csv') {
      const headers = 'Name,Email,Company,Segment,Score,Engagement,Fit,Recency,Activity Count';
      const rows = scores.map(s => 
        `"${s.name}","${s.email}","${s.company}","${s.segment}",${s.score},${s.scoreBreakdown.engagement},${s.scoreBreakdown.fit},${s.scoreBreakdown.recency},${s.activityCount}`
      );
      return { success: true, data: `${headers}\n${rows.join('\n')}` };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getScoringFactors = async () => {
  try {
    return {
      success: true,
      factors: {
        rules: state.scoringRules,
        maxEngagement: 50,
        maxFit: 30,
        maxRecency: 20,
        totalMax: 100
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== ACTIVITY TRACKING ====================

const logActivity = async (contactId, activity) => {
  try {
    if (!state.activities.has(contactId)) {
      state.activities.set(contactId, []);
    }

    const activityRecord = {
      ...activity,
      id: crypto.randomUUID(),
      timestamp: activity.timestamp || new Date().toISOString()
    };

    state.activities.get(contactId).push(activityRecord);

    // Re-score contact after new activity
    await scoreContact(contactId);

    return { success: true, activity: activityRecord };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getContactActivity = async (contactId, limit = 20) => {
  try {
    const activities = state.activities.get(contactId) || [];
    return {
      success: true,
      contactId,
      activities: activities.slice(-limit).reverse()
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const trackConversion = async (contactId, conversionData) => {
  try {
    // Log as activity
    await logActivity(contactId, {
      type: 'conversion',
      value: conversionData.value,
      source: conversionData.source,
      date: new Date().toISOString()
    });

    // Update contact in GHL
    await ghl.contacts.updateContact(contactId, {
      lastConversion: new Date().toISOString(),
      conversionValue: conversionData.value
    });

    return { success: true, message: 'Conversion tracked' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== EXPORTS ====================

module.exports = {
  // Scoring
  scoreContact,
  scoreAllContacts,
  getScore,
  getScoreHistory,
  batchScore,

  // Segmentation
  getSegments,
  getSegmentContacts,
  getTopProspects,
  getAtRiskLeads,

  // Customization
  setCustomRules,
  setFitCriteria,
  setThresholds,

  // Auto-triggers
  setAutoTriggers,
  pauseAutoTriggers,
  resumeAutoTriggers,

  // Analytics
  getAnalytics,
  getReport,
  exportScores,
  getScoringFactors,

  // Activity
  logActivity,
  getContactActivity,
  trackConversion
};
