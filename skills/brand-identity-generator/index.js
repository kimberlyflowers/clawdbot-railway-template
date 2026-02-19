const crypto = require('crypto');

// Psychological frameworks and industry-specific knowledge
const INDUSTRY_FRAMEWORKS = {
  'SaaS': {
    commonVillains: ['Complexity', 'Implementation paralysis', 'Data silos', 'Vendor lock-in'],
    archetypeTendencies: 'Mentor, Creator',
    painPoints: ['Time to value', 'Integration friction', 'User adoption'],
    keywords: ['Streamline', 'Simplify', 'Automate', 'Integrate']
  },
  'Fitness': {
    commonVillains: ['Confusion', 'Shame', 'Toxic gym culture', 'Overwhelm'],
    archetypeTendencies: 'Mentor, Hero, Coach',
    painPoints: ['Lack of plan', 'Fear of judgment', 'No time', 'Failure history'],
    keywords: ['Safe', 'Balanced', 'Capable', 'Energized']
  },
  'Finance': {
    commonVillains: ['Fear', 'Jargon', 'Betrayal', 'Powerlessness'],
    archetypeTendencies: 'Mentor, Creator',
    painPoints: ['Distrust', 'Complexity', 'Inadequacy'],
    keywords: ['Transparent', 'Empowering', 'Clear', 'Aligned']
  },
  'Health': {
    commonVillains: ['Despair', 'Stigma', 'Misinformation', 'Isolation'],
    archetypeTendencies: 'Mentor, Lover, Hero',
    painPoints: ['Loneliness', 'Uncertainty', 'Side effects'],
    keywords: ['Whole-person', 'Evidence-based', 'Compassionate', 'Hope']
  },
  'E-commerce': {
    commonVillains: ['Clutter', 'Waste', 'Emptiness', 'Inauthenticity'],
    archetypeTendencies: 'Creator, Lover',
    painPoints: ['Choice paralysis', 'Quality doubt', 'Sustainability guilt'],
    keywords: ['Intentional', 'Authentic', 'Curated', 'Meaningful']
  }
};

const JUNGIAN_ARCHETYPES = {
  Hero: {
    essence: 'Bold, courageous, action-driven',
    languageStyle: 'Short commands, motivational, urgent',
    example: 'Just Do It (Nike)'
  },
  Mentor: {
    essence: 'Wise, guiding, educational',
    languageStyle: 'Explanatory, patient, depth-focused',
    example: 'We believe in...'
  },
  Lover: {
    essence: 'Passionate, emotional, connection-focused',
    languageStyle: 'Intimate, poetic, feeling-based',
    example: 'Feel the difference'
  },
  Creator: {
    essence: 'Visionary, innovative, generative',
    languageStyle: 'Imaginative, possibilities-focused',
    example: 'The future is...'
  },
  Shadow: {
    essence: 'Rebellious, norm-breaking, provocative',
    languageStyle: 'Direct, irreverent, boundary-pushing',
    example: 'Breaking the rules'
  }
};

// State
const state = {
  interviews: new Map(),
  brandProfiles: new Map(),
  narratives: new Map()
};

// ==================== INTERVIEW QUESTIONS ====================

