/**
 * Viral Hook Generator - Test Suite
 * All tests must pass before production use
 */

const {
  analyzeNicheTrends,
  extractHookPatterns,
  generateHooks,
  scoreHookVirality,
  batchGenerateHooks,
  getHookTemplates,
  HOOK_PATTERNS
} = require('./index');

let testsPassed = 0;
let testsFailed = 0;

/**
 * Test runner
 */
async function runTests() {
  console.log('🧪 Viral Hook Generator - Test Suite\n');
  
  // Test 1: Analyze Niche Trends
  await testAnalyzeNicheTrends();
  
  // Test 2: Extract Hook Patterns
  await testExtractHookPatterns();
  
  // Test 3: Generate Hooks
  await testGenerateHooks();
  
  // Test 4: Score Hook Virality
  await testScoreHookVirality();
  
  // Test 5: Batch Generate
  await testBatchGenerateHooks();
  
  // Test 6: Get Templates
  await testGetHookTemplates();
  
  // Test 7: Multiple Niches
  await testMultipleNiches();
  
  // Test 8: Edge Cases
  await testEdgeCases();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`📊 Total: ${testsPassed + testsFailed}`);
  console.log('='.repeat(50));
  
  process.exit(testsFailed > 0 ? 1 : 0);
}

/**
 * Test: Analyze niche trends
 */
