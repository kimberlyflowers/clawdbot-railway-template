/**
 * Competitor Decoder
 * Analyze competitors, find gaps, generate positioning
 */

const crypto = require('crypto');

/**
 * Analyze competitor positioning
 */
function analyzeCompetitorPosition(competitors = []) {
  const competitorData = {
    'HubSpot': {
      headline: 'All-in-one CRM and marketing automation',
      positioning: 'All-in-one platform',
      targetAudience: 'Mid-market to enterprise',
      pricePoint: '$50-3200/month',
      keyMessages: ['Complete platform', 'Integration hub', 'Scalable'],
      strengths: ['Extensive features', 'Great ecosystem', 'Strong brand'],
      weaknesses: ['Overwhelming complexity', 'Expensive', 'Learning curve']
    },
    'Pipedrive': {
      headline: 'The sales CRM built for sales teams',
      positioning: 'Sales-focused simplicity',
      targetAudience: 'Small to mid-market sales teams',
      pricePoint: '$14-99/month',
      keyMessages: ['Sales-focused', 'Visual pipeline', 'Easy setup'],
      strengths: ['Simple UI', 'Affordable', 'Fast to value'],
      weaknesses: ['Limited marketing features', 'Small ecosystem', 'Limited customization']
    },
    'Salesforce': {
      headline: 'The most advanced CRM platform',
      positioning: 'Enterprise power',
      targetAudience: 'Enterprise companies',
      pricePoint: '$165-300/month per user',
      keyMessages: ['Unlimited scale', 'Customizable', 'AI-powered'],
      strengths: ['Powerful', 'Highly customizable', 'Extensive API'],
      weaknesses: ['Extremely complex', 'Very expensive', 'Slow to implement']
    }
  };
  
  let analysisData = competitors.length > 0
    ? competitors.map(c => {
        const name = c.replace(/[^a-zA-Z]/g, '');
        const match = Object.keys(competitorData).find(k => k.toLowerCase().includes(name.toLowerCase()));
        return { name: c, ...competitorData[match] || competitorData['HubSpot'] };
      })
    : Object.entries(competitorData).map(([name, data]) => ({ name, ...data }));
  
  return {
    competitors: analysisData,
    gaps: [
      'No one focusing exclusively on mid-market affordably',
      'No transparency in pricing discovery',
      'No focus on customer success/onboarding',
      'No founder-friendly positioning'
    ],
    totalCompetitorsAnalyzed: analysisData.length
  };
}

/**
 * Get competitor messaging strategy
 */
function getCompetitorMessagingStrategy(competitor) {
  const strategies = {
    'HubSpot': {
      headline: 'All-in-one CRM and marketing automation',
      subheadline: 'Manage your entire business on one platform',
      messagingPillars: [
        { pillar: 'All-in-one', mentions: 45, emphasis: 'high' },
        { pillar: 'Integration hub', mentions: 28, emphasis: 'high' },
        { pillar: 'Automation', mentions: 22, emphasis: 'high' },
        { pillar: 'Scalability', mentions: 15, emphasis: 'medium' }
      ]
    },
    'default': {
      headline: competitor + ' CRM Solution',
      subheadline: 'Manage your sales pipeline effectively',
      messagingPillars: [
        { pillar: 'Core feature', mentions: 30, emphasis: 'high' },
        { pillar: 'Ease of use', mentions: 20, emphasis: 'medium' },
        { pillar: 'Integration', mentions: 15, emphasis: 'medium' },
        { pillar: 'Support', mentions: 10, emphasis: 'low' }
      ]
    }
  };
  
  const strategy = strategies[competitor] || strategies['default'];
  
  return {
    competitor,
    ...strategy,
    targetAudience: 'Growing companies looking for efficiency',
    psychographicalProfile: 'Value efficiency, integration, and scalability'
  };
}

/**
 * Find competitive gaps
 */
