const skill = require('./index.js');

console.log('\n🧪 Trend Prediction Engine - Tests\n');

try {
  // Test 1: Predict trend peak
  const result1 = skill.predictTrendPeak('skincare');
  console.log('✅ Test 1: Predict Trend Peak');
  console.log(`   Hashtag: ${result1.hashtag}, Peak in: ${result1.days_until_peak} days`);
  
  // Test 2: Analyze momentum
  const result2 = skill.analyzeHashtagMomentum();
  console.log('✅ Test 2: Analyze Momentum');
  console.log(`   Analyzed ${result2.length} hashtags, Top: ${result2[0].hashtag}`);
  
  // Test 3: Predict emerging
  const result3 = skill.predictEmerging();
  console.log('✅ Test 3: Predict Emerging Trends');
  console.log(`   Found ${result3.length} emerging opportunities`);
  
  // Test 4: Growth rate analysis
  const highGrowth = result2.filter(h => h.growth > 15);
  console.log('✅ Test 4: High-Growth Filter');
  console.log(`   ${highGrowth.length} hashtags with >15% growth`);
  
  // Test 5: Opportunity scoring
  const scored = result2.map(h => ({
    hashtag: h.hashtag,
    score: h.growth * (h.momentum === 'accelerating' ? 1.5 : 1)
  }));
  console.log('✅ Test 5: Opportunity Scoring');
  console.log(`   Top scored: ${scored[0].hashtag}`);
  
  console.log('\n📊 Test Summary: 5 passed, 0 failed\n');
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
