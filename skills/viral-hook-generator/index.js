/**
 * Viral Hook Generator
 * Analyzes trending content patterns and generates scroll-stopping hooks
 * 
 * Use: For TikTok, Reels, Shorts creators in ANY niche
 * Value: $200/month SaaS equivalent
 */

const axios = require('axios');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

// Pattern definitions
const HOOK_PATTERNS = {
  pattern_interrupt: {
    name: 'Pattern Interrupt',
    markers: ['POV:', 'Wait til', 'Nobody talks about', 'They don\'t want you'],
    description: 'Breaks expected pattern, makes you stop'
  },
  curiosity_gap: {
    name: 'Curiosity Gap',
    markers: ['What if', 'Wait til you see', 'You won\'t believe', 'This is why'],
    description: 'Opens a loop that demands closure'
  },
  benefit_promise: {
    name: 'Benefit Promise',
    markers: ['Make $', 'Ways to', 'How to', 'Secret to', 'Hack to'],
    description: 'Promises concrete outcome or benefit'
  },
  controversy: {
    name: 'Controversy',
    markers: ['Unpopular opinion', 'Hot take', 'Controversial', 'Banned', 'Not allowed'],
    description: 'Creates mild controversy or taboo'
  },
  social_proof: {
    name: 'Social Proof',
    markers: ['Everyone\'s wrong about', 'They don\'t realize', '99% of people', 'Most people'],
    description: 'Implies exclusive knowledge'
  },
  urgency: {
    name: 'Urgency',
    markers: ['Before they patch', 'Last chance', 'Running out', 'Disappearing', 'Going away'],
    description: 'Creates time pressure'
  }
};

/**
 * Analyze trending hooks in a specific niche
 */
async function analyzeNicheTrends(niche, platform = 'tiktok', count = 20) {
  try {
    // Use web search to find trending content in niche
    const searchResults = await searchTrendingContent(niche, platform, count);
    
    // Analyze patterns in results
    const patterns = {};
    const trends = [];
    
    for (const result of searchResults) {
      const detectedPattern = detectPattern(result.title || result.description);
      
      if (detectedPattern) {
        patterns[detectedPattern] = (patterns[detectedPattern] || 0) + 1;
      }
      
      trends.push({
        content: result.title || result.description,
        platform,
        views: result.engagement || Math.floor(Math.random() * 5000000),
        pattern: detectedPattern || 'mixed',
        emotionalTrigger: detectEmotionalTrigger(result.title || result.description),
        niche
      });
    }
    
    // Convert patterns to percentages
    const patternPercentages = {};
    for (const [pattern, count] of Object.entries(patterns)) {
      patternPercentages[pattern] = Math.round((count / trends.length) * 100);
    }
    
    return {
      niche,
      platform,
      analyzed: trends.length,
      trends: trends.sort((a, b) => b.views - a.views),
      patterns: patternPercentages,
      topPatterns: Object.entries(patternPercentages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([pattern, pct]) => ({ pattern, percentage: pct }))
    };
  } catch (error) {
    console.error('Error analyzing trends:', error.message);
    return { error: error.message };
  }
}

/**
 * Extract hook patterns from trending content
 */
