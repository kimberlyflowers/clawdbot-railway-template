/**
 * Test suite for Audience Psychographer
 */

const psychographer = require('./index.js');

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

console.log('🧪 Audience Psychographer Tests\n');

test('Profile SaaS founder audience', () => {
  const result = psychographer.profileAudiencePsychology('SaaS founder', { productCategory: 'Tool' });
  
  assert(result.psychographicProfile, 'Should have profile');
  assert(result.psychographicProfile.archetype, 'Should have archetype');
  assert(Array.isArray(result.psychographicProfile.core_fears), 'Should have fears array');
  assert(Array.isArray(result.psychographicProfile.core_desires), 'Should have desires array');
  assert(result.psychographicProfile.worldview, 'Should have worldview');
  assert(result.psychographicProfile.identity, 'Should have identity');
});

test('Profile B2B marketer audience', () => {
  const result = psychographer.profileAudiencePsychology('B2B marketer');
  
  assert(result.psychographicProfile.archetype === 'The Strategist', 'Should identify strategist archetype');
  assert(Array.isArray(result.psychographicProfile.core_fears), 'Should have fears');
});

test('Get motivational drivers', () => {
  const result = psychographer.getMotivationalDrivers('SaaS founders');
  
  assert(Array.isArray(result.primaryDrivers), 'Should have drivers array');
  assert(result.primaryDrivers.length > 0, 'Should have multiple drivers');
  assert(result.primaryDrivers[0].driver, 'Each driver should have a name');
  assert(typeof result.primaryDrivers[0].weight === 'number', 'Each driver should have weight');
  assert(Array.isArray(result.avoidanceMotors), 'Should have avoidance motors');
});

test('Test messaging angle resonance', () => {
  const profile = psychographer.profileAudiencePsychology('SaaS founder');
  const result = psychographer.testMessagingAngle(profile, 'Save 10 hours/week on lead qualification');
  
  assert(typeof result.resonanceScore === 'number', 'Should calculate resonance score');
  assert(result.resonanceScore >= 0 && result.resonanceScore <= 1, 'Score should be 0-1');
  assert(result.psychologicalAlignment, 'Should have psychological alignment');
  assert(result.expectedConversionLift, 'Should estimate conversion lift');
});

test('Test multiple messaging angles', () => {
  const angles = [
    'Save time with automation',
    'Grow revenue by 3x',
    'Never lose a lead again'
  ];
  
  angles.forEach(angle => {
    const result = psychographer.testMessagingAngle({}, angle);
    assert(result.resonanceScore >= 0, 'Should evaluate each angle');
  });
});

test('Generate persona messaging', () => {
  const result = psychographer.generatePersonaMessaging('SaaS founder', 'email');
  
  assert(result.headline, 'Should generate headline');
  assert(result.subheader, 'Should generate subheader');
  assert(Array.isArray(result.bodyCopy), 'Body copy should be array');
  assert(result.bodyCopy.length > 0, 'Should have body copy');
  assert(result.cta, 'Should have CTA');
});

test('Generate messaging for different content types', () => {
  const types = ['email', 'landing_page', 'twitter', 'instagram'];
  
  types.forEach(type => {
    const result = psychographer.generatePersonaMessaging({}, type);
    assert(result.contentType === type, `Should support ${type} format`);
  });
});

test('Identify psychological barriers', () => {
  const result = psychographer.identifyPsychologicalBarriers('Lead Gen Tool');
  
  assert(Array.isArray(result.barriers), 'Should have barriers array');
  assert(result.barriers.length > 0, 'Should identify barriers');
  assert(result.barriers[0].barrier, 'Each barrier should have description');
  assert(result.barriers[0].severity, 'Each barrier should have severity');
  assert(result.barriers[0].solution, 'Each barrier should have solution');
  assert(Array.isArray(result.overcomingStrategies), 'Should have strategies');
});

test('Messaging addresses core fears', () => {
  const result = psychographer.testMessagingAngle({}, 'Risk-free trial - no credit card needed');
  
  assert(result.psychologicalAlignment.addressesFear === true, 'Should recognize fear-addressing message');
});

test('Messaging addresses desires', () => {
  const result = psychographer.testMessagingAngle({}, 'Grow your revenue 3x in 90 days');
  
  assert(result.psychologicalAlignment.addressesDesire === true, 'Should recognize desire-addressing message');
});

test('Profile consistency across calls', () => {
  const result1 = psychographer.profileAudiencePsychology('SaaS founder');
  const result2 = psychographer.profileAudiencePsychology('SaaS founder');
  
  assert(result1.psychographicProfile.archetype === result2.psychographicProfile.archetype, 'Should be consistent');
});

// Summary
console.log(`\n📊 Test Summary: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
