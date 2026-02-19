---
name: brand-identity-generator
description: Deep psychological brand discovery through expert-guided interviews. Generates complete brand narratives, archetypes, value propositions, and positioning statements based on founder psychology and market villains.
---

# Brand Identity Generator

**Strategic brand discovery through psychological interviewing**

## Overview

Conduct deep founder interviews using psychological frameworks (archetypal theory, emotional triggers, transformation narratives) to uncover brand essence, then generate a complete brand identity including voice, positioning, and narrative.

## Features

- 🎭 **Archetypal Framework** - Discover brand personality using Jungian archetypes
- 💔 **Villain Identification** - What is the brand fighting against (not just what it's selling)?
- 🔄 **Transformation Arc** - Map the "before/after" journey of the customer
- 🗣️ **Voice & Tone** - Identify exact personality, language style, boundaries
- 📍 **Positioning Statement** - "Only" statement + superpower + sacrifice
- 📖 **Brand Narrative** - Write the complete origin story & mission
- 🎯 **North Star Vision** - 10-year impact statement
- 🚫 **Anti-Persona** - Explicit definition of who they're NOT for
- 🧠 **Psychological Depth** - Go beyond surface features to deep needs
- 📊 **Brand Audit** - Self-assessment of brand consistency

## Core Functions

### Interview Engine

```javascript
// Get interview questions based on business type
await brandGenerator.getInterviewQuestions({
  industry: 'SaaS',  // or 'Fitness', 'Finance', 'Health', etc.
  depth: 'comprehensive'  // or 'quick'
})

// Process interview answers
await brandGenerator.processInterviewAnswers({
  industry: 'SaaS',
  answers: {
    theVillain: 'Complexity and confusion',
    dayZeroMoment: '...',
    // ... all answers from interview
  }
})

// Get follow-up questions based on initial answers
await brandGenerator.getFollowUpQuestions({
  previousAnswers: answers,
  focusArea: 'audience' // or 'voice', 'positioning'
})
```

### Brand Analysis

```javascript
// Generate complete brand analysis
await brandGenerator.analyzeBrand({
  interviewAnswers: answers
})
// Returns: {
//   villain, northStar, transformation,
//   voiceArchetype, positioningStatement,
//   brandNarrative, uniqueSuperpowers
// }

// Identify the brand archetype
await brandGenerator.getArchetype({
  answers: answers
})
// Returns: Hero, Mentor, Shadow, Lover, Creator, etc.

// Extract the "Only" statement
await brandGenerator.generateOnlyStatement({
  superpower: '...',
  audience: '...',
  sacrifice: '...',
  location: '...'
})

// Generate brand narrative
await brandGenerator.generateBrandNarrative({
  villain: 'Confusion',
  originStory: '...',
  northStar: '...',
  transformation: '...'
})

// Define anti-persona
await brandGenerator.defineAntiPersona({
  answers: answers
})
// Returns: Who they are NOT for
```

### Voice & Tone

```javascript
// Identify voice archetype
await brandGenerator.getVoiceArchetype({
  coachStyle: 'data-driven with empathy',
  formality: 'long-form encouragement',
  boundaries: '...'
})

// Generate voice guidelines
await brandGenerator.generateVoiceGuidelines({
  archetype: 'Mentor',
  threeAdjectives: ['Clear', 'Compassionate', 'Scientific'],
  examples: {
    thisNotThat: [
      { this: 'Confident', notThat: 'Arrogant' },
      { this: 'Friendly', notThat: 'Casual' }
    ]
  }
})

// Get "insider language" for the audience
await brandGenerator.getInsiderLanguage({
  audience: 'Business entrepreneurs',
  painPoints: ['Confusion', 'Lack of time']
})
```

### Positioning & Differentiation

```javascript
// Generate positioning statement
await brandGenerator.generatePositioningStatement({
  category: 'Fitness App',
  superpower: 'AI + Nutrition unified',
  audience: 'Confused beginners',
  location: 'San Antonio',
  sacrifice: 'Not for bodybuilders'
})

// Identify superpowers
await brandGenerator.identifySuperpowers({
  answers: answers,
  market: 'fitness'
})

// Define what they're saying NO to
await brandGenerator.defineNOs({
  answers: answers,
  industry: 'fitness'
})
```

### Audience Insight

```javascript
// Extract hidden audience friction
await brandGenerator.extractAudienceFriction({
  answers: answers
})
// Returns: Real pain points beyond "no time"

// Map transformation arc
await brandGenerator.mapTransformationArc({
  beforeState: '...',
  afterState: '...',
  trigger: '...'
})

// Identify "2 AM problem"
await brandGenerator.get2AMProblem({
  answers: answers
})
// Returns: The thought that keeps them awake

// Get audience motivation
await brandGenerator.getSecretAmbition({
  answers: answers
})
// Returns: What they want but are afraid to say
```

### Brand Narrative Generation

```javascript
// Generate complete brand story
await brandGenerator.generateCompleteBrandStory({
  answers: answers,
  industry: 'fitness'
})
// Returns: Full narrative, origin, mission, vision

// Generate elevator pitch
await brandGenerator.generateElevatorPitch({
  positioning: positioningStatement,
  villain: villain,
  narrative: narrative
})
// 30 seconds, 60 seconds, 2 minutes versions

// Generate "founding members" narrative
await brandGenerator.generateFoundingMembersNarrative({
  answers: answers,
  isMovement: true
})

// Generate North Star vision
await brandGenerator.generateNorthStar({
  tenYearGoal: '...',
  howWorldChanges: '...'
})
```

### Brand Assessment

```javascript
// Audit brand consistency
await brandGenerator.auditBrandConsistency({
  brandNarrative: narrative,
  voiceGuidelines: guidelines,
  positioning: positioning
})
// Returns: Consistency score, gaps, recommendations

// Identify brand strengths & gaps
await brandGenerator.identifyBrandGaps({
  answers: answers,
  market: 'fitness'
})

// Compare to competitor archetypes
await brandGenerator.compareToCompetitors({
  yourArchetype: archetype,
  yourVillain: villain,
  industry: 'fitness'
})
```

## Usage Example

```javascript
const brandGen = require('./skills/brand-identity-generator');

// Step 1: Get interview questions
const questions = await brandGen.getInterviewQuestions({
  industry: 'SaaS',
  depth: 'comprehensive'
});

console.log('Interview questions:', questions);

// Step 2: Collect founder answers (in real world, this is a conversation)
const answers = {
  theVillain: 'Complexity and configuration paralysis',
  dayZeroMoment: 'Watching enterprises waste 6 months on implementation',
  identityShift: 'From "confused decision maker" to "confident operator"',
  // ... rest of answers
};

// Step 3: Process answers and get analysis
const analysis = await brandGen.analyzeBrand({
  interviewAnswers: answers
});

console.log('Brand Villain:', analysis.villain);
console.log('Brand Archetype:', analysis.voiceArchetype);
console.log('North Star:', analysis.northStar);

// Step 4: Generate complete narrative
const narrative = await brandGen.generateCompleteBrandStory({
  answers: answers,
  industry: 'SaaS'
});

console.log('Brand Story:', narrative);

// Step 5: Generate positioning
const positioning = await brandGen.generatePositioningStatement({
  category: analysis.category,
  superpower: analysis.superpower,
  audience: analysis.primaryAudience,
  sacrifice: analysis.sacrifice
});

console.log('Only Statement:', positioning);

// Step 6: Generate voice guidelines
const voice = await brandGen.generateVoiceGuidelines({
  archetype: analysis.voiceArchetype,
  threeAdjectives: analysis.threeAdjectives,
  examples: analysis.voiceBoundaries
});

console.log('Voice Guidelines:', voice);

// Step 7: Map audience transformation
const audience = await brandGen.mapTransformationArc({
  beforeState: analysis.customerBefore,
  afterState: analysis.customerAfter,
  trigger: analysis.emotionalTrigger
});

console.log('Transformation Arc:', audience);
```

## Psychological Frameworks

### Jungian Archetypes (Voice Personality)
- Hero: Bold, courageous, action-oriented
- Mentor: Wise, guiding, educational
- Lover: Passionate, intimate, emotional connection
- Creator: Visionary, innovative, generative
- Shadow: Rebellious, breaking norms, provocative

### Emotional Trigger Mapping
- The Villain: What are they fighting?
- The 2 AM Problem: The anxiety/fear they wake up with
- The Transformation: Identity shift from before/after
- The North Star: The 10-year vision of impact

### Audience Psychology
- Day Zero: The moment they realized change was necessary
- Hidden Friction: Real pain points beyond surface complaints
- Secret Ambition: What they want but fear admitting
- Insider Language: How they talk to each other

## Integration Points

- **Audience Intelligence** - Use brand analysis to find target audience
- **Marketing Copy Generator** - Use brand narrative for all copy
- **Social Media Scheduler** - Use voice guidelines for tone
- **Competitor Intelligence** - Compare archetypes vs competitors
- **GHL** - Store brand profiles for future reference

## Configuration

```bash
# Interview depth levels
INTERVIEW_DEPTH=comprehensive  # or 'quick', 'medium'

# Industry profiles
SUPPORTED_INDUSTRIES=SaaS,Fitness,Finance,Health,E-commerce,B2B,Creator

# Archetype system
ARCHETYPE_SYSTEM=Jungian  # Psychological framework
```

## Expected Output

A complete Brand Identity document including:
- Brand Villain & North Star
- Voice Archetype & Guidelines
- Positioning Statement ("Only" formula)
- Brand Narrative (500+ words)
- Customer Transformation Arc
- Anti-Persona (who they're NOT for)
- Audience Psychographics
- Competitive Positioning
- Foundational Marketing Framework

---

**Built by**: Jaden  
**Status**: Production Ready  
**Framework**: Jungian Archetypes + Psychological Profiling + Narrative Design
