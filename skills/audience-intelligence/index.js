const crypto = require('crypto');

// Real community database
const COMMUNITY_DATABASE = {
  reddit: {
    fitness: {
      'Confusion + Beginner': [
        { name: 'r/beginnerfitness', members: '1M+', description: 'Scared to start' },
        { name: 'r/FitnessOver40', members: '500K+', description: 'Age-related concerns' },
        { name: 'r/FitnessOver50', members: '300K+', description: 'Mobility focus' },
        { name: 'r/AtomicHabits', members: '400K+', description: 'Habit-forming psychology' },
        { name: 'r/EatCheapAndHealthy', members: '2M+', description: 'Nutrition on budget' }
      ],
      'Fear + Shame': [
        { name: 'r/loseit', members: '1.5M+', description: 'Weight loss community' },
        { name: 'r/CICO', members: '400K+', description: 'Calories in/out' },
        { name: 'r/bodyweightfitness', members: '1M+', description: 'Home fitness' }
      ]
    }
  },
  facebook: {
    fitness: [
      { name: 'Couch to Fitness', members: '500K+', description: 'Start from zero' },
      { name: 'Our Parks Fitness', members: '200K+', description: 'Accessible movement' },
      { name: 'Busy Moms Fitness', members: '300K+', description: 'Working parents' },
      { name: 'New Chapter Professionals', members: '150K+', description: 'Career + fitness' }
    ]
  },
  niche: [
    { name: 'Nerd Fitness', description: 'For outsiders uncomfortable in beast mode gyms' },
    { name: 'Mark\'s Daily Apple', description: 'Paleo + habit approach' },
    { name: 'Strength Standard', description: 'Data-driven fitness' }
  ]
};

const HIGH_INTENT_KEYWORDS_BASE = {
  'Confusion': [
    "I'm 40 and don't know where to start",
    "How do I build a workout plan",
    "Best fitness app for confused beginners",
    "I don't understand fitness terminology"
  ],
  'Fear + Shame': [
    "I'm too old to start working out",
    "Best fitness app for people who hate the gym",
    "How to start exercising without judgment",
    "Beginner fitness without feeling embarrassed"
  ],
  'Lack of Plan': [
    "AI fitness plan generator",
    "Personalized workout plan for beginners",
    "Nutrition and workout combined app",
    "How to build a fitness habit"
  ],
  'Health Diagnosis': [
    "Fitness after pre-diabetes diagnosis",
    "Workout plan for high cholesterol",
    "Safe exercise for health recovery",
    "Lifestyle change after health scare"
  ]
};

const INSIDER_LANGUAGE = {
  'Confused Beginners': ['balanced', 'energized', 'doable', 'sustainable', 'not intimidating'],
  'Recovering Athletes': ['technique', 'form', 'progressive overload', 'logical'],
  'Busy Professionals': ['efficient', 'quick', 'flexible', 'adaptive', 'real-world']
};

// State
const state = {
  personas: new Map(),
  icps: new Map(),
  strategies: new Map()
};

// ==================== AUDIENCE DISCOVERY ====================

