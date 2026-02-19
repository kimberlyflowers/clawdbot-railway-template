const crypto = require('crypto');

// Copy templates by persona and villain
const COPY_TEMPLATES = {
  'Awakened Beginner': {
    villainValidation: "You look in the mirror and don't recognize yourself. Or maybe a health check made it real. You need to change something, but you're confused about where to start.",
    emotionalAppeal: 'You want to feel capable. You want to know that if you can do this, you can do anything.',
    safeZoneMessage: 'No judgment. No "beast mode." No dumb questions. Just smart answers.',
    transformation: 'From confused to confident. From ashamed to capable.'
  },
  'Recovering Athlete': {
    villainValidation: "You used to move with confidence. But it's been a while. And now fitness feels like a foreign language.",
    emotionalAppeal: 'You want to regain what you had. More importantly, you want to feel capable again.',
    safeZoneMessage: 'No fluff. Data-driven coaching. Habit building psychology.',
    transformation: 'From out-of-the-game to regaining capability.'
  },
  'Urgently Awakened': {
    villainValidation: "The diagnosis was a wake-up call. You don't have time for confusion. You need help NOW.",
    emotionalAppeal: 'You want immediate action. You want a plan that works TODAY.',
    safeZoneMessage: 'Quick. Efficient. No wasted motion.',
    transformation: 'From health crisis to health action.'
  }
};

// Email sequence templates
const EMAIL_SEQUENCES = {
  welcome: [
    {
      email: 1,
      name: 'The Validation',
      purpose: 'I see you. Here\'s why you\'re here.',
      subjectLineFormulas: [
        'That 2 AM thought you\'ve been having...',
        'You\'re not the only one who felt this way',
        'The reason most fitness apps don\'t work (and how we\'re different)'
      ]
    },
    {
      email: 2,
      name: 'The Safe Bridge',
      purpose: 'Here\'s how this actually works.',
      subjectLineFormulas: [
        'Why we don\'t believe in "beast mode"',
        'Your AI trainer is not a drill sergeant',
        'How we solve the confusion'
      ]
    },
    {
      email: 3,
      name: 'The Transformation',
      purpose: 'This is who you\'ll become.',
      subjectLineFormulas: [
        'The identity shift that changes everything',
        'Beyond the 10 pounds',
        'What happens after your first win'
      ]
    }
  ]
};

// Ad copy formulas
const AD_COPY_FORMULAS = {
  'Pattern Interrupt': (villain) => `Everyone else is telling you to "just work harder." We\'re not.`,
  'Curiosity Hook': (transformation) => `The moment you realize you\'re capable of anything.`,
  'Pain Focus': (villain) => `Tired of being confused about fitness?`,
  'Benefit Focus': (transformation) => `Feel confident. Feel capable. Feel like yourself again.`,
  'Social Proof': (audience) => `Thousands of ${audience} are transforming their identity.`
};

// State
const state = {
  emailSequences: new Map(),
  adCampaigns: new Map(),
  landingPages: new Map()
};

// ==================== EMAIL SEQUENCES ====================

