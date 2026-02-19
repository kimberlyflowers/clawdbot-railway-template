---
name: marketing-copy-generator
description: Generate tailored marketing copy using brand narrative and audience psychology. Creates email sequences, social ads, landing page copy, and messaging frameworks personalized to specific personas and pain points.
---

# Marketing Copy Generator

**Write copy that speaks directly to your audience's villain and transformation**

## Overview

Takes brand narrative (villain, transformation, voice) + audience insights (personas, pain points, language) and generates production-ready copy across all channels.

## Features

- 📧 **Email Sequences** - Multi-part welcome/onboarding sequences
- 📱 **Social Ads** - Platform-specific ad copy (Facebook, Instagram, Google)
- 🎯 **Landing Page Copy** - Hero section, pain points, CTA framework
- 💬 **Messaging Frameworks** - Repeatable templates per persona
- 🔑 **Headline Variations** - A/B testing hooks tailored to villain/transformation
- 📝 **Copywriting Formulas** - AIDA, PAS, Storytelling applied to personas
- 🎭 **Voice Consistency** - All copy follows brand voice guidelines
- 📊 **CTAs** - Persona-specific call-to-actions
- 🚀 **Positioning Statements** - Refine hero copy with "Only" formula

## Core Functions

### Email Sequences

```javascript
// Generate welcome email sequence
await copyGen.generateWelcomeSequence({
  persona: 'Awakened Beginner',
  villain: 'Confusion and fear',
  transformation: { before: '...', after: '...' },
  emails: 3  // Number of emails in sequence
})

// Generate Day Zero email (conversion moment)
await copyGen.generateDayZeroEmail({
  persona: 'Awakened Beginner',
  twoAMProblem: 'Body changing, unhappy with reflection',
  solution: 'AI trainer + unified nutrition'
})

// Generate nurture sequence (weekly tips)
await copyGen.generateNurtureSequence({
  persona: 'Recovering Athlete',
  focusArea: 'Building confidence'
})

// Generate win-back sequence (re-engagement)
await copyGen.generateWinBackSequence({
  reason: 'Churn prevention',
  transformation: '...'
})
```

### Ad Copy

```javascript
// Generate Facebook/Instagram ads
await copyGen.generateSocialAds({
  platform: 'Facebook',
  persona: 'Awakened Beginner',
  villain: 'Confusion',
  adObjective: 'app-install' // or 'conversion', 'engagement'
})

// Generate Google Search ads
await copyGen.generateSearchAds({
  persona: 'Urgently Awakened',
  keywords: ['I dont know where to start', 'fitness app for beginners'],
  angle: 'pain-focused'  // or 'benefit-focused', 'curiosity'
})

// Generate YouTube pre-roll copy
await copyGen.generateVideoAds({
  length: '6-second',
  persona: 'Mirror Moment',
  hook: 'transformation'
})

// Generate TikTok/Reels hooks
await copyGen.generateShortFormHooks({
  platform: 'TikTok',
  emotion: 'Shame to capability'
})
```

### Landing Page Copy

```javascript
// Generate hero section
await copyGen.generateHeroSection({
  villain: 'Confusion in fitness',
  transformation: 'From scared to capable',
  persona: 'Awakened Beginner',
  positioning: 'Only fitness app that combines...'
})

// Generate pain-point section
await copyGen.generatePainPointSection({
  painPoints: ['Confusion', 'Fear of judgment', 'Lack of plan'],
  persona: 'Awakened Beginner'
})

// Generate transformation section
await copyGen.generateTransformationSection({
  before: 'Confused, ashamed, afraid',
  after: 'Capable, confident, ready for anything',
  proof: 'Community stories, science'
})

// Generate objection-handling section
await copyGen.generateObjectionHandling({
  commonObjections: [
    'I dont have time',
    'I m too old/out of shape',
    'I don t want to go to a gym'
  ],
  persona: 'Awakened Beginner'
})
```

### Messaging Frameworks