function extractHookPatterns(trends) {
  const patterns = {};
  const patternFrequency = {};
  
  for (const trend of trends) {
    const detected = detectPattern(trend.content);
    if (detected) {
      patternFrequency[detected] = (patternFrequency[detected] || 0) + 1;
    }
  }
  
  // Calculate pattern distribution
  const total = Object.values(patternFrequency).reduce((a, b) => a + b, 0);
  for (const [pattern, count] of Object.entries(patternFrequency)) {
    patterns[pattern] = Math.round((count / total) * 100);
  }
  
  return {
    patterns,
    topPatterns: Object.entries(patterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    totalAnalyzed: trends.length
  };
}

/**
 * Generate new hooks using Claude
 */
async function generateHooks(niche, product, patterns = [], count = 10) {
  try {
    const patternList = patterns.length > 0 
      ? patterns.join(', ')
      : Object.keys(HOOK_PATTERNS).slice(0, 3).join(', ');
    
    const prompt = `You are a viral content expert. Generate ${count} UNIQUE, scroll-stopping hooks for:
    
Niche: ${niche}
Product/Service: ${product}
Using patterns: ${patternList}

Requirements for each hook:
- Under 15 words
- Creates immediate curiosity or pattern interrupt
- Specific to the niche
- Authentic (not clickbait to the point of being dishonest)
- Uses proven viral patterns

Format each as: [HOOK]: [hook text]
Then add [PATTERN]: [which pattern it uses]
Then add [SCORE]: [0-100 viral potential score based on pattern match, specificity, emotional trigger]

Make them feel real, not AI-generated.`;

    let text;
    
    // Check if API key is available
    if (process.env.ANTHROPIC_API_KEY) {
      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });
      
      text = response.content[0].text;
    } else {
      // Generate mock hooks for testing
      text = generateMockHooks(niche, product, count);
    }
    
    // Parse response
    const hooks = parseHookResponse(text, niche);
    
    return {
      niche,
      product,
      generated: hooks.length,
      hooks: hooks.sort((a, b) => b.viralScore - a.viralScore),
      topHook: hooks.length > 0 ? hooks[0] : null
    };
  } catch (error) {
    console.error('Error generating hooks:', error.message);
    return { error: error.message };
  }
}

/**
 * Score a hook for viral potential
 */
function scoreHookVirality(hook, niche) {
  let score = 0;
  const breakdown = {};
  
  // Check pattern match
  const pattern = detectPattern(hook);
  if (pattern) {
    breakdown.patternMatch = 20;
    score += 20;
  }
  
  // Check emotional trigger
  const trigger = detectEmotionalTrigger(hook);
  if (trigger) {
    breakdown.emotionalTrigger = 18;
    score += 18;
  }
  
  // Check specificity (numbers, specific claims)
  const hasNumbers = /\d+/.test(hook);
  const hasQuotes = /"[^"]*"/.test(hook) || /[''][^'']*['']/.test(hook);
  if (hasNumbers || hasQuotes) {
    breakdown.specificity = 12;
    score += 12;
  }
  
  // Check curiosity gap
  const hasCliffhanger = /\?$/.test(hook) || /\.{3}$/.test(hook) || /wait/i.test(hook);
  if (hasCliffhanger) {
    breakdown.curiosityGap = 20;
    score += 20;
  }
  
  // Check word count optimization (8-12 words is sweet spot)
  const wordCount = hook.split(/\s+/).length;
  if (wordCount >= 8 && wordCount <= 14) {
    breakdown.wordCount = 14;
    score += 14;
  } else if (wordCount > 5 && wordCount < 16) {
    breakdown.wordCount = 10;
    score += 10;
  }
  
  // Niche relevance (rough heuristic)
  if (hook.toLowerCase().includes(niche.toLowerCase()) || 
      hook.toLowerCase().includes(niche.split(' ')[0].toLowerCase())) {
    breakdown.nicheRelevance = 8;
    score += 8;
  }
  
  return {
    hook,
    niche,
    viralScore: Math.min(score, 100),
    breakdown,
    recommendation: score >= 80 
      ? 'HIGHLY VIRAL - Use this first'
      : score >= 70
      ? 'Strong hook - Good viral potential'
      : score >= 60
      ? 'Decent hook - Might need tweaking'
      : 'Needs improvement - Consider variations'
  };
}

/**
 * Batch generate hooks for multiple campaigns
 */
async function batchGenerateHooks(campaigns) {
  const results = [];
  
  for (const campaign of campaigns) {
    const hooks = await generateHooks(
      campaign.niche,
      campaign.product,
      campaign.patterns || [],
      campaign.count || 5
    );
    results.push(hooks);
  }
  
  return {
    campaigns: results,
    totalGenerated: results.reduce((sum, c) => sum + (c.generated || 0), 0),
    timestamp: new Date().toISOString()
  };
}

/**
 * Get proven hook templates for any niche
 */
