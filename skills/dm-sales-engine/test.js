/**
 * DM Sales Engine - Test Suite
 * All tests must pass before production use
 */

const {
  createDMFlow,
  respondToMessage,
  qualifyLead,
  batchGenerateDMResponses,
  analyzeConversationQuality,
  getConversationAnalytics
} = require('./index');

let testsPassed = 0;
let testsFailed = 0;

/**
 * Test runner
 */
async function runTests() {
  console.log('🧪 DM Sales Engine - Test Suite\n');
  
  // Test 1: Create DM Flow
  await testCreateDMFlow();
  
  // Test 2: Respond to Message
  await testRespondToMessage();
  
  // Test 3: Qualify Lead
  await testQualifyLead();
  
  // Test 4: Batch Generate Responses
  await testBatchGenerateResponses();
  
  // Test 5: Analyze Conversation Quality
  await testAnalyzeConversationQuality();
  
  // Test 6: Get Conversation Analytics
  await testGetConversationAnalytics();
  
  // Test 7: Multi-step Flow
  await testMultiStepFlow();
  
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
 * Test: Create DM Flow
 */
async function testCreateDMFlow() {
  console.log('Test 1: Create DM Flow');
  
  try {
    const result = await createDMFlow(
      'Test Coach Flow',
      'inbound_dm',
      [
        { step: 1, response: 'Welcome', qualifier: 'none' },
        { step: 2, response: 'Tell me more', qualifier: 'problem_discovery' },
        { step: 3, response: 'Are you ready?', qualifier: 'qualification' },
        { step: 4, response: 'Here\'s my offer', action: 'offer' },
        { step: 5, response: 'Let\'s book', action: 'route_to_booking' }
      ]
    );
    
    assert(result.flowId, 'No flow ID returned');
    assert(result.status === 'active', 'Flow not active');
    assert(result.steps === 5, 'Wrong number of steps');
    assert(result.estimatedConversionRate > 0, 'No conversion rate estimated');
    
    console.log(`  ✅ Created flow with ID: ${result.flowId}`);
    console.log(`  ✅ Estimated conversion rate: ${result.estimatedConversionRate}%`);
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test: Respond to Message
 */
async function testRespondToMessage() {
  console.log('Test 2: Respond to Message');
  
  try {
    // First create a flow
    const flow = await createDMFlow(
      'Test Flow',
      'inbound_dm',
      [
        { step: 1, response: 'Welcome', qualifier: 'none' },
        { step: 2, response: 'Qualify', qualifier: 'qualification' },
        { step: 3, response: 'Close', action: 'offer' }
      ]
    );
    
    const flowId = flow.flowId;
    
    // Now test responding
    const response = await respondToMessage(
      'user_123',
      'Hey! Is this coaching program for beginners?',
      {
        flowId,
        currentStep: 1,
        conversationHistory: []
      }
    );
    
    assert(response.responseId, 'No response ID');
    assert(response.response && response.response.length > 0, 'No response text');
    assert(response.nextStep >= 1, 'Invalid next step');
    assert(response.tone === 'friendly', 'Wrong tone');
    
    console.log(`  ✅ Generated response: "${response.response.substring(0, 50)}..."`);
    console.log(`  ✅ Lead score: ${response.leadScore}`);
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test: Qualify Lead
 */
async function testQualifyLead() {
  console.log('Test 3: Qualify Lead');
  
  try {
    // Hot lead
    const hotLead = [
      { sender: 'user', message: 'I\'m struggling with this problem and need help ASAP', timestamp: '2026-02-19T08:00:00Z' },
      { sender: 'bot', message: 'How can I help?', timestamp: '2026-02-19T08:01:00Z' },
      { sender: 'user', message: 'My challenge is X and Y. When can we start? What\'s the pricing?', timestamp: '2026-02-19T08:05:00Z' }
    ];
    
    const hotQualification = await qualifyLead(hotLead, 'coaching');
    
    assert(hotQualification.leadScore > 70, 'Hot lead should score high');
    assert(hotQualification.leadStatus === 'hot', 'Should be hot lead');
    assert(hotQualification.signals, 'No signals returned');
    
    // Cold lead
    const coldLead = [
      { sender: 'user', message: 'Just curious about this', timestamp: '2026-02-19T08:00:00Z' }
    ];
    
    const coldQualification = await qualifyLead(coldLead, 'coaching');
    
    assert(coldQualification.leadScore < 50, 'Cold lead should score low');
    assert(coldQualification.leadStatus === 'cold', 'Should be cold lead');
    
    console.log(`  ✅ Hot lead scored: ${hotQualification.leadScore}`);
    console.log(`  ✅ Cold lead scored: ${coldQualification.leadScore}`);
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test: Batch Generate Responses
 */
async function testBatchGenerateResponses() {
  console.log('Test 4: Batch Generate Responses');
  
  try {
    // Create flow first
    const flow = await createDMFlow(
      'Batch Test Flow',
      'inbound_dm',
      [
        { step: 1, response: 'Welcome', qualifier: 'none' },
        { step: 2, response: 'Qualify', qualifier: 'qualification' }
      ]
    );
    
    const incomingMessages = [
      { userId: 'user1', message: 'How much does this cost?' },
      { userId: 'user2', message: 'Is this for me?' },
      { userId: 'user3', message: 'Can we hop on a call ASAP?' }
    ];
    
    const result = await batchGenerateDMResponses(incomingMessages, flow.flowId);
    
    assert(result.responses && result.responses.length === 3, 'Wrong number of responses');
    assert(result.totalResponses === 3, 'Wrong response count');
    assert(result.hotLeads >= 0, 'Invalid hot leads count');
    assert(result.routeToSales >= 0, 'Invalid route to sales count');
    
    // Check that high-intent messages are prioritized
    const highIntentResponse = result.responses.find(r => r.userId === 'user3');
    assert(highIntentResponse.priority === 'high', 'High intent should have high priority');
    
    console.log(`  ✅ Generated ${result.totalResponses} responses`);
    console.log(`  ✅ Identified ${result.hotLeads} hot leads`);
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test: Analyze Conversation Quality
 */
async function testAnalyzeConversationQuality() {
  console.log('Test 5: Analyze Conversation Quality');
  
  try {
    // Good conversation
    const goodConversation = [
      { sender: 'user', message: 'Hi! I\'m really interested in your program. What\'s the problem it solves?' },
      { sender: 'bot', message: 'Great question! We help with X and Y. What\'s your biggest challenge?' },
      { sender: 'user', message: 'My challenge is definitely the workflow. How much does it cost and when can we start?' },
      { sender: 'bot', message: 'Perfect fit. Here\'s how it works... [details]' }
    ];
    
    const goodAnalysis = await analyzeConversationQuality(goodConversation);
    
    assert(goodAnalysis.qualityScore > 50, 'Good conversation should score well');
    assert(goodAnalysis.engagement, 'No engagement metrics');
    assert(goodAnalysis.progressMetrics, 'No progress metrics');
    assert(goodAnalysis.recommendation, 'No recommendation');
    
    // Poor conversation
    const poorConversation = [
      { sender: 'user', message: 'ok' }
    ];
    
    const poorAnalysis = await analyzeConversationQuality(poorConversation);
    
    assert(poorAnalysis.qualityScore < 50, 'Poor conversation should score low');
    
    console.log(`  ✅ Good conversation quality score: ${goodAnalysis.qualityScore}`);
    console.log(`  ✅ Poor conversation quality score: ${poorAnalysis.qualityScore}`);
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test: Get Conversation Analytics
 */
async function testGetConversationAnalytics() {
  console.log('Test 6: Get Conversation Analytics');
  
  try {
    // Create a flow
    const flow = await createDMFlow(
      'Analytics Test Flow',
      'inbound_dm',
      [
        { step: 1, response: 'Welcome', qualifier: 'none' },
        { step: 2, response: 'Qualify', qualifier: 'qualification' }
      ]
    );
    
    const flowId = flow.flowId;
    
    // Process some messages
    await batchGenerateDMResponses(
      [
        { userId: 'u1', message: 'Hi' },
        { userId: 'u2', message: 'Interested in pricing' }
      ],
      flowId
    );
    
    // Get analytics
    const analytics = await getConversationAnalytics(flowId, 'last_30_days');
    
    assert(analytics.flowId === flowId, 'Wrong flow ID');
    assert(analytics.metrics, 'No metrics');
    assert(analytics.metrics.incomingMessages > 0, 'Should have incoming messages');
    assert(analytics.metrics.responded > 0, 'Should have responses');
    assert(analytics.topObjections && analytics.topObjections.length > 0, 'No objections list');
    assert(analytics.recommendations && analytics.recommendations.length > 0, 'No recommendations');
    
    console.log(`  ✅ Analytics for flow ${flowId.substring(0, 10)}...`);
    console.log(`  ✅ Messages processed: ${analytics.metrics.incomingMessages}`);
    console.log(`  ✅ Response rate: ${analytics.metrics.responseRate}`);
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test: Multi-step Flow
 */
async function testMultiStepFlow() {
  console.log('Test 7: Multi-step Flow');
  
  try {
    // Create a realistic coach flow
    const flow = await createDMFlow(
      'Coach Consultation Flow',
      'inbound_dm',
      [
        { step: 1, response: 'Hey! What brings you here?', qualifier: 'none' },
        { step: 2, response: 'Tell me more about your challenge...', qualifier: 'problem_discovery' },
        { step: 3, response: 'Are you ready to commit?', qualifier: 'qualification' },
        { step: 4, response: 'Here\'s the program...', action: 'offer' },
        { step: 5, response: 'Let\'s book!', action: 'route_to_booking' }
      ]
    );
    
    assert(flow.steps === 5, 'Should have 5 steps');
    assert(flow.status === 'active', 'Should be active');
    assert(flow.estimatedConversionRate > 15, 'Should estimate >15% conversion for well-structured flow');
    
    // Simulate flow progression
    let currentStep = 1;
    let conversation = [];
    
    for (let i = 0; i < 4; i++) {
      const response = await respondToMessage(
        'test_user',
        `Message ${i + 1}`,
        {
          flowId: flow.flowId,
          currentStep,
          conversationHistory: conversation
        }
      );
      
      assert(response.nextStep > currentStep, `Should progress from step ${currentStep}`);
      currentStep = response.nextStep;
      conversation.push({ sender: 'bot', message: response.response });
    }
    
    console.log(`  ✅ Created 5-step flow`);
    console.log(`  ✅ Progressed through all steps`);
    console.log(`  ✅ Final conversion estimate: ${flow.estimatedConversionRate}%`);
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
    // Empty conversation history
    const emptyAnalysis = await analyzeConversationQuality([]);
    assert(emptyAnalysis.error, 'Should error on empty history');
    
    // Create flow with minimal steps
    const minimalFlow = await createDMFlow(
      'Minimal Flow',
      'inbound_dm',
      [{ step: 1, response: 'Hi' }]
    );
    assert(minimalFlow.steps === 1, 'Should accept single-step flow');
    
    // Qualify very short conversation
    const shortConvo = [{ sender: 'user', message: 'Hi' }];
    const shortQualification = await qualifyLead(shortConvo, 'coaching');
    assert(shortQualification.leadScore >= 0 && shortQualification.leadScore <= 100, 'Score should be valid');
    
    // Respond to message with special characters
    const specialResponse = await respondToMessage(
      'user123',
      'Hi! 🚀 Is this *really* the best? Cost = ?',
      {
        flowId: minimalFlow.flowId,
        currentStep: 1
      }
    );
    assert(specialResponse.response, 'Should handle special characters');
    
    // Batch with empty list
    const emptyBatch = await batchGenerateDMResponses([], minimalFlow.flowId);
    assert(emptyBatch.totalResponses === 0, 'Should handle empty batch');
    
    console.log(`  ✅ Handled empty conversation history`);
    console.log(`  ✅ Handled minimal flow (1 step)`);
    console.log(`  ✅ Handled special characters in messages`);
    console.log(`  ✅ Handled empty batch`);
    
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
