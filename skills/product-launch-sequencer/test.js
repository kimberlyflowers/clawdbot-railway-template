/**
 * Test suite for Product Launch Sequencer
 */

const sequencer = require('./index.js');

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

console.log('🧪 Product Launch Sequencer Tests\n');

test('Create launch sequence', () => {
  const result = sequencer.createLaunchSequence(
    'Product v2.0',
    '2026-03-01T09:00:00Z',
    ['email', 'twitter']
  );
  
  assert(result.launchId.startsWith('launch_'), 'Should have launch ID');
  assert(result.productName === 'Product v2.0', 'Should have product name');
  assert(result.phase === 'pre-launch', 'Initial phase should be pre-launch');
  assert(Array.isArray(result.schedule), 'Should have schedule');
  assert(result.schedule.length > 0, 'Should have scheduled items');
});

test('Launch schedule has all phases', () => {
  const result = sequencer.createLaunchSequence('Product', '2026-03-01T09:00:00Z');
  
  const phases = result.schedule.map(s => s.phase);
  assert(phases.includes('teaser'), 'Should have teaser phase');
  assert(phases.includes('launch_day'), 'Should have launch day');
  assert(phases.includes('momentum'), 'Should have momentum phase');
});

test('Generate launch assets for all channels', () => {
  const result = sequencer.generateLaunchAssets('NewProduct', 'Amazing features');
  
  assert(result.twitter, 'Should have Twitter assets');
  assert(result.email, 'Should have email assets');
  assert(result.linkedin, 'Should have LinkedIn assets');
  assert(result.paid_ads, 'Should have paid ads assets');
  assert(result.twitter.tweet1, 'Should have tweet content');
});

test('Generate assets for specific channel', () => {
  const result = sequencer.generateLaunchAssets('NewProduct', 'Features', 'email');
  
  assert(result.subject, 'Email should have subject');
  assert(result.body, 'Email should have body');
  assert(result.cta, 'Email should have CTA');
});

test('Get launch timeline', () => {
  const result = sequencer.getLaunchTimeline('2026-03-01T09:00:00Z', 30);
  
  assert(result.phases.teaser, 'Should have teaser phase timeline');
  assert(result.phases.launch_day, 'Should have launch day timeline');
  assert(result.phases.momentum, 'Should have momentum phase timeline');
  assert(result.phases.sustained, 'Should have sustained phase timeline');
});

test('Plan partnership outreach', () => {
  const result = sequencer.planLaunchPartnershipOutreach('Product', ['complementary_saas']);
  
  assert(Array.isArray(result.partners), 'Should have partners array');
  assert(result.partners.length > 0, 'Should have at least one partner category');
  assert(result.totalExpectedReach > 0, 'Should calculate total reach');
});

test('Get all partner types', () => {
  const result = sequencer.planLaunchPartnershipOutreach('Product', ['complementary_saas', 'influencers', 'media']);
  
  assert(result.partners.length === 3, 'Should return all requested partner types');
});

test('Track launch metrics', () => {
  const result = sequencer.trackLaunchMetrics(
    'launch_123',
    'launch_day',
    {
      emails_sent: 1000,
      emails_opened: 300,
      clicks: 90,
      signups: 18,
      revenue: 900
    }
  );
  
  assert(result.recorded === true, 'Should record metrics');
  assert(result.openRate === '30%', 'Should calculate open rate');
  assert(result.clickRate === '30%', 'Should calculate click rate');
  assert(result.conversionRate === '20%', 'Should calculate conversion rate');
});

test('Get launch performance report', () => {
  const result = sequencer.getLaunchPerformanceReport('launch_123');
  
  assert(result.launchId === 'launch_123', 'Should have launch ID');
  assert(Array.isArray(result.phases), 'Should have phases');
  assert(result.totalSignups > 0, 'Should have total signups');
  assert(result.totalRevenue > 0, 'Should have total revenue');
});

test('Launch assets include product name', () => {
  const productName = 'MyAwesomeProduct';
  const result = sequencer.generateLaunchAssets(productName);
  
  const allText = JSON.stringify(result).toLowerCase();
  assert(allText.includes(productName.toLowerCase()), 'Assets should mention product name');
});

test('Timeline dates are valid', () => {
  const result = sequencer.getLaunchTimeline('2026-03-01T09:00:00Z');
  
  Object.values(result.phases).forEach(phase => {
    assert(phase.startDate, 'Should have start date');
    assert(phase.endDate, 'Should have end date');
    assert(/^\d{4}-\d{2}-\d{2}$/.test(phase.startDate), 'Start date should be valid');
  });
});

// Summary
console.log(`\n📊 Test Summary: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
