/**
 * Test suite for Trend Hijacker
 */

const hijacker = require('./index.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(`   Error: ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log('🧪 Trend Hijacker Tests\n');

test('Detect trends in niche', () => {
  const result = hijacker.detectTrends('SaaS marketing', ['twitter', 'tiktok']);
  
  assert(Array.isArray(result.trends), 'Trends should be an array');
  assert(result.trends.length > 0, 'Should detect trends');
  assert(result.bestForHijacking, 'Should recommend best trend');
  assert(result.trends[0].velocity > 0, 'Should have velocity metric');
});

test('Filter trends by minimum momentum', () => {
  const result = hijacker.detectTrends('SaaS marketing', ['twitter'], 24, 0.9);
  
  assert(Array.isArray(result.trends), 'Should return array even with high filter');
  result.trends.forEach(trend => {
    assert(trend.velocity >= 0.9, 'All trends should meet minimum velocity');
  });
});

test('Analyze competitor trending strategies', () => {
  const result = hijacker.analyzeCompetitorTrending('AI automation', ['Competitor A', 'Competitor B']);
  
  assert(result.trendId === 'AI automation', 'Trend ID should match input');
  assert(Array.isArray(result.competitorApproaches), 'Should have competitor approaches');
  assert(result.competitorApproaches.length > 0, 'Should analyze competitors');
  assert(result.gapOpportunities, 'Should identify gaps');
  assert(Array.isArray(result.gapOpportunities), 'Gaps should be array');
});

test('Generate trend content with brand voice', () => {
  const result = hijacker.generateTrendContent(
    'AI automation',
    { tone: 'direct, data-driven', audience: 'SaaS founders' },
    'twitter_thread'
  );
  
  assert(result.content.title, 'Should have content title');
  assert(Array.isArray(result.content.hooks), 'Should have hooks');
  assert(result.content.hooks.length > 0, 'Should have multiple hooks');
  assert(typeof result.viralScore === 'number', 'Should have viral score');
  assert(result.viralScore > 0 && result.viralScore <= 100, 'Viral score should be 0-100');
});

test('Generate content for different formats', () => {
  const formats = ['twitter_thread', 'instagram_carousel', 'blog_post', 'tiktok_script'];
  
  formats.forEach(format => {
    const result = hijacker.generateTrendContent('Marketing trends', {}, format);
    assert(result.format === format, `Should support ${format} format`);
  });
});

test('Get trend timeline and peak prediction', () => {
  const result = hijacker.getTrendTimeline('AI automation');
  
  assert(result.timeline, 'Should have timeline object');
  assert(result.timeline.estimatedPeak, 'Should estimate peak time');
  assert(result.timeline.currentPhase, 'Should identify current phase');
  assert(result.recommendations, 'Should have recommendations');
  assert(Array.isArray(result.recommendations), 'Recommendations should be array');
});

test('Batch generate content for multiple trends', () => {
  const trends = ['AI automation', 'Marketing trends', 'Pricing strategies'];
  const result = hijacker.batchGenerateTrendContent(trends, ['twitter', 'instagram']);
  
  assert(result.generated === 3, 'Should generate all trends');
  assert(Array.isArray(result.content), 'Content should be array');
  assert(result.content.length === 3, 'Should have 3 content pieces');
  assert(result.totalReach > 0, 'Should calculate total reach');
});

test('Get trend topic impact and relevance', () => {
  const result = hijacker.getTrendTopicImpact('AI automation');
  
  assert(result.relevance >= 0 && result.relevance <= 1, 'Relevance should be 0-1');
  assert(result.opportunity >= 0 && result.opportunity <= 1, 'Opportunity should be 0-1');
  assert(result.competition >= 0 && result.competition <= 1, 'Competition should be 0-1');
  assert(result.recommendation, 'Should have recommendation');
  assert(result.estimatedTraffic > 0, 'Should estimate traffic');
});

test('Get trend velocity and acceleration', () => {
  const result = hijacker.getTrendVelocity('Marketing automation');
  
  assert(result.velocity >= 0 && result.velocity <= 1, 'Velocity should be 0-1');
  assert(['accelerating', 'plateauing'].includes(result.acceleration), 'Should report acceleration');
  assert(result.hoursUntilPeak > 0, 'Should estimate hours until peak');
});

test('Content should include all required fields', () => {
  const result = hijacker.generateTrendContent('Test trend');
  
  assert(result.content.title, 'Content should have title');
  assert(result.content.format, 'Content should have format');
  assert(result.content.hooks, 'Content should have hooks');
  assert(result.content.body, 'Content should have body');
  assert(result.content.cta, 'Content should have CTA');
});

test('Detect trends for different niches', () => {
  const niches = ['SaaS', 'Fitness', 'Fashion', 'Finance'];
  
  niches.forEach(niche => {
    const result = hijacker.detectTrends(niche);
    assert(Array.isArray(result.trends), `Should detect trends for ${niche}`);
  });
});

// Summary
console.log(`\n📊 Test Summary: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
