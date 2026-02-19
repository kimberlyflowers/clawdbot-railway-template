/**
 * Test suite for Testimonial Amplifier
 */

const amplifier = require('./index.js');

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

console.log('🧪 Testimonial Amplifier Tests\n');

test('Extract testimonial opportunities', () => {
  const conversation = 'We love your product! It saved us 15 hours per week and increased conversion by 40%.';
  const result = amplifier.extractTestimonialOpportunities(conversation);
  
  assert(Array.isArray(result.opportunities), 'Should return opportunities array');
  assert(result.opportunities.length > 0, 'Should find opportunities');
  assert(result.bestQuote, 'Should identify best quote');
  assert(result.opportunities[0].sentiment, 'Should detect sentiment');
});

test('Generate quote graphic asset', () => {
  const result = amplifier.generateTestimonialAsset(
    'Saved us 15 hours/week',
    { name: 'John Doe', title: 'CEO', company: 'TechCorp' },
    'quote_graphic'
  );
  
  assert(result.assetType === 'quote_graphic', 'Should create quote graphic');
  assert(result.quote, 'Should include quote');
  assert(result.attribution, 'Should have attribution');
});

test('Generate video script asset', () => {
  const result = amplifier.generateTestimonialAsset(
    'Best tool we ever bought',
    { name: 'Sarah Chen', title: 'VP Marketing' },
    'video_script'
  );
  
  assert(result.assetType === 'video_script', 'Should create video script');
  assert(result.videoScript.hook, 'Should have hook');
  assert(result.videoScript.result, 'Should have result');
  assert(result.estimatedVideoLength, 'Should estimate length');
});

test('Generate social post asset', () => {
  const result = amplifier.generateTestimonialAsset(
    'Amazing results',
    { name: 'Alex' },
    'social_post'
  );
  
  assert(result.assetType === 'social_post', 'Should create social post');
  assert(result.twitterPost, 'Should have Twitter post');
  assert(result.linkedinPost, 'Should have LinkedIn post');
});

test('Generate email asset', () => {
  const result = amplifier.generateTestimonialAsset(
    'Life changing',
    { name: 'Customer' },
    'email'
  );
  
  assert(result.assetType === 'email', 'Should create email');
  assert(result.subject, 'Should have subject');
  assert(result.body, 'Should have body');
});

test('Amplify testimonial across channels', () => {
  const result = amplifier.amplifyTestimonial(
    'test_123',
    ['twitter', 'linkedin', 'email']
  );
  
  assert(result.distributed === true, 'Should mark as distributed');
  assert(result.channels.twitter, 'Should have Twitter');
  assert(result.channels.linkedin, 'Should have LinkedIn');
  assert(result.channels.email, 'Should have email');
  assert(result.estimatedReach > 0, 'Should calculate reach');
});

test('Get testimonial impact metrics', () => {
  const result = amplifier.getTestimonialImpact('test_123');
  
  assert(result.testimonialId === 'test_123', 'Should have ID');
  assert(result.impressions > 0, 'Should have impressions');
  assert(result.clicks > 0, 'Should have clicks');
  assert(result.conversions > 0, 'Should have conversions');
  assert(result.clickRate, 'Should calculate click rate');
  assert(result.conversionRate, 'Should calculate conversion rate');
  assert(result.revenue > 0, 'Should have revenue');
});

test('Generate case study from testimonial', () => {
  const result = amplifier.generateCaseStudyFromTestimonial(
    'test_123',
    { company: 'TechCorp', challenge: 'Scaling issues', result: '40% growth' }
  );
  
  assert(result.headline, 'Should have headline');
  assert(result.challenge, 'Should have challenge');
  assert(result.solution, 'Should have solution');
  assert(result.result, 'Should have result');
  assert(Array.isArray(result.stats), 'Should have stats');
});

test('Get best testimonials for promotion', () => {
  const testimonials = [
    { quote: 'Great!' },
    { quote: 'Amazing!' },
    { quote: 'Love it!' }
  ];
  
  const result = amplifier.getBestTestimonialsForPromotion(testimonials);
  
  assert(Array.isArray(result.topTestimonials), 'Should return top testimonials');
  assert(result.totalCount === 3, 'Should count total');
  assert(result.recommendedForPromotion > 0, 'Should recommend for promotion');
});

test('Extract opportunities from positive feedback', () => {
  const feedback = 'Absolutely love this. Best investment we made. Saves us so much time!';
  const result = amplifier.extractTestimonialOpportunities(feedback);
  
  assert(result.opportunities.length > 0, 'Should extract from positive feedback');
});

test('Amplify to all supported channels', () => {
  const result = amplifier.amplifyTestimonial(
    'test_456',
    ['twitter', 'linkedin', 'email', 'website']
  );
  
  assert(result.channelsUsed === 4, 'Should use all channels');
});

// Summary
console.log(`\n📊 Test Summary: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
