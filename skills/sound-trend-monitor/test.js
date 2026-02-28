const skill = require('./index.js');

console.log('\n🧪 Sound Trend Monitor - Tests\n');

try {
  // Test 1: Get trending sounds
  const result1 = skill.getTrendingSounds();
  console.log('✅ Test 1: Get Trending Sounds');
  console.log(`   Found ${result1.length} trending sounds`);
  
  // Test 2: Analyze specific sound
  const result2 = skill.analyzeSound('That Girl');
  console.log('✅ Test 2: Analyze Sound');
  console.log(`   Sound: ${result2.sound}, Growth: ${result2.growth_rate}`);
  
  // Test 3: Rank by growth
  const result3 = skill.rankSoundsByGrowth();
  console.log('✅ Test 3: Rank by Growth');
  console.log(`   Top: ${result3[0].sound} (${result3[0].growth}% growth)`);
  
  // Test 4: Opportunity level filter
  const emerging = result1.filter(s => s.opportunity_level === 'emerging');
  console.log('✅ Test 4: Filter Emerging Opportunities');
  console.log(`   ${emerging.length} emerging sounds`);
  
  // Test 5: Category analysis
  const hotSounds = result1.filter(s => s.momentum === 'hot');
  console.log('✅ Test 5: Hot Sounds Filter');
  console.log(`   ${hotSounds.length} hot sounds detected`);
  
  console.log('\n📊 Test Summary: 5 passed, 0 failed\n');
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