const generateWelcomeSequence = async (sequenceData) => {
  try {
    const { persona, villain, transformation, emails } = sequenceData;
    const template = COPY_TEMPLATES[persona];

    const emailSequence = {
      id: crypto.randomUUID(),
      persona,
      emails: []
    };

    const emailTemplates = EMAIL_SEQUENCES.welcome.slice(0, emails);

    emailTemplates.forEach((emailTemplate, idx) => {
      const subjectLine = emailTemplate.subjectLineFormulas[0];
      
      let opening = '';
      if (idx === 0) {
        opening = template.villainValidation;
      } else if (idx === 1) {
        opening = template.safeZoneMessage;
      } else {
        opening = `You're not just transforming your body. You're transforming your identity.`;
      }

      const email = {
        sequence: idx + 1,
        subject: subjectLine,
        opening,
        body: generateEmailBody(emailTemplate.purpose, template, transformation),
        cta: generateCTA(persona, emailTemplate.name),
        readTime: '2-3 min'
      };

      emailSequence.emails.push(email);
    });

    state.emailSequences.set(emailSequence.id, emailSequence);

    return { success: true, sequence: emailSequence };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const generateEmailBody = (purpose, template, transformation) => {
  if (purpose.includes('I see you')) {
    return `${template.villainValidation}\n\nWe built this app because we felt it too.\n\n${template.emotionalAppeal}`;
  } else if (purpose.includes('works')) {
    return `Most fitness apps assume you're already an athlete.\n\n${template.safeZoneMessage}\n\nThat's how we're different.`;
  } else {
    return `Before: ${transformation.before}\n\nAfter: ${transformation.after}\n\nThis isn't just a feature upgrade. It's who you become.`;
  }
};

const generateCTA = (persona, emailName) => {
  const ctas = {
    'The Validation': 'See how it works →',
    'The Safe Bridge': 'Start your safe-zone transformation →',
    'The Transformation': 'Join the movement →'
  };
  return ctas[emailName] || 'Get started →';
};

const generateDayZeroEmail = async (dayZeroData) => {
  try {
    const { persona, twoAMProblem, solution } = dayZeroData;

    const email = {
      subject: `This stops today: ${twoAMProblem.substring(0, 40)}...`,
      opening: `I know what's keeping you up at night: "${twoAMProblem}"`,
      body: `You're not alone. And here's the truth: you don't need another app. You need a unified plan.\n\n${solution} is how we solve this.`,
      cta: 'Stop the spiral. Start the plan. →',
      urgency: 'High'
    };

    return { success: true, email };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== AD COPY ====================

const generateSocialAds = async (adData) => {
  try {
    const { platform, persona, villain, adObjective } = adData;
    const template = COPY_TEMPLATES[persona];

    const adVariations = [
      {
        variation: 1,
        type: 'Pattern Interrupt',
        headline: 'Everyone Says "Just Work Harder." We Don\'t.',
        body: `${template.villainValidation}\n\nWe\'re fighting ${villain}. And we\'re winning.`,
        cta: 'Try Free',
        primaryText: template.safeZoneMessage
      },
      {
        variation: 2,
        type: 'Curiosity Hook',
        headline: 'From "Why Can\'t I Do This?" to "I Can Do Anything"',
        body: `The moment you realize you\'re capable.\n\n${template.emotionalAppeal}`,
        cta: 'See the Transformation',
        primaryText: 'Unified AI fitness + nutrition'
      },
      {
        variation: 3,
        type: 'Pain Focus',
        headline: `Tired of Confusion About Fitness?`,
        body: template.safeZoneMessage,
        cta: 'Stop the Confusion',
        primaryText: 'No judgment. No dumb questions. Smart answers.'
      }
    ];

    // Platform-specific sizing
    if (platform === 'Facebook') {
      adVariations.forEach(ad => {
        ad.imageCaption = `Join thousands transforming their identity.`;
      });
    } else if (platform === 'Instagram') {
      adVariations.forEach(ad => {
        ad.hashtags = '#FitnessApp #BeginnerFriendly #AITrainer #SafeZone';
      });
    }

    return { success: true, platform, variations: adVariations };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const generateSearchAds = async (searchData) => {
  try {
    const { persona, keywords, angle } = searchData;
    const template = COPY_TEMPLATES[persona];

    const searchAds = keywords.map(keyword => ({
      keyword,
      headlines: [
        `Fitness for Complete Beginners | No Gym Needed`,
        `AI Trainer + Nutrition | Safe Zone Method`,
        `Confused About Where to Start? We Help`
      ],
      descriptions: [
        angle === 'pain-focused' ? 
          `Stop the confusion. Get a clear, unified plan. No judgment.` :
          `Join thousands transforming from confused to capable.`
      ],
      displayUrl: 'app.fitnessapp.com',
      finalUrl: 'https://app.fitnessapp.com/download'
    }));

    return { success: true, searchAds };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const generateVideoAds = async (videoData) => {
  try {
    const { length, persona, hook } = videoData;
    const template = COPY_TEMPLATES[persona];

    const scripts = {
      '6-second': [
        `[0-2s] Show mirror moment or health scare\n[2-4s] "${template.emotionalAppeal}"\n[4-6s] CTA: "Download now"`,
        `[0-2s] Show confusion/overwhelm\n[2-4s] "Your AI trainer just arrived"\n[4-6s] CTA: "Free trial"`
      ],
      '15-second': [
        `[0-3s] Opening hook about ${persona}\n[3-10s] Problem + Solution\n[10-15s] CTA + Social proof`
      ]
    };

    return {
      success: true,
      length,
      scripts: scripts[length] || scripts['6-second'],
      voiceoverTone: 'Empathetic, direct, hopeful'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== LANDING PAGE COPY ====================

const generateHeroSection = async (heroData) => {
  try {
    const { villain, transformation, persona, positioning } = heroData;
    const template = COPY_TEMPLATES[persona];

    const hero = {
      headline: `From "${transformation.before.split(',')[0]}" to "${transformation.after.split(',')[0]}"`,
      subheadline: template.emotionalAppeal,
      supportText: `${positioning}\n\n${template.safeZoneMessage}`,
      cta: 'Start Your Transformation (Free)',
      secondaryCTA: 'See How It Works'
    };

    return { success: true, hero };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const generatePainPointSection = async (painData) => {
  try {
    const { painPoints, persona } = painData;

    const painSection = {
      heading: 'The Problem With Every Other Approach',
      problems: painPoints.map(pain => ({
        pain,
        why: `This keeps you from ${pain === 'Confusion' ? 'starting' : pain === 'Fear of judgment' ? 'showing up' : 'committing'}`
      })),
      sectionCTA: 'Here\'s how we solve it →'
    };

    return { success: true, painSection };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const generateObjectionHandling = async (objectionData) => {
  try {
    const { commonObjections, persona } = objectionData;

    const objectionResponses = {
      'I don\'t have time': 'Start with 10 minutes. That\'s it. The app adapts to YOUR schedule, not the other way around.',
      'I\'m too old / out of shape': 'This app was built for you. We\'re fighting the myth that fitness has an age limit.',
      'I don\'t want to go to a gym': 'Neither did we. Everything works at home. No equipment needed.',
      'I\'ve failed before': 'Exactly. That\'s why we built habit-forming psychology into the app. It\'s not willpower—it\'s design.',
      'I\'m confused about nutrition': 'That\'s the whole point. Your AI trainer handles both. One brain. One plan.'
    };

    const objectionSectionCopy = commonObjections.map(obj => ({
      objection: obj,
      response: objectionResponses[obj] || 'We have a solution for that.'
    }));

    return { success: true, objectionSection: objectionSectionCopy };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== MESSAGING FRAMEWORKS ====================

const generateAIDA = async (aidaData) => {
  try {
    const { Attention, Interest, Desire, Action } = aidaData;

    const aida = {
      A: `Headline that stops the scroll: "${Attention}"`,
      I: `Build curiosity: "Here\'s why this is different..."`,
      D: `Appeal to the secret ambition: "${Desire}"`,
      A: `Clear, low-friction call to action: "${Action}"`,
      copy: `${Attention}\n\n${Interest}\n\n${Desire}\n\n${Action}`
    };

    return { success: true, aida };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const generatePAS = async (pasData) => {
  try {
    const { problem, agitate, solve } = pasData;

    const pas = {
      P: `Introduce the problem: "${problem}"`,
      A: `Agitate the pain: "${agitate}"`,
      S: `Present the solution: "${solve}"`,
      fullCopy: `PROBLEM: ${problem}\n\nAGITATE: What keeps you up at night? ${agitate}\n\nSOLVE: ${solve}`
    };

    return { success: true, pas };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const generatePersonaCTAs = async (ctaData) => {
  try {
    const { persona, psychographic, options } = ctaData;

    const ctas = {
      'High-pressure': `Do This Now (Limited Spots)`,
      'Low-friction': `Start Free (No Card)`,
      'Educational': `See How It Works`
    };

    const ctaVariations = options.map(opt => ({
      style: opt,
      copy: ctas[opt],
      psychology: `${psychographic}-driven ${opt} approach`
    }));

    return { success: true, ctaVariations };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== EXPORTS ====================

module.exports = {
  generateWelcomeSequence,
  generateDayZeroEmail,
  generateSocialAds,
  generateSearchAds,
  generateVideoAds,
  generateHeroSection,
  generatePainPointSection,
  generateObjectionHandling,
  generateAIDA,
  generatePAS,
  generatePersonaCTAs
};
