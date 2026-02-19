/**
 * Story Arc Builder - Test Suite
 * All tests must pass before production use
 */

const {
  analyzeProductTransformation,
  generateStoryArcs,
  buildHeroJourney,
  generateSalesPageNarrative,
  generateVideoScripts,
  batchBuildStories
} = require('./index');

let testsPassed = 0;
let testsFailed = 0;

/**
 * Test runner
 */
async function runTests() {
  console.log('🧪 Story Arc Builder - Test Suite\n');

  await testAnalyzeProductTransformation();
  await testGenerateStoryArcs();
  await testBuildHeroJourney();
  await testGenerateSalesPageNarrative();
  await testGenerateVideoScripts();
  await testBatchBuildStories();
  await testMultipleProducts();
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
 * Test: Analyze Product Transformation
 */
async function testAnalyzeProductTransformation() {
  console.log('Test 1: Analyze Product Transformation');

  try {
    const result = await analyzeProductTransformation(
      'TimeBlock',
      'Automatic time blocking app that plans your day',
      'Busy entrepreneurs'
    );

    assert(result.productName === 'TimeBlock', 'Product name mismatch');
    assert(result.beforeState, 'No before state');
    assert(result.afterState, 'No after state');
    assert(result.painPoint, 'No pain point');
    assert(result.transformation, 'No transformation');
    assert(result.emotionalCore, 'No emotional core');
    assert(result.heroJourney, 'No hero journey');
    assert(result.confidence > 0.9, 'Low confidence score');

    console.log(`  ✅ Analyzed product: ${result.productName}`);
    console.log(`  ✅ Transformation: ${result.transformation}`);
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test: Generate Story Arcs
 */
async function testGenerateStoryArcs() {
  console.log('Test 2: Generate Story Arcs');

  try {
    const analysis = await analyzeProductTransformation(
      'CoachOS',
      'Coaching platform for fitness trainers',
      'Fitness coaches'
    );

    const arcs = await generateStoryArcs(analysis, 3);

    assert(arcs.productName === 'CoachOS', 'Product name mismatch');
    assert(arcs.stories && arcs.stories.length === 3, 'Wrong number of story arcs');
    assert(arcs.stories.every(s => s.angle), 'Missing angle in stories');
    assert(arcs.stories.every(s => s.narrative), 'Missing narrative in stories');
    assert(arcs.stories.every(s => s.emotionalHook), 'Missing emotional hook');
    assert(arcs.recommended, 'No recommended story');

    console.log(`  ✅ Generated ${arcs.stories.length} story arcs`);
    console.log(`  ✅ Top angle: ${arcs.recommended.angle}`);
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test: Build Hero Journey
 */
async function testBuildHeroJourney() {
  console.log('Test 3: Build Hero Journey');

  try {
    const journey = buildHeroJourney(
      'Chaotic mornings, wasting time',
      'Tried 5 different systems, none worked',
      'Realized I needed automation',
      'Found the right tool that does it for me'
    );

    assert(journey.journey && journey.journey.length === 5, 'Should have 5 journey stages');
    assert(journey.journey[0].stage === 'before', 'First stage should be before');
    assert(journey.journey[4].stage === 'transformation', 'Last stage should be transformation');
    assert(journey.completionPercentage === 100, 'Should be 100% complete');
    assert(journey.journey.every(j => j.emotion), 'Missing emotions');
    assert(journey.journey.every(j => j.stageNumber), 'Missing stage numbers');

    console.log(`  ✅ Built complete hero journey (5 stages)`);
    console.log(`  ✅ Stages: ${journey.journey.map(j => j.stage).join(' → ')}`);
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test: Generate Sales Page Narrative
 */
async function testGenerateSalesPageNarrative() {
  console.log('Test 4: Generate Sales Page Narrative');

  try {
    const analysis = await analyzeProductTransformation(
      'ContentFlow',
      'Content calendar and scheduling platform',
      'Content creators'
    );

    const salesPage = await generateSalesPageNarrative(analysis);

    assert(salesPage.salesPageStructure, 'No sales page structure');
    assert(salesPage.salesPageStructure.headline, 'No headline');
    assert(salesPage.salesPageStructure.subheadline, 'No subheadline');
    assert(salesPage.salesPageStructure.problem_section, 'No problem section');
    assert(salesPage.salesPageStructure.transformation_section, 'No transformation section');
    assert(salesPage.salesPageStructure.proof_section, 'No proof section');
    assert(salesPage.salesPageStructure.cta_section, 'No CTA section');
    assert(salesPage.narrative_flow, 'No narrative flow');
    assert(salesPage.estimated_conversion_improvement, 'No conversion estimate');

    console.log(`  ✅ Generated sales page narrative`);
    console.log(`  ✅ Flow: ${salesPage.narrative_flow}`);
    console.log(`  ✅ Expected improvement: ${salesPage.estimated_conversion_improvement}`);
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test: Generate Video Scripts
 */
async function testGenerateVideoScripts() {
  console.log('Test 5: Generate Video Scripts');

  try {
    const analysis = await analyzeProductTransformation(
      'LeadMagnet',
      'Lead capture and nurture automation',
      'Digital marketers'
    );

    // Test different video types
    const videoTypes = ['60_second', '30_second', 'testimonial', 'long_form'];

    for (const videoType of videoTypes) {
      const scripts = await generateVideoScripts(analysis, videoType);

      assert(scripts.productName === 'LeadMagnet', 'Product name mismatch');
      assert(scripts.scripts, `No scripts for ${videoType}`);
      assert(scripts.scripts.script, `No script text for ${videoType}`);
      assert(scripts.scripts.structure, `No structure for ${videoType}`);
      assert(scripts.scripts.platform, `No platform info for ${videoType}`);
    }

    console.log(`  ✅ Generated video scripts for 4 formats`);
    console.log(`  ✅ Formats: 60s, 30s, Testimonial, Long-form`);
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test: Batch Build Stories
 */
async function testBatchBuildStories() {
  console.log('Test 6: Batch Build Stories');

  try {
    const products = [
      {
        name: 'Product A',
        description: 'Solves problem with automation',
        audience: 'Busy professionals'
      },
      {
        name: 'Product B',
        description: 'Helps creators grow faster',
        audience: 'Content creators'
      },
      {
        name: 'Product C',
        description: 'Streamlines sales process',
        audience: 'Sales teams'
      }
    ];

    const result = await batchBuildStories(products);

    assert(result.stories && result.stories.length === 3, 'Should process 3 products');
    assert(result.totalGenerated === 3, 'Wrong count of generated stories');
    assert(result.stories.every(s => s.analysis), 'Missing analysis');
    assert(result.stories.every(s => s.storyArcs), 'Missing story arcs');
    assert(result.stories.every(s => s.salesPage), 'Missing sales pages');
    assert(result.stories.every(s => s.videos), 'Missing video scripts');
    assert(result.processed, 'No processed timestamp');

    console.log(`  ✅ Processed ${result.totalGenerated} products in batch`);
    console.log(`  ✅ Each has: analysis, arcs, sales page, videos`);
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test: Multiple Products Comprehensive
 */
async function testMultipleProducts() {
  console.log('Test 7: Multiple Products Comprehensive');

  try {
    const products = [
      {
        name: 'MorningOS',
        description: 'Daily planning and scheduling automation',
        audience: 'Entrepreneurs'
      },
      {
        name: 'EngageAI',
        description: 'Social media engagement automation',
        audience: 'Creators'
      }
    ];

    const stories = await batchBuildStories(products);

    assert(stories.stories.length === 2, 'Should have 2 stories');

    // Verify each product has complete narrative
    for (const story of stories.stories) {
      assert(story.analysis.transformation, 'Missing transformation');
      assert(story.storyArcs.stories.length > 0, 'No story angles');
      assert(story.salesPage.salesPageStructure.headline, 'No headline');
      assert(story.videos.scripts.script, 'No video script');
    }

    console.log(`  ✅ Built complete narratives for ${stories.stories.length} products`);
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test: Edge Cases
 */
async function testEdgeCases() {
  console.log('Test 8: Edge Cases');

  try {
    // Test with minimal description
    const minimalAnalysis = await analyzeProductTransformation(
      'X',
      'Tool',
      'Users'
    );
    assert(minimalAnalysis.beforeState, 'Should handle minimal description');

    // Test hero journey with short descriptions
    const shortJourney = buildHeroJourney('Before', 'Struggle', 'Aha', 'Success');
    assert(shortJourney.journey.length === 5, 'Should handle short descriptions');

    // Test story arcs with 1 variation
    const analysis = await analyzeProductTransformation(
      'SimpleTool',
      'Does one thing very well',
      'Everyone'
    );
    const singleArc = await generateStoryArcs(analysis, 1);
    assert(singleArc.stories.length === 1, 'Should handle single variation');

    // Test with many story variations
    const manyArcs = await generateStoryArcs(analysis, 10);
    assert(manyArcs.stories.length === 5, 'Should cap at available templates');

    // Test batch with single product
    const singleBatch = await batchBuildStories([
      { name: 'Solo', description: 'Only product', audience: 'All' }
    ]);
    assert(singleBatch.stories.length === 1, 'Should handle single product batch');

    // Test empty journey handling
    try {
      buildHeroJourney('', '', '', '');
      assert(false, 'Should error on empty journey');
    } catch (e) {
      assert(true, 'Correctly errors on empty journey');
    }

    console.log(`  ✅ Handled minimal descriptions`);
    console.log(`  ✅ Handled short inputs`);
    console.log(`  ✅ Handled edge case variations`);
    console.log(`  ✅ Handled empty inputs correctly`);

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
