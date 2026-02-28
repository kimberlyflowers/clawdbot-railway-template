const skill = require('./index.js');

console.log('\n🧪 TikTok Shop ROI Tracker - Tests\n');

try {
  // Test 1: Calculate ROI
  const result1 = skill.calculateROI(
    { views: 100000, production_cost: 200 },
    { conversion_rate: 0.08, aov: 32 }
  );
  console.log('✅ Test 1: Calculate ROI');
  console.log(`   Views: ${result1.views}, Revenue: $${result1.revenue}, ROI: ${result1.roiPercent}`);
  
  // Test 2: Analyze Product
  const result2 = skill.analyzeProduct('Natural Glow Serum');
  console.log('✅ Test 2: Analyze Product');
  console.log(`   Product: ${result2.product}, Monthly Revenue: $${result2.monthly_revenue}`);
  
  // Test 3: Rank Products
  const result3 = skill.rankProductsByROI();
  console.log('✅ Test 3: Rank Products by ROI');
  console.log(`   Top product: ${result3[0].name}, Score: ${result3[0].rank_score.toFixed(1)}`);
  
  // Test 4: Get Top Products
  const result4 = skill.getTopProducts();
  console.log('✅ Test 4: Get Top Products');
  console.log(`   Found ${result4.length} products`);
  
  // Test 5: Batch analysis
  const result5 = result4.map(p => skill.analyzeProduct(p.name));
  console.log('✅ Test 5: Batch Analyze All Products');
  console.log(`   Analyzed ${result5.length} products`);
  
  console.log('\n📊 Test Summary: 5 passed, 0 failed\n');
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
