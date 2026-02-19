---
name: audience-intelligence
description: Find your ideal target audience using psychographic matching. Maps brand insights to specific communities, platforms, and high-intent keywords where your audience congregates.
---

# Audience Intelligence

**Find your ideal customers by understanding their psychology, not just demographics**

## Overview

Take brand insights (villain, transformation, pain points) and map them to specific online communities, platforms, and search keywords where your target audience actually congregates.

## Features

- 🎯 **Psychographic Matching** - Match brand insights to audience psychology
- 📍 **Community Discovery** - Find Reddit, Facebook, Discord, Niche communities
- 🔑 **High-Intent Keywords** - Discover search phrases they actually use
- 📊 **Platform Mapping** - Where does this audience spend time?
- 👥 **Persona Development** - Create detailed, psychographic-based personas
- 🔄 **Transformation Arc Matching** - Map their journey, not just demographics
- 💬 **Language Mirroring** - Insider terminology they use to find them
- 🚫 **Anti-Audience** - Explicitly define who to avoid targeting
- 📈 **Audience Segmentation** - Multiple sub-segments with different messaging

## Core Functions

### Audience Discovery

```javascript
// Generate ITA (Ideal Target Audience) from brand analysis
await audienceIntel.generateITA({
  villain: 'Confusion and fear',
  transformation: { before: '...', after: '...' },
  painPoints: ['...'],
  superpower: '...'
})

// Find Reddit communities
await audienceIntel.findRedditCommunities({
  villain: 'Confusion',
  painPoint: 'Lack of plan',
  industry: 'Fitness'
})

// Find Facebook groups
await audienceIntel.findFacebookGroups({
  transformation: 'From confused to capable',
  audience: 'Beginners'
})

// Find niche blogs & communities
await audienceIntel.findNicheCommunities({
  industry: 'Fitness',
  psychographic: 'Intimidated outsider'
})

// Find Discord communities
await audienceIntel.findDiscordCommunities({
  interests: ['Habit building', 'Health']
})
```

### Keyword & Language Discovery

```javascript
// Generate high-intent search keywords
await audienceIntel.generateHighIntentKeywords({
  villain: '...',
  painPoints: ['...'],
  industry: 'Fitness'
})

// Extract insider language
await audienceIntel.extractInsiderLanguage({
  audience: 'Confused beginners',
  psychographic: 'Intimidated'
})

// Get language mirroring insights
await audienceIntel.getLanguageMirror({
  keywords: ['balanced', 'energized', 'doable'],
  industry: 'Fitness'
})

// Identify emotional triggers in language
await audienceIntel.identifyEmotionalLanguage({
  twoAMProblem: '...',
  transformation: '...'
})
```

### Persona Development

```javascript
// Create primary persona
await audienceIntel.createPrimaryPersona({
  psychographic: 'Awakened Beginner',
  villain: '...',
  transformation: '...',
  painPoints: ['...']
})

// Create secondary persona
await audienceIntel.createSecondaryPersona({
  description: 'Recovering Athlete',
  characteristics: ['...']
})

// Generate full ICP (Ideal Customer Profile)
await audienceIntel.generateICP({
  primaryPersona: persona1,
  secondaryPersona: persona2,
  antiPersona: '...'
})

// Get persona-specific messaging
await audienceIntel.getPersonaSpecificMessaging({
  persona: 'Awakened Beginner',
  villain: '...',
  transformation: '...'
})
```

### Audience Mapping

```javascript
// Map where audience congregates
await audienceIntel.mapAudienceLocations({
  psychographic: 'Intimidated outsider',
  painPoint: 'Confusion',
  villain: '...'
})

// Get platform-specific recommendations
await audienceIntel.getPlatformStrategy({
  audience: 'Awakened Beginner',
  platforms: ['Reddit', 'Facebook', 'Niche blogs']
})

// Get life-stage targeting
await audienceIntel.getLifeStageSegments({
  transformation: 'From broken to capable',
  industry: 'Fitness'
})

// Find decision-maker vs doer splits
await audienceIntel.findDecisionMakerVsDoer({
  audience: '...',
  context: '...'
})
```

### Segmentation & Strategy