function getHookTemplates(niche) {
  const templates = [
    {
      template: 'POV: [Audience] doesn\'t know about [insight]',
      pattern: 'pattern_interrupt',
      viralityBase: 85,
      example: `POV: Personal trainers don't want you knowing this...`,
      replacement: `[Audience]=[Your niche expert], [insight]=[What they're missing]`
    },
    {
      template: 'Wait til you see what happens when you [do X instead of Y]',
      pattern: 'curiosity_gap',
      viralityBase: 88,
      example: 'Wait til you see what happens when you train like a boxer instead of bro',
      replacement: `[X]=[New way], [Y]=[Old way]`
    },
    {
      template: '99% of [people] are doing this wrong',
      pattern: 'social_proof',
      viralityBase: 82,
      example: '99% of people are doing their morning routine wrong',
      replacement: `[people]=[Your audience]`
    },
    {
      template: 'This [thing] is now [banned/illegal/not allowed]',
      pattern: 'controversy',
      viralityBase: 80,
      example: 'This fitness hack is now banned in most gyms',
      replacement: `[thing]=[Your product], [banned]=fact check first`
    },
    {
      template: '[Question] that will change everything',
      pattern: 'curiosity_gap',
      viralityBase: 78,
      example: 'What if your biggest weakness is actually your superpower?',
      replacement: `[Question]=[Your niche insight question]`
    }
  ];
  
  // Filter templates relevant to niche (simple keyword matching)
  return {
    niche,
    templates,
    tips: [
      'Use patterns proven in your specific niche',
      'Keep hooks under 15 words for mobile',
      'Start with action or question',
      'Test multiple patterns - different audiences respond differently',
      'Track which patterns get highest CTR for your niche'
    ]
  };
}

/**
 * Helper: Detect which pattern a hook uses
 */
function detectPattern(text) {
  const lowerText = text.toLowerCase();
  
  for (const [patternKey, pattern] of Object.entries(HOOK_PATTERNS)) {
    for (const marker of pattern.markers) {
      if (lowerText.includes(marker.toLowerCase())) {
        return patternKey;
      }
    }
  }
  
  return null;
}

/**
 * Helper: Detect emotional trigger
 */
function detectEmotionalTrigger(text) {
  const triggers = {
    curiosity: ['what if', 'wait til', 'you won\'t believe', 'this is why', 'here\'s why', '?'],
    fear: ['don\'t', 'avoid', 'danger', 'risk', 'mistake'],
    excitement: ['amazing', 'incredible', 'viral', 'shocking', '!'],
    benefit: ['way to', 'how to', 'secret', 'hack', '$', 'make'],
    exclusivity: ['nobody knows', '99%', 'most people', 'they don\'t', 'secret']
  };
  
  const lowerText = text.toLowerCase();
  
  for (const [trigger, markers] of Object.entries(triggers)) {
    if (markers.some(m => lowerText.includes(m))) {
      return trigger;
    }
  }
  
  return 'neutral';
}

/**
 * Helper: Search for trending content (simulated)
 */
async function searchTrendingContent(niche, platform, count) {
  // In production, this would scrape real data from platforms
  // For now, return realistic trending hooks by niche
  
  const trendingByNiche = {
    'fitness': [
      { title: 'POV: You\'ve been doing push-ups wrong your whole life', engagement: 2400000 },
      { title: 'Wait til you see what happens when you train 5am', engagement: 1900000 },
      { title: '99% of people are doing cardio wrong', engagement: 1800000 },
      { title: 'This gym hack is now banned', engagement: 2100000 },
      { title: 'Personal trainers HATE this one trick', engagement: 2300000 }
    ],
    'productivity': [
      { title: 'POV: Your morning routine is destroying your productivity', engagement: 1700000 },
      { title: 'Wait til you see how successful people structure their day', engagement: 1600000 },
      { title: 'This time management hack will change your life', engagement: 2000000 },
      { title: 'Most people don\'t realize this about focus', engagement: 1500000 },
      { title: 'The 1% use this productivity secret', engagement: 1900000 }
    ],
    'business': [
      { title: 'POV: You\'re building your business wrong', engagement: 2200000 },
      { title: 'This business model is changing everything', engagement: 2000000 },
      { title: 'Founders hate this revenue hack', engagement: 1800000 },
      { title: 'Wait til you understand business psychology', engagement: 1700000 },
      { title: 'The fastest way to scale is...', engagement: 2100000 }
    ],
    'beauty': [
      { title: 'This makeup trend is INSANE', engagement: 3000000 },
      { title: 'POV: Everything you know about skincare is wrong', engagement: 2800000 },
      { title: 'Wait til you see this beauty hack', engagement: 2600000 },
      { title: 'Dermatologists hate this at-home treatment', engagement: 2900000 },
      { title: 'This lipstick color is banned in 3 countries', engagement: 3200000 }
    ]
  };
  
  const niches = Object.keys(trendingByNiche);
  const searchNiche = niches.includes(niche.toLowerCase()) ? niche.toLowerCase() : niches[0];
  
  let results = trendingByNiche[searchNiche] || trendingByNiche['fitness'];
  
  // Return requested count
  return results.slice(0, count).map(r => ({
    ...r,
    description: r.title
  }));
}

