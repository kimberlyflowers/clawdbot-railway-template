/**
 * Test suite for Competitor Decoder
 */

const decoder = require('./index.js');

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

console.log('🧪 Competitor Decoder Tests\n');

test('Analyze competitor positions', () => {
  const result = decoder.analyzeCompetitorPosition(['HubSpot', 'Pipedrive']);
  
  assert(Array.isArray(result.competitors), 'Should return competitors array');
  assert(result.competitors.length === 2, 'Should analyze 2 competitors');
  assert(result.competitors[0].headline, 'Should have headline');
  assert(result.competitors[0].positioning, 'Should have positioning');
  assert(result.competitors[0].strengths, 'Should have strengths');
  assert(Array.isArray(result.gaps), 'Should identify gaps');
});

test('Analyze with default competitors', () => {
  const result = decoder.analyzeCompetitorPosition([]);
  
  assert(result.competitors.length > 0, 'Should return default competitors');
});

test('Get messaging strategy', () => {
  const result = decoder.getCompetitorMessagingStrategy('HubSpot');
  
  assert(result.competitor === 'HubSpot', 'Should include competitor name');
  assert(result.headline, 'Should have headline');
  assert(result.subheadline, 'Should have subheadline');
  assert(Array.isArray(result.messagingPillars), 'Should have messaging pillars');
  assert(result.messagingPillars[0].pillar, 'Pillar should have text');
});

test('Get messaging strategy for unknown competitor', () => {
  const result = decoder.getCompetitorMessagingStrategy('UnknownCompany');
  
  assert(result.headline, 'Should return strategy even for unknown');
  assert(result.messagingPillars, 'Should include pillars');
});

test('Find competitive gaps', () => {
  const result = decoder.findCompetitiveGaps(['Competitor1', 'Competitor2']);
  
  assert(Array.isArray(result.gaps), 'Should return gaps array');
  assert(result.gaps.length > 0, 'Should identify gaps');
  assert(result.gaps[0].gap, 'Gap should have description');
  assert(result.gaps[0].opportunity, 'Gap should have opportunity');
  assert(result.gaps[0].potentialBenefit, 'Gap should have benefit');
  assert(result.bestOpportunity, 'Should identify best opportunity');
});

test('Generate positioning statement', () => {
  const result = decoder.generatePositioningStatement(
    ['Transparency', 'Simplicity'],
    ['Complexity', 'Hidden pricing']
  );
  
  assert(result.positioning, 'Should generate positioning');
  assert(result.uniqueValue, 'Should have unique value');
  assert(Array.isArray(result.differentiators), 'Should have differentiators');
  assert(result.differentiators.length > 0, 'Should list multiple differentiators');
});

test('Generate positioning with defaults', () => {
  const result = decoder.generatePositioningStatement();
  
  assert(result.positioning, 'Should generate default positioning');
});

test('Get competitor pricing', () => {
  const result = decoder.getCompetitorPricing(['HubSpot', 'Pipedrive']);
  
  assert(Array.isArray(result.competitors), 'Should have competitors');
  assert(result.competitors[0].name, 'Should have competitor name');
  assert(result.competitors[0].entry, 'Should have entry pricing');
  assert(result.priceRangeEntry, 'Should have price range');
  assert(result.averagePricing, 'Should calculate average');
  assert(result.recommendation, 'Should recommend pricing strategy');
});

test('Get competitive intelligence summary', () => {
  const result = decoder.getCompetitiveIntelligenceSummary(['Competitor1']);
  
  assert(result.competitorCount > 0, 'Should count competitors');
  assert(result.positioningAnalysis, 'Should have positioning analysis');
  assert(result.gaps, 'Should identify gaps');
  assert(result.pricing, 'Should analyze pricing');
  assert(result.positioning, 'Should generate positioning');
  assert(Array.isArray(result.actionItems), 'Should have action items');
});

test('Positioning includes target segment', () => {
  const result = decoder.generatePositioningStatement();
  
  assert(result.targetSegment, 'Should specify target segment');
});

test('Gaps analysis is actionable', () => {
  const result = decoder.findCompetitiveGaps();
  
  result.gaps.forEach(gap => {
    assert(gap.gap, 'Gap should be clear');
    assert(gap.opportunity, 'Opportunity should be specific');
    assert(gap.potentialBenefit, 'Benefit should be quantifiable');
  });
});

// Summary
console.log(`\n📊 Test Summary: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