```javascript
// Create audience segments
await audienceIntel.createAudienceSegments({
  audienceDescription: '...',
  numberofSegments: 3
})

// Get messaging framework per segment
await audienceIntel.getSegmentMessaging({
  segment: 'Segment 1',
  villain: '...',
  transformation: '...'
})

// Identify highest-intent segment
await audienceIntel.identifyHighestIntentSegment({
  segments: [seg1, seg2, seg3]
})

// Get channel mix per segment
await audienceIntel.getChannelMixPerSegment({
  segment: '...',
  psychographic: '...'
})
```

## Usage Example

```javascript
const audienceIntel = require('./skills/audience-intelligence');

// Step 1: Generate ITA from brand analysis
const ita = await audienceIntel.generateITA({
  villain: 'Confusion and fear in fitness',
  transformation: {
    before: 'Confused, ashamed, afraid',
    after: 'Capable, confident, ready for anything'
  },
  painPoints: ['Lack of clear plan', 'Confusion', 'Fear of judgment'],
  superpower: 'AI-powered unified fitness + nutrition',
  industry: 'Fitness'
});

console.log('Primary Persona:', ita.primaryPersona.name);

// Step 2: Find Reddit communities
const reddit = await audienceIntel.findRedditCommunities({
  villain: 'Confusion',
  painPoint: 'Lack of clear plan',
  industry: 'Fitness'
});

console.log('Reddit targets:', reddit.communities.map(c => c.name));

// Step 3: Find Facebook groups
const facebook = await audienceIntel.findFacebookGroups({
  transformation: 'From confused to capable',
  audience: 'Beginners'
});

console.log('Facebook groups:', facebook.groups.length);

// Step 4: Generate high-intent keywords
const keywords = await audienceIntel.generateHighIntentKeywords({
  villain: 'Confusion',
  painPoints: ['No plan', 'Fear of judgment'],
  industry: 'Fitness'
});

console.log('SEO keywords:', keywords.keywords.slice(0, 5));

// Step 5: Get insider language
const language = await audienceIntel.extractInsiderLanguage({
  audience: 'Confused beginners',
  psychographic: 'Intimidated'
});

console.log('Insider language:', language.phrases);

// Step 6: Create full ICP
const icp = await audienceIntel.generateICP({
  primaryPersona: ita.primaryPersona,
  secondaryPersona: ita.secondaryPersona,
  antiPersona: 'Experienced bodybuilders'
});

console.log('ICP:', icp);

// Step 7: Get platform strategy
const platformStrategy = await audienceIntel.getPlatformStrategy({
  audience: ita.primaryPersona.name,
  villain: 'Confusion'
});

console.log('Where to find them:', platformStrategy);
```

## Audience Segments (Typical)

### Primary: "The Awakened Beginner"
- Age: 30-50
- Trigger: Health diagnosis, mirror moment, or life change
- Pain: Confusion, fear of judgment
- Seeking: Safe, unified solution
- Language: "Balanced", "Energized", "Doable"

### Secondary: "The Recovering Athlete"
- Used to be active
- Out of game too long
- Seeking: Regain capability, not aesthetics
- Language: "Technique", "Logic", "Habit building"

## Platform-by-Platform Strategy

| Platform | Best For | Why |
|----------|----------|-----|
| **Reddit** | Honest questions, vulnerability | r/beginnerfitness, r/FitnessOver40 |
| **Facebook Groups** | Community, accountability | "Couch to Fitness", life-stage groups |
| **Niche Blogs** | Education, permission | Nerd Fitness, habit blogs |
| **Search Ads** | High intent | "I'm 40 and don't know where to start" |
| **Pinterest** | Inspiration, aspiration | Health, wellness, transformation pins |

## Integration Points

- **Brand Identity Generator** - Uses villain, transformation, pain points
- **Marketing Copy Generator** - Uses personas, language, platform insights
- **Social Media Scheduler** - Uses platform strategy, language
- **Competitor Intelligence** - Validate audience positioning vs competitors

## Expected Output

- Primary + Secondary Personas (detailed, psychographic)
- Ideal Customer Profile (ICP)
- Anti-Persona (explicit exclusions)
- High-intent keyword list (100+)
- Platform strategy (where to target)
- Community recommendations (Reddit, Facebook, Niche)
- Language mirroring guide
- Audience segmentation (3+ segments)
- Go-to-market channel mix

---

**Built by**: Jaden  
**Status**: Production Ready  
**Framework**: Psychographic Matching + Community Discovery