```javascript
// Generate AIDA framework copy
await copyGen.generateAIDA({
  Attention: villain,
  Interest: transformation,
  Desire: secret ambition,
  Action: cta
})

// Generate PAS (Problem-Agitate-Solve) copy
await copyGen.generatePAS({
  problem: 'Confusion in fitness',
  agitate: '2 AM problem',
  solve: 'AI trainer + unified solution'
})

// Generate storytelling framework
await copyGen.generateStoryArc({
  beforeState: 'Confused',
  incitingIncident: 'Health diagnosis',
  climax: 'First successful workout',
  resolution: 'Identity shift to capable'
})
```

### CTAs & Variations

```javascript
// Generate persona-specific CTAs
await copyGen.generatePersonaCTAs({
  persona: 'Awakened Beginner',
  psychographic: 'Fear-driven',
  options: ['High-pressure', 'Low-friction', 'Educational']
})

// Generate button copy variations
await copyGen.generateButtonCopy({
  stage: 'awareness' | 'consideration' | 'decision',
  persona: 'Awakened Beginner',
  urgency: 'medium'
})
```

## Usage Example

```javascript
const copyGen = require('./skills/marketing-copy-generator');

// STEP 1: Generate email sequence
const emailSequence = await copyGen.generateWelcomeSequence({
  persona: 'Awakened Beginner',
  villain: 'Confusion and fear',
  transformation: {
    before: 'Confused, ashamed, afraid of judgment',
    after: 'Capable, confident, ready for anything'
  },
  emails: 3
});

console.log('Email 1:', emailSequence.emails[0].subject);
console.log('Email 1 Hook:', emailSequence.emails[0].opening);

// STEP 2: Generate ads for Facebook
const fbAds = await copyGen.generateSocialAds({
  platform: 'Facebook',
  persona: 'Awakened Beginner',
  villain: 'Confusion and fear',
  adObjective: 'app-install'
});

console.log('Ad Headline:', fbAds.variations[0].headline);
console.log('Ad Body:', fbAds.variations[0].body);

// STEP 3: Generate landing page
const heroSection = await copyGen.generateHeroSection({
  villain: 'Confusion in fitness',
  transformation: 'From scared to capable',
  persona: 'Awakened Beginner'
});

console.log('Hero Headline:', heroSection.headline);
console.log('Hero Subheadline:', heroSection.subheadline);

// STEP 4: Generate objection handling
const objections = await copyGen.generateObjectionHandling({
  commonObjections: [
    'I dont have time',
    'Im too old',
    'I hate gyms'
  ],
  persona: 'Awakened Beginner'
});

console.log('Objection handling:', objections.responses);
```

## Copywriting Formulas Used

| Formula | Use Case |
|---------|----------|
| **AIDA** | Ads, emails, landing pages |
| **PAS** | Pain-focused pain messages |
| **Story Arc** | Testimonials, case studies |
| **Gap Fill** | Security copy, objection handling |
| **Pattern Interrupt** | Social ads, headlines |
| **Curiosity Loop** | Email subject lines |
| **Metaphor** | Brand storytelling |

## Copy Principles for Each Persona

### Awakened Beginner
- Opens with: Validation of confusion/fear
- Uses language: Safe, supportive, educational
- Proof point: Community stories, science
- CTA: "Start your safe-zone transformation"

### Recovering Athlete
- Opens with: Recognition of capability
- Uses language: Technical, logical, data-driven
- Proof point: Efficiency, proven methods
- CTA: "Regain your capability"

### Urgently Awakened
- Opens with: Urgency trigger (health scare)
- Uses language: Direct, action-oriented, time-sensitive
- Proof point: Immediate results, quick wins
- CTA: "Start today (it takes 5 minutes)"

## Integration Points

- **Brand Identity Generator** → Uses villain, transformation, voice, narrative
- **Audience Intelligence** → Uses personas, language, pain points, platforms
- **Social Media Scheduler** → Can auto-post generated copy
- **Email Campaign Manager** → Can auto-send generated sequences
- **Competitor Intelligence** → Compare copy approach vs competitors

## Expected Output

- Email sequence (3-7 emails)
- Social ads (3-5 variations per platform)
- Landing page hero, subheadline, CTA
- Objection handling copy
- Button/CTA variations
- Messaging frameworks
- Subject line variations
- Hashtag recommendations

---

**Built by**: Jaden  
**Status**: Production Ready  
**Copywriting Method**: Psychology-based + villain/transformation framework