const generateITA = async (itaData) => {
  try {
    const { villain, transformation, painPoints, industry } = itaData;

    const primaryPersona = {
      name: 'The Awakened Beginner',
      age: '30-50',
      trigger: transformation?.trigger || 'Health moment or mirror realization',
      emotions: ['Confused', 'Ashamed', 'Hopeful'],
      painPoints,
      seeking: 'Safe, unified solution without judgment',
      language: INSIDER_LANGUAGE['Confused Beginners'],
      beforeIdentity: transformation?.before || 'Struggling',
      afterIdentity: transformation?.after || 'Capable',
      decisionDriven: 'Emotional - wants to feel safe and understood'
    };

    const secondaryPersona = {
      name: 'The Recovering Athlete',
      description: 'Used to be active, been away too long',
      seeking: 'Regain capability, not just looks',
      language: INSIDER_LANGUAGE['Recovering Athletes'],
      decisionDriven: 'Logical - understands fitness but needs modern approach'
    };

    return {
      success: true,
      primaryPersona,
      secondaryPersona,
      villain,
      transformation
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const findRedditCommunities = async (redditData) => {
  try {
    const { villain, painPoint, industry } = redditData;

    const communities = COMMUNITY_DATABASE.reddit[industry]?.[`${villain} + ${painPoint}`] ||
      COMMUNITY_DATABASE.reddit.fitness['Confusion + Beginner'];

    return {
      success: true,
      communities,
      strategy: 'Post educational content, answer "dumb" questions, share journey'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const findFacebookGroups = async (facebookData) => {
  try {
    const { transformation, audience } = facebookData;

    const groups = COMMUNITY_DATABASE.facebook.fitness;

    return {
      success: true,
      groups,
      strategy: 'Community-first approach, accountability, journey sharing',
      engagement: 'Daily posts, comment on members, create culture'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const findNicheCommunities = async (nicheData) => {
  try {
    const { industry, psychographic } = nicheData;

    const communities = COMMUNITY_DATABASE.niche;

    return {
      success: true,
      communities,
      strategy: 'Sponsor, partner, or advertise in aligned communities'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== KEYWORD DISCOVERY ====================

const generateHighIntentKeywords = async (keywordData) => {
  try {
    const { villain, painPoints, industry } = keywordData;

    let keywords = [];
    
    // Base keywords from villain
    const villainKeywords = HIGH_INTENT_KEYWORDS_BASE[villain] || [];
    keywords.push(...villainKeywords);

    // Add pain-point-specific keywords
    painPoints?.forEach(pain => {
      const painKeywords = HIGH_INTENT_KEYWORDS_BASE[pain] || [];
      keywords.push(...painKeywords);
    });

    // Add industry-specific modifiers
    const industryModifiers = {
      'Fitness': [
        'app', 'beginner', 'safe', 'judgment-free', 'personalized',
        'at home', 'no gym', 'unified', 'AI'
      ]
    };

    const modifiers = industryModifiers[industry] || [];
    const expandedKeywords = keywords.concat(
      modifiers.map(mod => keywords[0]?.replace?.('', mod))
    ).filter(Boolean);

    return {
      success: true,
      keywords: expandedKeywords.slice(0, 20),
      analysis: 'These are fear-based and confusion-based queries, not just feature-based',
      googleAdsStrategy: 'High intent search campaign on these exact keywords'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const extractInsiderLanguage = async (languageData) => {
  try {
    const { audience, psychographic } = languageData;

    const phrases = INSIDER_LANGUAGE[audience] || 
      INSIDER_LANGUAGE['Confused Beginners'];

    return {
      success: true,
      phrases,
      usage: 'Use these exact words in all copy to "language mirror" your audience',
      example: `Instead of "maximize gains," say "${phrases[0]}"`
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== PERSONA DEVELOPMENT ====================

const createPrimaryPersona = async (personaData) => {
  try {
    const { psychographic, villain, transformation, painPoints } = personaData;

    const persona = {
      name: psychographic,
      archetype: 'The Transformed',
      demographics: {
        age: '30-50',
        income: 'Variable',
        education: 'College+',
        lifestage: 'Mid-career or mid-life reinvention'
      },
      psychographics: {
        values: ['Health', 'Capability', 'Self-improvement'],
        fears: ['Failure', 'Judgment', 'Wasting time'],
        desires: ['Feel capable', 'Be healthier', 'Transform identity']
      },
      dayZero: 'Health diagnosis or mirror moment',
      twoAMProblem: 'Body is changing, unhappy with reflection',
      beforeIdentity: transformation?.before,
      afterIdentity: transformation?.after,
      painPoints,
      decision: 'Emotional + logical (needs both empathy and science)'
    };

    return { success: true, persona };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const generateICP = async (icpData) => {
  try {
    const { primaryPersona, secondaryPersona, antiPersona } = icpData;

    const icp = {
      primaryPersona,
      secondaryPersona,
      antiPersona,
      firmographics: {
        companySize: 'N/A (B2C)',
        industry: 'Personal development',
        decisionMaker: 'Individual'
      },
      buyingProcess: {
        trigger: 'Health moment or self-recognition',
        research: 'Reddit, Facebook groups, reviews',
        decision: 'Low barrier to entry (app trial)',
        loyalty: 'High if community aspect works'
      },
      messaging: {
        primaryPersona: 'Safe zone, no judgment, unified solution',
        secondaryPersona: 'Data-driven, evidence-based, logical progression'
      }
    };

    return { success: true, icp };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== AUDIENCE MAPPING ====================

const mapAudienceLocations = async (mapData) => {
  try {
    const { psychographic, painPoint, villain } = mapData;

    const locations = [
      {
        platform: 'Reddit',
        specific: 'r/beginnerfitness, r/FitnessOver40, r/AtomicHabits',
        why: 'Honest questions, vulnerability, low judgment',
        engagement: 'Answer questions, share journey'
      },
      {
        platform: 'Facebook Groups',
        specific: 'Couch to Fitness, Busy Moms Fitness, Our Parks',
        why: 'Community, accountability, life-stage specific',
        engagement: 'Daily posts, encourage members'
      },
      {
        platform: 'Google Search',
        specific: 'High-intent keywords about confusion and fear',
        why: 'Catch them in the moment of realization',
        engagement: 'PPC ads to app store or landing page'
      },
      {
        platform: 'Niche Blogs',
        specific: 'Nerd Fitness, Habit blogs, Health blogs',
        why: 'Education + permission to start',
        engagement: 'Guest posts, sponsorships'
      }
    ];

    return { success: true, locations };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getPlatformStrategy = async (platformData) => {
  try {
    const { audience, villain } = platformData;

    const strategies = {
      reddit: {
        format: 'Educational posts + honest answers',
        frequency: '3-5 posts/week',
        tone: 'Empathetic, detailed, scientific',
        example: 'Post answering common beginner fears'
      },
      facebook: {
        format: 'Community stories + member spotlights',
        frequency: 'Daily',
        tone: 'Warm, encouraging, celebratory',
        example: 'Member success stories with before/after mindset shift'
      },
      search: {
        format: 'High-intent keyword ads',
        keywords: 'I don\'t know where to start, fear of gym',
        landing: 'App landing page with "safe zone" messaging',
        budget: '$500-1000/month'
      },
      email: {
        format: 'Day Zero sequence - from problem to solution',
        frequency: '3-email welcome sequence',
        tone: 'Educational, empathetic, long-form'
      }
    };

    return { success: true, strategies };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== SEGMENTATION ====================

const createAudienceSegments = async (segmentData) => {
  try {
    const { audienceDescription, numberOfSegments } = segmentData;

    const segments = [
      {
        name: 'Segment 1: The Urgently Awakened',
        description: 'Just got health diagnosis',
        size: '30%',
        urgency: 'Highest',
        messaging: 'You need help NOW',
        channels: 'Search ads + retargeting'
      },
      {
        name: 'Segment 2: The Mirror Moment',
        description: 'Dissatisfied with body/energy',
        size: '50%',
        urgency: 'High',
        messaging: 'Start your identity shift',
        channels: 'Social + community'
      },
      {
        name: 'Segment 3: The Curious Explorer',
        description: 'Browsing before committing',
        size: '20%',
        urgency: 'Medium',
        messaging: 'See what\'s possible',
        channels: 'Content + niche blogs'
      }
    ];

    return { success: true, segments: segments.slice(0, numberOfSegments) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== EXPORTS ====================

module.exports = {
  generateITA,
  findRedditCommunities,
  findFacebookGroups,
  findNicheCommunities,
  generateHighIntentKeywords,
  extractInsiderLanguage,
  createPrimaryPersona,
  generateICP,
  mapAudienceLocations,
  getPlatformStrategy,
  createAudienceSegments
};