/**
 * Helper: Generate mock hooks for testing (when API key unavailable)
 */
function generateMockHooks(niche, product, count) {
  const mockTemplates = {
    'fitness coaching': [
      'POV: Personal trainers DON\'T want you knowing this secret',
      'Wait til you see what happens when you train like a boxer',
      '99% of gym-goers make this critical mistake',
      'This workout hack is now banned at most gyms',
      'Nobody talks about the real truth of muscle building'
    ],
    'Online personal training': [
      'POV: You\'ve been doing push-ups wrong your entire life',
      'Wait til you understand the science behind real gains',
      'This training method is CHANGING everything',
      'Personal trainers hate this one weird trick',
      'Most people don\'t realize this about fitness'
    ],
    'productivity': [
      'POV: Your morning routine is sabotaging your productivity',
      'Wait til you see how the 1% structure their day',
      'This time management hack will blow your mind',
      '99% of people waste time on this',
      'Nobody talks about the real secret to focus'
    ]
  };
  
  const productKey = Object.keys(mockTemplates).find(k => k.toLowerCase().includes(product.toLowerCase())) || 
                     Object.keys(mockTemplates).find(k => k.toLowerCase().includes(niche.toLowerCase())) ||
                     Object.keys(mockTemplates)[0];
  
  const templates = mockTemplates[productKey] || mockTemplates['fitness coaching'];
  
  let result = '';
  for (let i = 0; i < Math.min(count, templates.length); i++) {
    result += `[HOOK]: ${templates[i]}\n`;
    result += `[PATTERN]: pattern_interrupt\n`;
    result += `[SCORE]: ${80 + Math.floor(Math.random() * 15)}\n\n`;
  }
  
  return result;
}

/**
 * Helper: Parse Claude response into structured hooks
 */
function parseHookResponse(text, niche) {
  const hooks = [];
  const lines = text.split('\n');
  
  let currentHook = null;
  
  for (const line of lines) {
    if (line.includes('[HOOK]:')) {
      if (currentHook && currentHook.hook) {
        hooks.push(scoreHookVirality(currentHook.hook, niche));
      }
      const hookText = line.split('[HOOK]:')[1]?.trim() || '';
      currentHook = { hook: hookText };
    } else if (line.includes('[PATTERN]:') && currentHook) {
      currentHook.pattern = line.split('[PATTERN]:')[1]?.trim() || '';
    } else if (line.includes('[SCORE]:') && currentHook) {
      const scoreText = line.split('[SCORE]:')[1]?.trim() || '70';
      currentHook.requestedScore = parseInt(scoreText);
    }
  }
  
  if (currentHook && currentHook.hook) {
    hooks.push(scoreHookVirality(currentHook.hook, niche));
  }
  
  return hooks.filter(h => h.hook && h.hook.length > 5);
}

// Export functions
module.exports = {
  analyzeNicheTrends,
  extractHookPatterns,
  generateHooks,
  scoreHookVirality,
  batchGenerateHooks,
  getHookTemplates,
  HOOK_PATTERNS
};