const getInterviewQuestions = async (questionData) => {
  try {
    const { industry, depth } = questionData;
    const framework = INDUSTRY_FRAMEWORKS[industry] || INDUSTRY_FRAMEWORKS['SaaS'];

    const questions = {
      soulOfBrand: [
        "What is the specific problem or 'villain' your business is fighting? (Not just what you're selling, but what you're fighting against)",
        "Tell me about your Day Zero moment - the specific frustration that made you decide to build this",
        "If your customer reaches their goal/achieves transformation, who do they become? What's the identity shift?",
        "What is the 10-year North Star? If you achieve it, how is the world fundamentally different?"
      ],
      voiceTone: [
        "If your brand were a real person walking into a room, what would they be wearing? How would they greet people?",
        "Give me three words that describe your brand's personality. Not features—personality.",
        "Complete these statements: You are ___ but not ___. Give me 3 examples.",
        "If your brand saw someone struggling with your core offering, what would it say to them?"
      ],
      audience: [
        "What is the one thing your target audience wants to achieve but is afraid to say out loud?",
        "What specific 'insider' terms or phrases does your audience use when talking to each other?",
        "Besides the obvious pain point, what is the hidden friction keeping them from success?",
        "What is the 2 AM problem—the thought that keeps them awake at night?"
      ],
      position: [
        "Complete this: We are the ONLY [Category] that [Superpower] for [Audience] in [Location/Market]",
        "What is a common industry practice you are willing to give up or say NO to?",
        "Who are you explicitly NOT for? Define your anti-persona.",
        "What is the one thing you do better than anyone else in your market?"
      ]
    };

    if (depth === 'quick') {
      return {
        success: true,
        questions: {
          soulOfBrand: questions.soulOfBrand.slice(0, 2),
          voiceTone: questions.voiceTone.slice(0, 2),
          audience: questions.audience.slice(0, 2),
          position: questions.position.slice(0, 2)
        }
      };
    }

    return { success: true, questions };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getFollowUpQuestions = async (followUpData) => {
  try {
    const { focusArea, previousAnswers } = followUpData;

    const followUpMap = {
      villain: [
        "Is there an emotional core to this villain? (e.g., shame, fear, confusion?)",
        "Who perpetuates or reinforces this villain in the market?",
        "What would winning against this villain look like for your customer?"
      ],
      audience: [
        "What is the tipping point moment when they realize they need help?",
        "What does success look like in their vocabulary, not yours?",
        "What identity do they want to claim after transformation?"
      ],
      voice: [
        "What are your brand's 'non-negotiables' in how it communicates?",
        "What tone would feel false or inauthentic for your brand?",
        "How formal vs. casual should the voice be?"
      ],
      position: [
        "Why would a skeptical customer believe YOU are the one to help them?",
        "What would make someone choose you over the next best alternative?"
      ]
    };

    const questions = followUpMap[focusArea] || followUpMap.audience;
    return { success: true, followUpQuestions: questions };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== BRAND ANALYSIS ====================

const analyzeBrand = async (analysisData) => {
  try {
    const { interviewAnswers, industry } = analysisData;
    const framework = INDUSTRY_FRAMEWORKS[industry] || INDUSTRY_FRAMEWORKS['SaaS'];

    // Extract key insights
    const villain = interviewAnswers.theVillain || 'Unknown challenge';
    const northStar = interviewAnswers.northStar || 'To make impact';
    const dayZero = interviewAnswers.dayZeroMoment || '';
    const identityShift = interviewAnswers.identityShift || '';
    const superpower = interviewAnswers.superpower || 'Unique value';
    const sacrifice = interviewAnswers.sacrifice || 'Not applicable';
    const archetype = detectArchetype(interviewAnswers);

    // Analyze transformation arc
    const beforeState = interviewAnswers.beforeState || 'Struggling, confused';
    const afterState = interviewAnswers.afterState || 'Capable, confident';
    const emotionalTrigger = interviewAnswers.twoAMProblem || 'Unknown';

    const analysis = {
      villain,
      northStar,
      dayZeroMoment: dayZero,
      identityShift,
      superpower,
      sacrifice,
      voiceArchetype: archetype,
      customerBefore: beforeState,
      customerAfter: afterState,
      emotionalTrigger,
      threeAdjectives: extractThreeAdjectives(interviewAnswers),
      voiceBoundaries: extractVoiceBoundaries(interviewAnswers),
      primaryAudience: interviewAnswers.audience || 'Not specified',
      antiPersona: interviewAnswers.antiPersona || 'Not specified',
      secretAmbition: interviewAnswers.secretAmbition || '',
      insiderLanguage: interviewAnswers.insiderLanguage || []
    };

    const id = crypto.randomUUID();
    state.brandProfiles.set(id, analysis);

    return { success: true, analysisId: id, ...analysis };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const detectArchetype = (answers) => {
  const villain = (answers.theVillain || '').toLowerCase();
  const voiceStyle = (answers.voiceArchetype || '').toLowerCase();

  if (voiceStyle.includes('drill') || voiceStyle.includes('bold') || voiceStyle.includes('action')) {
    return 'Hero';
  }
  if (voiceStyle.includes('guide') || voiceStyle.includes('educate') || voiceStyle.includes('mentor')) {
    return 'Mentor';
  }
  if (voiceStyle.includes('passion') || voiceStyle.includes('emotion') || voiceStyle.includes('connection')) {
    return 'Lover';
  }
  if (voiceStyle.includes('innovate') || voiceStyle.includes('future') || voiceStyle.includes('vision')) {
    return 'Creator';
  }
  if (voiceStyle.includes('rebel') || voiceStyle.includes('break') || voiceStyle.includes('provoke')) {
    return 'Shadow';
  }
  
  // Default based on villain
  if (villain.includes('confusion') || villain.includes('fear')) {
    return 'Mentor';
  }
  if (villain.includes('laziness') || villain.includes('inaction')) {
    return 'Hero';
  }
  
  return 'Creator';
};

const extractThreeAdjectives = (answers) => {
  const adjectives = answers.threeAdjectives || '';
  if (typeof adjectives === 'string') {
    return adjectives.split(',').map(a => a.trim()).slice(0, 3);
  }
  return adjectives.slice(0, 3);
};

const extractVoiceBoundaries = (answers) => {
  const boundaries = answers.thisNotThat || {};
  return [
    { this: 'Clear', notThat: 'Confusing' },
    { this: 'Confident', notThat: 'Arrogant' },
    { this: 'Friendly', notThat: 'Casual' }
  ];
};

// ==================== VOICE & TONE ====================

const generateVoiceGuidelines = async (voiceData) => {
  try {
    const { archetype, threeAdjectives, examples } = voiceData;
    const archetypeProfile = JUNGIAN_ARCHETYPES[archetype] || JUNGIAN_ARCHETYPES.Mentor;

    const guidelines = {
      archetype,
      essence: archetypeProfile.essence,
      languageStyle: archetypeProfile.languageStyle,
      doAdjectives: threeAdjectives,
      dontBe: ['Generic', 'Corporate', 'Inauthentic'],
      boundaries: examples?.thisNotThat || [
        { this: 'Professional', notThat: 'Stuffy' },
        { this: 'Warm', notThat: 'Unprofessional' }
      ],
      toneExamples: {
        doSay: 'Example speaking to their pain directly',
        dontSay: 'Generic corporate speak'
      },
      voiceInAction: {
        emailOpening: generateEmailOpening(archetype),
        socialPost: generateSocialPost(archetype),
        supportResponse: generateSupportResponse(archetype)
      }
    };

    return { success: true, guidelines };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const generateEmailOpening = (archetype) => {
  const openings = {
    Hero: "Let's do this. No more waiting.",
    Mentor: "Let me show you how this works...",
    Lover: "We're so glad you're here.",
    Creator: "Imagine if you could...",
    Shadow: "Everyone else is doing it wrong. We're not."
  };
  return openings[archetype] || openings.Mentor;
};

const generateSocialPost = (archetype) => {
  const posts = {
    Hero: "Your move. What are you waiting for?",
    Mentor: "Here's what we learned this week...",
    Lover: "Our community just hit a milestone and we're celebrating together",
    Creator: "The future of [industry] just changed",
    Shadow: "The industry doesn't want you to know this"
  };
  return posts[archetype] || posts.Mentor;
};

const generateSupportResponse = (archetype) => {
  const responses = {
    Hero: "Got it. Here's the fastest path to solving this.",
    Mentor: "Great question. Let me break this down for you...",
    Lover: "We totally understand your frustration. Here's how we'll help...",
    Creator: "This is a perfect opportunity to do something different.",
    Shadow: "Everyone struggles with this. Here's the real solution."
  };
  return responses[archetype] || responses.Mentor;
};

// ==================== POSITIONING ====================

const generatePositioningStatement = async (positionData) => {
  try {
    const { category, superpower, audience, location, sacrifice } = positionData;

    const onlyStatement = `We are the ONLY ${category} that ${superpower} for ${audience}${location ? ` in ${location}` : ''}.`;

    const positioning = {
      onlyStatement,
      category,
      superpower,
      audience,
      location,
      whyBelieve: `We ${superpower} because ${sacrifice || 'we focus exclusively on'}`,
      whatWeAreNotFor: `We are NOT for ${sacrifice || 'those seeking generic solutions'}.`
    };

    return { success: true, positioning };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const identifySuperpowers = async (powersData) => {
  try {
    const { answers, market } = powersData;
    const framework = INDUSTRY_FRAMEWORKS[market];

    const superpowers = [
      {
        power: answers.superpower || 'Unique expertise',
        evidence: answers.dayZeroMoment || 'Deep market understanding',
        claim: 'Only we can do this because...'
      }
    ];

    return { success: true, superpowers };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== NARRATIVE GENERATION ====================

const generateCompleteBrandStory = async (storyData) => {
  try {
    const { answers, industry } = storyData;
    const framework = INDUSTRY_FRAMEWORKS[industry];

    const narrative = `
## Our Story

### The Day Zero Moment
${answers.dayZeroMoment || 'We saw a problem that needed solving.'}

### What We're Fighting
Every day, our customers face ${answers.theVillain || 'a challenge'} that keeps them from ${answers.secretAmbition || 'reaching their potential'}.

Our founder experienced this firsthand. And decided to do something about it.

### The Transformation We Enable
Before finding us, customers feel: ${answers.beforeState || 'stuck and unsure'}.

After: They become ${answers.identityShift || 'capable and confident'}.

This isn't just a feature upgrade. It's an identity shift.

### Our North Star
In 10 years, if we've succeeded, the world will be ${answers.northStar || 'fundamentally different'}. 

${answers.insiderLanguage ? `Our audience speaks in the language of "${answers.insiderLanguage[0]}"—and we honor that.` : ''}

### Why This Matters
${answers.twoAMProblem || 'The problem is real, the stakes are high, and we believe transformation is possible.'} 

We're building a movement, not just a product.
    `;

    return { success: true, narrative: narrative.trim() };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const generateElevatorPitch = async (pitchData) => {
  try {
    const { positioning, villain, narrative } = pitchData;

    const pitches = {
      thirtySeconds: `${positioning.onlyStatement} We solve the problem of ${villain}.`,
      sixtySeconds: `${positioning.onlyStatement} We solve the problem of ${villain}. Unlike others, we ${positioning.superpower}.`,
      twoMinutes: `Our story started when we realized ${villain} was holding people back from ${narrative}. So we built something different. ${positioning.onlyStatement}`
    };

    return { success: true, pitches };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== AUDIENCE INSIGHTS ====================

const mapTransformationArc = async (arcData) => {
  try {
    const { beforeState, afterState, trigger } = arcData;

    const arc = {
      beforeState: {
        description: beforeState,
        emotions: extractEmotions(beforeState),
        identity: 'The person they were'
      },
      trigger: {
        moment: trigger,
        realization: 'The moment everything changed',
        pain: 'What finally made them act'
      },
      afterState: {
        description: afterState,
        emotions: extractEmotions(afterState),
        identity: 'Who they become'
      },
      journey: 'From confusion to capability'
    };

    return { success: true, arc };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const extractEmotions = (state) => {
  const stateStr = (state || '').toLowerCase();
  const emotions = [];
  
  if (stateStr.includes('confused') || stateStr.includes('lost')) emotions.push('Confusion');
  if (stateStr.includes('shame') || stateStr.includes('embarrass')) emotions.push('Shame');
  if (stateStr.includes('fear') || stateStr.includes('afraid')) emotions.push('Fear');
  if (stateStr.includes('confident') || stateStr.includes('capable')) emotions.push('Confidence');
  if (stateStr.includes('energized') || stateStr.includes('powerful')) emotions.push('Empowerment');
  
  return emotions.length > 0 ? emotions : ['Complex emotions'];
};

const get2AMProblem = async (problemData) => {
  try {
    const { answers } = problemData;
    const problem = answers.twoAMProblem || 'The thought that keeps them awake...';

    return {
      success: true,
      problem,
      insight: 'This is what drives urgency',
      marketingHook: `The one thing keeping your audience up at night is: "${problem}"`
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getSecretAmbition = async (ambitionData) => {
  try {
    const { answers } = ambitionData;
    const ambition = answers.secretAmbition || '';

    return {
      success: true,
      secretAmbition: ambition,
      insight: 'What they want but are afraid to say',
      marketingValue: 'Appeal to this desire without shame'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== ANTI-PERSONA ====================

const defineAntiPersona = async (antiData) => {
  try {
    const { answers } = antiData;
    const sacrifice = answers.sacrifice || '';

    const antiPersona = {
      description: `We are NOT for ${sacrifice}`,
      characteristics: [
        `Looking for ${sacrifice}`,
        'Different values than our brand',
        'Will not benefit from our approach'
      ],
      why: 'To stay true to our mission, we accept we cannot serve everyone',
      benefit: 'This clarity makes our core audience feel the app was made just for them'
    };

    return { success: true, antiPersona };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== EXPORTS ====================

module.exports = {
  getInterviewQuestions,
  getFollowUpQuestions,
  analyzeBrand,
  generateVoiceGuidelines,
  generatePositioningStatement,
  identifySuperpowers,
  generateCompleteBrandStory,
  generateElevatorPitch,
  mapTransformationArc,
  get2AMProblem,
  getSecretAmbition,
  defineAntiPersona
};
