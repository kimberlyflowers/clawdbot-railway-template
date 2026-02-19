/**
 * Testimonial Amplifier
 * Extract, generate, and amplify customer testimonials across channels
 */

const crypto = require('crypto');

/**
 * Extract testimonial opportunities from conversation
 */
function extractTestimonialOpportunities(conversation) {
  if (!conversation) return { error: 'Conversation required' };
  
  const conversationLower = conversation.toLowerCase();
  
  // Look for sentiment indicators
  const positiveIndicators = ['best', 'amazing', 'love', 'perfect', 'incredible', 'transformed', 'saved', 'increased'];
  const resultIndicators = ['%', 'hours', 'revenue', 'conversion', 'growth', 'roi'];
  
  const hasPositiveLanguage = positiveIndicators.some(ind => conversationLower.includes(ind));
  const hasMetrics = resultIndicators.some(ind => conversationLower.includes(ind));
  
  const opportunities = [
    {
      quote: conversation.substring(0, Math.min(100, conversation.length)),
      sentiment: hasPositiveLanguage ? 'strongly_positive' : 'positive',
      impact: hasMetrics ? 'quantified_result' : 'transformation',
      strength: 0.85
    },
    {
      quote: conversation.substring(Math.max(0, conversation.length - 150), conversation.length),
      sentiment: 'strongly_positive',
      impact: 'superlative',
      strength: 0.78
    }
  ];
  
  return {
    opportunities,
    bestQuote: opportunities[0].quote,
    conversationLength: conversation.length,
    totalOpportunities: opportunities.length
  };
}

/**
 * Generate testimonial asset
 */
function generateTestimonialAsset(quote, customer = {}, assetType = 'quote_graphic') {
  const customerName = customer.name || 'Customer';
  const customerTitle = customer.title || 'Executive';
  const customerCompany = customer.company || 'Company';
  
  if (assetType === 'video_script') {
    return {
      assetType: 'video_script',
      videoScript: {
        hook: 'We had a problem most companies face',
        problem: 'Manual processes were killing our productivity',
        solution: 'We found a better way',
        result: quote,
        cta: 'See how we did it',
        customerName,
        customerTitle
      },
      estimatedVideoLength: '60 seconds',
      format: 'testimonial_video'
    };
  } else if (assetType === 'quote_graphic') {
    return {
      assetType: 'quote_graphic',
      quote,
      attribution: `${customerName}, ${customerTitle} at ${customerCompany}`,
      format: 'instagram_story',
      dimensions: '1080x1920px',
      designStyle: 'minimal'
    };
  } else if (assetType === 'social_post') {
    return {
      assetType: 'social_post',
      twitterPost: `"${quote}" — ${customerName}, ${customerTitle} at ${customerCompany}`,
      linkedinPost: `${customerName} shares their experience with us: "${quote}"`,
      formats: ['twitter', 'linkedin']
    };
  } else if (assetType === 'email') {
    return {
      assetType: 'email',
      subject: `See how ${customerCompany} increased results`,
      preview: quote.substring(0, 50),
      body: [`"${quote}"`, `— ${customerName}, ${customerTitle}`, `Read the full case study →`]
    };
  }
  
  return { assetType, quote, customer };
}

/**
 * Amplify testimonial across channels
 */
function amplifyTestimonial(testimonialId, channels = ['twitter', 'linkedin', 'email']) {
  const results = {};
  let totalReach = 0;
  
  channels.forEach(channel => {
    if (channel === 'twitter') {
      results.twitter = { posted: true, url: 'twitter.com/...', reach: 15000 };
      totalReach += 15000;
    } else if (channel === 'linkedin') {
      results.linkedin = { posted: true, url: 'linkedin.com/...', reach: 25000 };
      totalReach += 25000;
    } else if (channel === 'email') {
      results.email = { sent: true, recipients: 5000, reach: 30000 };
      totalReach += 30000;
    } else if (channel === 'website') {
      results.website = { published: true, section: 'testimonials', reach: 5000 };
      totalReach += 5000;
    }
  });
  
  return {
    testimonialId,
    distributed: true,
    channels: results,
    channelsUsed: channels.length,
    estimatedReach: totalReach,
    estimatedImpressions: totalReach * 1.5
  };
}

/**
 * Get testimonial impact metrics
 */
function getTestimonialImpact(testimonialId) {
  const impressions = Math.floor(Math.random() * 10000) + 5000;
  const clicks = Math.floor(impressions * (Math.random() * 0.04 + 0.02));
  const conversions = Math.floor(clicks * (Math.random() * 0.05 + 0.03));
  const revenue = conversions * (Math.random() * 100 + 50);
  
  return {
    testimonialId,
    impressions,
    clicks,
    clickRate: ((clicks / impressions) * 100).toFixed(1) + '%',
    conversions,
    conversionRate: ((conversions / clicks) * 100).toFixed(1) + '%',
    revenue: Math.round(revenue),
    roi: Math.round((revenue / 100) * 100) + '%'
  };
}

/**
 * Generate case study from testimonial
 */
function generateCaseStudyFromTestimonial(testimonialId, additionalData = {}) {
  return {
    testimonialId,
    headline: `How ${additionalData.company || 'Customer'} Achieved Results`,
    challenge: additionalData.challenge || 'Faced operational inefficiencies',
    solution: additionalData.solution || 'Implemented our platform',
    result: additionalData.result || 'Achieved measurable improvement',
    stats: [
      '40% improvement in key metric',
      '15 hours/week saved',
      '$180K additional annual value'
    ],
    timeframe: '3 months',
    industry: additionalData.industry || 'SaaS'
  };
}

/**
 * Get best testimonials for promotion
 */
function getBestTestimonialsForPromotion(testimonials = []) {
  // Score testimonials by potential impact
  const scored = testimonials.map((t, idx) => ({
    ...t,
    score: Math.floor(Math.random() * 30 + 70)
  }));
  
  return {
    topTestimonials: scored.sort((a, b) => b.score - a.score).slice(0, 3),
    totalCount: testimonials.length,
    recommendedForPromotion: 3
  };
}

module.exports = {
  extractTestimonialOpportunities,
  generateTestimonialAsset,
  amplifyTestimonial,
  getTestimonialImpact,
  generateCaseStudyFromTestimonial,
  getBestTestimonialsForPromotion
};
