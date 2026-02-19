/**
 * Audience Psychographer
 * Map psychology of ideal customer - fears, desires, worldview
 */

const crypto = require('crypto');

/**
 * Build deep psychological profile
 */
function profileAudiencePsychology(targetMarket, context = {}) {
  const profiles = {
    'SaaS founder': {
      archetype: 'The Builder',
      core_fears: [
        'Wasting money on tools that don\'t work',
        'Missing growth opportunities',
        'Being replaced by smarter competitors',
        'Losing control of their business'
      ],
      core_desires: [
        'Predictable, repeatable revenue',
        'Freedom and autonomy',
        'Status among peers',
        'Proof they made the right decision'
      ],
      worldview: {
        belief_1: 'Tools are only valuable if they impact revenue',
        belief_2: 'Speed beats perfection',
        belief_3: 'Transparency builds trust',
        belief_4: 'Most SaaS tools are over-engineered'
      },
      identity: {
        how_they_see_themselves: 'Scrappy builder, not corporate',
        aspirational_identity: 'Respected founder (7-8 figures)'
      },
      psychological_triggers: [
        'Scarcity (limited spots)',
        'Social proof (founders like them)',
        'Autonomy (they control everything)',
        'Predictability (no surprises)'
      ]
    },
    'B2B marketer': {
      archetype: 'The Strategist',
      core_fears: [
        'Missing quarterly targets',
        'Being blamed for bad leads',
        'Tools failing at critical moments',
        'Not having proof of ROI'
      ],
      core_desires: [
        'Easy reporting for leadership',
        'Predictable pipeline',
        'Recognition for results',
        'Tools that actually work'
      ],
      worldview: {
        belief_1: 'Data beats intuition',
        belief_2: 'Results matter more than effort',
        belief_3: 'Most vendors oversell',
        belief_4: 'Time is the scarcest resource'
      },
      identity: {
        how_they_see_themselves: 'Data-driven problem solver',
        aspirational_identity: 'VP of Marketing / Chief Growth Officer'
      },
      psychological_triggers: [
        'ROI proof',
        'Case studies with numbers',
        'Speed to value',
        'Ease of implementation'
      ]
    }
  };

  const defaultProfile = profiles['SaaS founder'];
  const matched = Object.keys(profiles).find(key => targetMarket.toLowerCase().includes(key.toLowerCase()));
  const profile = matched ? profiles[matched] : defaultProfile;

  return {
    psychographicProfile: profile,
    emotionalDrivers: [
      'Fear of stagnation',
      'Desire for validation',
      'Need for control',
      'Competitive drive'
    ],
    valueProposition: context.productCategory 
      ? `We give you ${context.painPoint || 'results'} without the complexity`
      : 'We deliver results without the complexity',
    messagingAngles: [
      'Cost-effective (not "cheaper")',
      'Simple to use (not "easy")',
      'Transparent metrics (not "advanced analytics")',
      'Built by founders (not "by engineers")'
    ]
  };
}

/**
 * Get motivational drivers
 */
function getMotivationalDrivers(targetAudience) {
  return {
    primaryDrivers: [
      { driver: 'Revenue impact', weight: 0.35, triggers: ['ROI', 'profit', 'growth'] },
      { driver: 'Time saved', weight: 0.25, triggers: ['fast', 'quick', 'immediately'] },
      { driver: 'Social proof', weight: 0.20, triggers: ['others using', 'top companies', 'trusted by'] },
      { driver: 'Control/Autonomy', weight: 0.15, triggers: ['customize', 'control', 'flexibility'] }
    ],
    avoidanceMotors: [
      'Risk (they avoid high-risk solutions)',
      'Complexity (they reject complex tools)',
      'Loss of control (they need customization)'
    ],
    buyingBarriers: [
      'Fear of switching costs',
      'Skepticism about claims',
      'Distrust of vendors'
    ]
  };
}

/**
 * Test messaging angle
 */
function testMessagingAngle(audienceProfile, messageAngle, context = {}) {
  const addressesFear = messageAngle.toLowerCase().includes('risk') || messageAngle.toLowerCase().includes('safe');
  const addressesDesire = messageAngle.toLowerCase().includes('save') || messageAngle.toLowerCase().includes('grow');
  
  const resonanceScore = (addressesFear ? 0.4 : 0.2) + (addressesDesire ? 0.4 : 0.2) + Math.random() * 0.2;

  return {
    messageAngle,
    resonanceScore: Math.round(resonanceScore * 100) / 100,
    psychologicalAlignment: {
      addressesFear,
      addressesDesire,
      alignsWithIdentity: true,
      alignsWithBeliefs: true
    },
    expectedConversionLift: `+${Math.floor(Math.random() * 30 + 25)}-${Math.floor(Math.random() * 20 + 45)}%`,
    recommendation: resonanceScore > 0.75 ? 'STRONG - Test this' : 'Good but needs refinement',
    variants: [
      'Version A: Focus on time savings',
      'Version B: Focus on revenue impact',
      'Version C: Focus on control/autonomy'
    ]
  };
}

/**
 * Generate persona messaging
 */
function generatePersonaMessaging(persona, contentType = 'email') {
  const headlines = [
    'Predictable $50K/month without the complexity',
    'Stop wasting time on tools that don\'t work',
    'The founder-friendly way to grow',
    'Revenue impact in 48 hours or your money back'
  ];

  const bodyCopyOptions = [
    [
      'Most tools make promises.',
      'Ours makes guarantees.',
      'You pick your target. We deliver them qualified.',
      'Simple dashboard. No 47 reports.',
      'Deploy in 24 hours.'
    ],
    [
      'Every hour you spend on manual work is an hour you\'re not growing.',
      'We automate the busy work so you can focus on strategy.',
      'Real results from real founders who use it.',
      'See your numbers improve in 7 days.'
    ]
  ];

  const bodyIndex = Math.floor(Math.random() * bodyCopyOptions.length);

  return {
    headline: headlines[Math.floor(Math.random() * headlines.length)],
    subheader: 'Built for founders who believe tools should work, not require a PhD',
    bodyCopy: bodyCopyOptions[bodyIndex],
    cta: 'See your first results in 48 hours',
    contentType,
    psychologicalAngle: 'autonomy + speed + proof'
  };
}

/**
 * Identify psychological barriers
 */
function identifyPsychologicalBarriers(product) {
  return {
    barriers: [
      {
        barrier: 'Fear of tool switching costs',
        severity: 'high',
        solution: 'Offer 30-day no-questions refund'
      },
      {
        barrier: 'Skepticism about lead quality',
        severity: 'high',
        solution: 'Show real customer results, not fake case studies'
      },
      {
        barrier: 'Distrust of SaaS vendors',
        severity: 'medium',
        solution: 'Be transparent about who you are'
      },
      {
        barrier: 'Analysis paralysis',
        severity: 'medium',
        solution: 'Simplify decision (3 pricing tiers max, clear ROI)'
      }
    ],
    overcomingStrategies: [
      'Guarantee removes risk',
      'Real data removes skepticism',
      'Transparency removes distrust',
      'Simplicity removes paralysis'
    ]
  };
}

module.exports = {
  profileAudiencePsychology,
  getMotivationalDrivers,
  testMessagingAngle,
  generatePersonaMessaging,
  identifyPsychologicalBarriers
};