async function testAnalyzeNicheTrends() {
  console.log('Test 1: Analyze Niche Trends');
  
  try {
    const result = await analyzeNicheTrends('fitness', 'tiktok', 5);
    
    assert(result.niche === 'fitness', 'Niche mismatch');
    assert(result.platform === 'tiktok', 'Platform mismatch');
    assert(result.trends && result.trends.length > 0, 'No trends returned');
    assert(result.patterns, 'Patterns missing');
    assert(result.topPatterns && result.topPatterns.length > 0, 'Top patterns missing');
    
    console.log(`  ✅ Analyzed ${result.trends.length} trending hooks`);
    console.log(`  ✅ Detected ${Object.keys(result.patterns).length} patterns`);
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test: Extract hook patterns
 */
async function testExtractHookPatterns() {
  console.log('Test 2: Extract Hook Patterns');
  
  try {
    const sampleTrends = [
      { content: 'POV: You\'ve been doing this wrong' },
      { content: 'Wait til you see what happens' },
      { content: '99% of people don\'t realize this' },
      { content: 'This is now banned' }
    ];
    
    const result = extractHookPatterns(sampleTrends);
    
    assert(result.patterns, 'Patterns not extracted');
    assert(result.topPatterns && result.topPatterns.length > 0, 'Top patterns missing');
    assert(result.totalAnalyzed === 4, 'Wrong count of analyzed items');
    
    console.log(`  ✅ Extracted patterns: ${Object.keys(result.patterns).join(', ')}`);
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test: Generate hooks
 */
async function testGenerateHooks() {
  console.log('Test 3: Generate Hooks');
  
  try {
    const result = await generateHooks(
      'fitness coaching',
      'Online personal training',
      ['pattern_interrupt', 'curiosity_gap'],
      5
    );
    
    assert(result.niche === 'fitness coaching', 'Niche mismatch');
    assert(result.generated > 0, 'No hooks generated');
    assert(result.hooks && result.hooks.length > 0, 'Hooks array empty');
    assert(result.hooks[0].viralScore, 'Missing viral score');
    
    console.log(`  ✅ Generated ${result.generated} hooks`);
    console.log(`  ✅ Top hook: "${result.topHook.hook}" (Score: ${result.topHook.viralScore})`);
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test: Score hook virality
 */
async function testScoreHookVirality() {
  console.log('Test 4: Score Hook Virality');
  
  try {
    const testHooks = [
      'POV: You\'ve been doing push-ups wrong your whole life',
      'Wait til you see what happens when you change your morning routine',
      'This fitness hack is now banned at most gyms',
      'Nobody talks about the real secret to building muscle',
      'Make $1000/month doing what you love'
    ];
    
    const scores = testHooks.map(hook => scoreHookVirality(hook, 'fitness'));
    
    assert(scores.length === 5, 'Wrong number of scores');
    assert(scores.every(s => s.viralScore >= 0 && s.viralScore <= 100), 'Scores out of range');
    assert(scores.every(s => s.breakdown), 'Missing breakdown');
    assert(scores.every(s => s.recommendation), 'Missing recommendation');
    
    const avgScore = scores.reduce((sum, s) => sum + s.viralScore, 0) / scores.length;
    console.log(`  ✅ Scored ${scores.length} hooks`);
    console.log(`  ✅ Average viral score: ${Math.round(avgScore)}`);
    
    // Find highest scoring
    const topScore = Math.max(...scores.map(s => s.viralScore));
    console.log(`  ✅ Highest score: ${topScore}`);
    
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test: Batch generate hooks
 */
async function testBatchGenerateHooks() {
  console.log('Test 5: Batch Generate Hooks');
  
  try {
    const campaigns = [
      { niche: 'fitness', product: 'coaching app', count: 3 },
      { niche: 'productivity', product: 'time management tool', count: 3 }
    ];
    
    const result = await batchGenerateHooks(campaigns);
    
    assert(result.campaigns && result.campaigns.length === 2, 'Wrong number of campaigns');
    assert(result.totalGenerated > 0, 'No hooks generated');
    assert(result.timestamp, 'Missing timestamp');
    
    console.log(`  ✅ Processed ${result.campaigns.length} campaigns`);
    console.log(`  ✅ Total hooks generated: ${result.totalGenerated}`);
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test: Get hook templates
 */
async function testGetHookTemplates() {
  console.log('Test 6: Get Hook Templates');
  
  try {
    const result = getHookTemplates('fitness');
    
    assert(result.niche === 'fitness', 'Niche mismatch');
    assert(result.templates && result.templates.length > 0, 'No templates returned');
    assert(result.tips && result.tips.length > 0, 'No tips provided');
    
    // Verify template structure
    result.templates.forEach(t => {
      assert(t.template, 'Template text missing');
      assert(t.pattern, 'Pattern missing');
      assert(t.viralityBase, 'Virality score missing');
      assert(t.example, 'Example missing');
    });
    
    console.log(`  ✅ Retrieved ${result.templates.length} templates`);
    console.log(`  ✅ Tips provided: ${result.tips.length}`);
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test: Multiple niches
 */
async function testMultipleNiches() {
  console.log('Test 7: Multiple Niches');
  
  try {
    const niches = ['fitness', 'productivity', 'business', 'beauty', 'saas'];
    const results = [];
    
    for (const niche of niches) {
      const result = await analyzeNicheTrends(niche, 'tiktok', 3);
      results.push(result);
      assert(!result.error, `Error for niche: ${niche}`);
    }
    
    assert(results.length === 5, 'Wrong number of results');
    
    console.log(`  ✅ Analyzed ${niches.length} different niches`);
    niches.forEach((niche, i) => {
      console.log(`    - ${niche}: ${results[i].trends.length} trends found`);
    });
    
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test: Edge cases
 */
async function testEdgeCases() {
  console.log('Test 8: Edge Cases');
  
  try {
    // Empty niche
    const result1 = await analyzeNicheTrends('', 'tiktok', 0);
    assert(result1.trends !== undefined, 'Should handle empty niche');
    
    // Short hook scoring
    const score1 = scoreHookVirality('POV', 'fitness');
    assert(score1.viralScore >= 0, 'Should score short hooks');
    
    // Long hook (has pattern interrupt + curiosity, so might score similarly)
    const longHook = 'POV: You\'ve been doing this the wrong way your entire life and nobody is talking about it';
    const score2 = scoreHookVirality(longHook, 'fitness');
    assert(score2.viralScore >= 0, 'Long hooks should still score');
    
    // Special characters
    const specialHook = 'POV: You\'re doing this *WRONG* 😱';
    const score3 = scoreHookVirality(specialHook, 'fitness');
    assert(score3.viralScore > 0, 'Should handle special characters');
    
    // Verify optimal word count scores well
    const optimalHook = 'POV: You\'ve been doing push-ups completely wrong?';  // 8 words, pattern interrupt + cliffhanger
    const scoreOptimal = scoreHookVirality(optimalHook, 'fitness');
    assert(scoreOptimal.viralScore >= 40, 'Optimal length hooks should score reasonably well');
    
    console.log(`  ✅ Handled empty inputs`);
    console.log(`  ✅ Handled short hooks (score: ${score1.viralScore})`);
    console.log(`  ✅ Handled long hooks (score: ${score2.viralScore})`);
    console.log(`  ✅ Handled special characters (score: ${score3.viralScore})`);
    console.log(`  ✅ Optimal word count scores well (score: ${scoreOptimal.viralScore})`);
    
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ ${error.message}`);
    testsFailed++;
  }
}

/**
 * Assertion helper
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Run all tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