function findCompetitiveGaps(competitors = []) {
  return {
    gaps: [
      {
        gap: 'Transparent, published pricing (most hide quotes)',
        opportunity: 'Show simple, predictable pricing upfront',
        potentialBenefit: 'Trust increase + faster sales'
      },
      {
        gap: 'Customer success focus (most emphasize features)',
        opportunity: 'Emphasize onboarding, training, success metrics',
        potentialBenefit: 'Higher retention + referrals'
      },
      {
        gap: 'Founder-friendly positioning (all corporate)',
        opportunity: 'Position for founders and small teams',
        potentialBenefit: 'Word-of-mouth growth from founder network'
      },
      {
        gap: 'Mid-market sweet spot (most target high or low)',
        opportunity: 'Focus on $1-10M revenue companies',
        potentialBenefit: 'Huge underserved segment'
      }
    ],
    bestOpportunity: 'Transparent pricing + founder positioning',
    recommendation: 'This combination is your primary differentiator'
  };
}

/**
 * Generate positioning statement
 */
function generatePositioningStatement(yourStrengths = [], competitorWeaknesses = []) {
  const strengths = yourStrengths.length > 0 
    ? yourStrengths 
    : ['Simplicity', 'Transparency', 'Customer success', 'Founder-built'];
  
  return {
    positioning: 'For growing B2B companies who want predictable revenue with transparent pricing, dedicated support, and founder-friendly simplicity',
    uniqueValue: `Only platform combining ${strengths.slice(0, 2).join(' + ')}`,
    differentiators: [
      'Transparent, predictable pricing (no hidden enterprise fees)',
      'Founder-built (we use our own product)',
      'Dedicated success manager (not support ticket queue)',
      'Fast setup (days, not months)'
    ],
    ownershipStatement: `We own the ${strengths[0].toLowerCase()} + ${strengths[1].toLowerCase()} segment`,
    targetSegment: 'Growing startups and mid-market companies ($1-50M revenue)'
  };
}

/**
 * Get competitor pricing
 */
function getCompetitorPricing(competitors = []) {
  const pricingData = {
    'HubSpot': { entry: '$50/mo', pro: '$800/mo', enterprise: 'custom' },
    'Pipedrive': { entry: '$14/mo', pro: '$99/mo', enterprise: '$199/mo' },
    'Salesforce': { entry: '$165/user/mo', pro: '$330/user/mo', enterprise: 'custom' },
    'Stripe': { entry: 'usage-based', pro: 'usage-based', enterprise: 'custom' },
    'default': { entry: '$99/mo', pro: '$299/mo', enterprise: 'custom' }
  };
  
  let competitorPricing = competitors.length > 0
    ? competitors.map(c => {
        const name = c.replace(/[^a-zA-Z]/g, '');
        const match = Object.keys(pricingData).find(k => k.toLowerCase().includes(name.toLowerCase()));
        return { name: c, ...pricingData[match] || pricingData['default'] };
      })
    : Object.entries(pricingData).slice(0, 3).map(([name, prices]) => ({ name, ...prices }));
  
  const entryPrices = competitorPricing.map(c => parseInt(c.entry) || 99);
  const avgEntry = Math.round(entryPrices.reduce((a, b) => a + b, 0) / entryPrices.length);
  
  return {
    competitors: competitorPricing,
    priceRangeEntry: `$${Math.min(...entryPrices)}-${Math.max(...entryPrices)}/mo`,
    averagePricing: `$${avgEntry}/mo`,
    recommendation: `Price at $${Math.round(avgEntry * 0.8)}-${Math.round(avgEntry * 0.9)}/mo for value positioning against premium competitors`,
    strategyRecommendation: 'Compete on value, not price race'
  };
}

/**
 * Get competitive intelligence summary
 */
function getCompetitiveIntelligenceSummary(competitors = []) {
  return {
    competitorCount: competitors.length,
    positioningAnalysis: getCompetitorMessagingStrategy(competitors[0] || 'market leader'),
    gaps: findCompetitiveGaps(competitors),
    pricing: getCompetitorPricing(competitors),
    positioning: generatePositioningStatement(),
    actionItems: [
      'Define your unique positioning (see above)',
      'Implement transparent pricing on website',
      'Create comparison matrix for sales',
      'Train sales team on differentiation'
    ]
  };
}

module.exports = {
  analyzeCompetitorPosition,
  getCompetitorMessagingStrategy,
  findCompetitiveGaps,
  generatePositioningStatement,
  getCompetitorPricing,
  getCompetitiveIntelligenceSummary
};
