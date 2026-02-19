/**
 * Test suite for Landing Page Optimizer
 */

const optimizer = require('./index.js');

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

console.log('🧪 Landing Page Optimizer Tests\n');

test('Create landing page test', () => {
  const result = optimizer.createLandingPageTest(
    'Product Launch',
    { headline: 'Get More Leads', cta: 'Start Free Trial', ctaColor: '#FF6B6B' },
    [
      { name: 'Urgency Headline', headline: 'Generate Leads Now', cta: 'Get Started' },
      { name: 'Benefit Headline', headline: 'Save 10 Hours/Week', cta: 'Claim Trial' }
    ]
  );
  
  assert(result.testId.startsWith('test_'), 'Test ID should be generated');
  assert(result.pageName === 'Product Launch', 'Page name should match');
  assert(result.variations === 3, 'Should have 3 variations (1 baseline + 2 tests)');
  assert(result.status === 'active', 'Status should be active');
});

test('Track conversions', () => {
  const result = optimizer.createLandingPageTest(
    'Sales Page',
    { headline: 'Original', cta: 'Start' },
    [{ name: 'Test', headline: 'Modified', cta: 'Begin' }]
  );
  
  const testId = result.testId;
  
  const track1 = optimizer.trackConversion(testId, 'visitor_1', 'baseline', true, { conversionValue: 99 });
  assert(track1.recorded === true, 'Conversion should be recorded');
  assert(track1.trackingId.startsWith('track_'), 'Tracking ID should be generated');
  
  const track2 = optimizer.trackConversion(testId, 'visitor_2', 'variation_1', true, { conversionValue: 99 });
  assert(track2.recorded === true, 'Second conversion should be recorded');
});

test('Get test results', () => {
  const result = optimizer.createLandingPageTest(
    'Analytics Page',
    { headline: 'Original', cta: 'Start' },
    [{ name: 'Test', headline: 'Modified', cta: 'Begin' }]
  );
  
  const testId = result.testId;
  
  // Simulate conversions
  for (let i = 0; i < 100; i++) {
    optimizer.trackConversion(testId, `visitor_${i}`, 'baseline', i < 3);
    optimizer.trackConversion(testId, `visitor_${i + 1000}`, 'variation_1', i < 6);
  }
  
  const results = optimizer.getTestResults(testId);
  assert(results.testId === testId, 'Test ID should match');
  assert(results.results.baseline, 'Should have baseline results');
  assert(results.results.variation_1, 'Should have variation results');
  assert(typeof results.results.baseline.conversionRate === 'number', 'Conversion rate should be number');
});

test('Generate headline ideas', () => {
  const ideas = optimizer.getHeadlineIdeas('LeadGen Pro', 'Get More Leads', 'B2B SaaS companies');
  
  assert(Array.isArray(ideas.ideas), 'Ideas should be an array');
  assert(ideas.ideas.length > 0, 'Should have headline ideas');
  assert(ideas.ideas[0].headline, 'Headline should have text');
  assert(ideas.ideas[0].viralScore, 'Should have viral score');
  assert(ideas.ideas[0].expectedLift, 'Should have expected lift');
});

test('Generate CTA variations', () => {
  const ctaVars = optimizer.getCTAVariations('Start Free Trial', { productType: 'SaaS' });
  
  assert(Array.isArray(ctaVars.variations), 'Variations should be an array');
  assert(ctaVars.variations.length > 0, 'Should have CTA variations');
  assert(ctaVars.variations[0].cta, 'CTA should have text');
  assert(ctaVars.variations[0].expectedLift, 'Should have expected lift');
});

test('Run full page test (multi-variable)', () => {
  const multivar = optimizer.runFullPageTest(
    { headline: 'Get Leads', cta: 'Start', ctaColor: '#FF6B6B' },
    3
  );
  
  assert(multivar.testId.startsWith('multivar_'), 'Test ID should be multi-variable');
  assert(Array.isArray(multivar.variations), 'Variations should be array');
  assert(multivar.variations.length > 0, 'Should have variations');
});

test('Get optimization recommendations', () => {
  const result = optimizer.createLandingPageTest(
    'Test Page',
    { headline: 'Get Leads', cta: 'Start' },
    [{ name: 'Variation', headline: 'Get Leads Fast', cta: 'Begin' }]
  );
  
  const recs = optimizer.getOptimizationRecommendations(result.testId);
  
  assert(Array.isArray(recs.recommendations), 'Recommendations should be array');
  assert(recs.recommendations.length > 0, 'Should have recommendations');
  assert(recs.recommendations[0].priority, 'Should have priority');
});

test('Statistical significance calculation', () => {
  const result = optimizer.createLandingPageTest(
    'Stats Page',
    { headline: 'Original', cta: 'Start' },
    [{ name: 'Better', headline: 'Better', cta: 'Go' }]
  );
  
  // Create high-performing variation
  for (let i = 0; i < 200; i++) {
    optimizer.trackConversion(result.testId, `v_${i}`, 'baseline', i < 4);
    optimizer.trackConversion(result.testId, `v_${i + 2000}`, 'variation_1', i < 12);
  }
  
  const results = optimizer.getTestResults(result.testId);
  
  assert(results.results.variation_1.confidence > 0, 'Should calculate confidence');
  assert(results.winner, 'Should identify winner when significant');
});

test('Handle invalid test ID', () => {
  const result = optimizer.trackConversion('invalid_test', 'visitor', 'baseline', true);
  assert(result.error, 'Should return error for invalid test');
});

test('Multiple sequential tests', () => {
  const test1 = optimizer.createLandingPageTest('Page 1', { headline: 'H1', cta: 'C1' }, []);
  const test2 = optimizer.createLandingPageTest('Page 2', { headline: 'H2', cta: 'C2' }, []);
  
  assert(test1.testId !== test2.testId, 'Each test should have unique ID');
  
  optimizer.trackConversion(test1.testId, 'v1', 'baseline', true);
  optimizer.trackConversion(test2.testId, 'v1', 'baseline', true);
  
  const results1 = optimizer.getTestResults(test1.testId);
  const results2 = optimizer.getTestResults(test2.testId);
  
  assert(results1.pageName === 'Page 1', 'Test 1 should have correct name');
  assert(results2.pageName === 'Page 2', 'Test 2 should have correct name');
});

// Summary
console.log(`\n📊 Test Summary: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
