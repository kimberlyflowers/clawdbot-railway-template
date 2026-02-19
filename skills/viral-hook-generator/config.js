/**
 * Viral Hook Generator - Configuration
 */

module.exports = {
  // API Configuration
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  BRAVE_API_KEY: process.env.BRAVE_API_KEY,
  
  // Cache settings
  CACHE_TTL: 3600,  // Cache trend analysis for 1 hour
  
  // Platform support
  PLATFORMS: ['tiktok', 'instagram', 'youtube', 'shorts', 'reels'],
  
  // Hook patterns
  HOOK_PATTERNS: [
    'pattern_interrupt',
    'curiosity_gap',
    'benefit_promise',
    'controversy',
    'social_proof',
    'urgency',
    'specificity'
  ],
  
  // Viral scoring thresholds
  VIRAL_SCORE_THRESHOLDS: {
    highly_viral: 80,
    strong: 70,
    decent: 60,
    weak: 0
  },
  
  // Generation settings
  HOOK_GENERATION: {
    minWords: 5,
    maxWords: 15,
    defaultCount: 10
  },
  
  // Niches with predefined characteristics
  NICHES: {
    'fitness': {
      keywords: ['workout', 'muscle', 'exercise', 'gym', 'training', 'health'],
      topPatterns: ['pattern_interrupt', 'benefit_promise'],
      avgEngagement: 2100000
    },
    'productivity': {
      keywords: ['time', 'focus', 'work', 'morning', 'routine', 'habits'],
      topPatterns: ['benefit_promise', 'curiosity_gap'],
      avgEngagement: 1700000
    },
    'business': {
      keywords: ['revenue', 'startup', 'founder', 'scale', 'business', 'money'],
      topPatterns: ['benefit_promise', 'social_proof'],
      avgEngagement: 1900000
    },
    'beauty': {
      keywords: ['makeup', 'skincare', 'beauty', 'cosmetics', 'hair', 'fashion'],
      topPatterns: ['pattern_interrupt', 'controversy'],
      avgEngagement: 2800000
    },
    'saas': {
      keywords: ['tool', 'software', 'app', 'ai', 'automation', 'productivity'],
      topPatterns: ['benefit_promise', 'curiosity_gap'],
      avgEngagement: 1500000
    }
  },
  
  // Quality thresholds
  QUALITY: {
    minViralScore: 60,
    maxDuplicates: 2,
    requiredTests: 8
  }
};
