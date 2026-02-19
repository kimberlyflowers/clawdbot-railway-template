/**
 * DM Sales Engine
 * Converts conversations into customers through personalized DM flows
 * 
 * Use: For any DTC brand, coach, or service provider
 * Value: $300/month SaaS equivalent
 */

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

// Store flows and conversations in memory (in production, use database)
const flows = new Map();
const conversations = new Map();
const analytics = new Map();

/**
 * Create a DM conversation flow
 */
async function createDMFlow(flowName, triggerType, conversationSequence) {
  try {
    const flowId = `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Validate sequence
    if (!conversationSequence || conversationSequence.length === 0) {
      throw new Error('Conversation sequence must have at least 1 step');
    }
    
    // Store flow
    flows.set(flowId, {
      flowId,
      flowName,
      triggerType,
      conversationSequence,
      status: 'active',
      created: new Date().toISOString(),
      stats: {
        messagesProcessed: 0,
        conversions: 0,
        conversionRate: 0
      }
    });
    
    // Initialize analytics
    analytics.set(flowId, {
      flowId,
      incomingMessages: 0,
      responded: 0,
      qualified: 0,
      hotLeads: 0,
      warmLeads: 0,
      conversions: 0,
      revenue: 0
    });
    
    return {
      flowId,
      flowName,
      status: 'active',
      steps: conversationSequence.length,
      conversionPathLength: conversationSequence.length,
      estimatedConversionRate: estimateConversionRate(conversationSequence),
      created: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating DM flow:', error.message);
    return { error: error.message };
  }
}

/**
 * Generate response to an incoming DM
 */
async function respondToMessage(userId, messageContent, flowContext) {
  try {
    const flowId = flowContext.flowId;
    const flow = flows.get(flowId);
    
    if (!flow) {
      throw new Error(`Flow ${flowId} not found`);
    }
    
    // Get current step
    const currentStep = flowContext.currentStep || 1;
    const stepConfig = flow.conversationSequence[currentStep - 1];
    
    if (!stepConfig) {
      throw new Error(`Step ${currentStep} not found in flow`);
    }
    
    // Generate personalized response using Claude
    let response;
    
    if (process.env.ANTHROPIC_API_KEY) {
      const message = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `You are a sales expert generating a DM response. Context:
            
User message: "${messageContent}"
Current step: ${stepConfig.response || stepConfig.description}
Your goal: Move the conversation to the next step naturally

Generate a natural, personalized response (1-2 sentences max for DM) that continues the conversation. Be friendly, not salesy. Ask a follow-up question if appropriate.`
          }
        ]
      });
      response = message.content[0].text;
    } else {
      // Mock response for testing
      response = generateMockResponse(messageContent, stepConfig);
    }
    
    // Qualify the message
    const qualification = qualifyMessageContent(messageContent);
    
    // Update analytics
    const currentAnalytics = analytics.get(flowId);
    currentAnalytics.incomingMessages++;
    currentAnalytics.responded++;
    if (qualification.score >= 70) currentAnalytics.hotLeads++;
    else if (qualification.score >= 40) currentAnalytics.warmLeads++;
    
    return {
      responseId: `resp_${Date.now()}`,
      response,
      nextStep: Math.min(currentStep + 1, flow.conversationSequence.length),
      qualification: qualification.type,
      tone: 'friendly',
      contextUsed: [qualification.signal],
      suggestedFollowUpTime: '24h',
      leadScore: qualification.score
    };
  } catch (error) {
    console.error('Error responding to message:', error.message);
    return { error: error.message };
  }
}

/**
 * Qualify a lead based on conversation signals
 */async function qualifyLead(conversationHistory, niche) {
  try {
    let scoreBreakdown = {
      urgency: 0,
      problemClarity: 0,
      budgetSignal: 0,
      intent: 0,
      engagement: 0
    };
    
    let signals = {
      urgency: 'none',
      problemClarity: 'vague',
      budgetSignal: 'none',
      intent: 'curious',
      engagement: 'low'
    };
    
    // Analyze conversation history
    const fullText = conversationHistory
      .map(m => m.message || m.text || '')
      .join(' ')
      .toLowerCase();
    
    // Check urgency signals (higher weight)
    const urgencyKeywords = ['asap', 'urgent', 'need help now', 'emergency', 'right away'];
    if (urgencyKeywords.some(k => fullText.includes(k))) {
      scoreBreakdown.urgency = 30;
      signals.urgency = 'high';
    } else {
      scoreBreakdown.urgency = 5;  // Baseline for having message
    }
    
    // Check problem clarity (high weight)
    const problemKeywords = ['problem', 'challenge', 'struggle', 'issue', 'pain', 'challenge'];
    const specificQuestions = conversationHistory.filter(m => (m.message || '').includes('?')).length;
    if (problemKeywords.some(k => fullText.includes(k))) {
      scoreBreakdown.problemClarity = 25;
      signals.problemClarity = specificQuestions > 2 ? 'very_specific' : 'somewhat_specific';
    }
    
    // Check budget signals (strong signal)
    if (fullText.includes('price') || fullText.includes('cost') || fullText.includes('budget') || fullText.includes('invest') || fullText.includes('pricing')) {
      scoreBreakdown.budgetSignal = 25;
      signals.budgetSignal = 'mentioned';
    }
    
    // Check intent (very strong signal)
    const intentKeywords = ['booking', 'calendar', 'call', 'consultation', 'buy', 'purchase', 'interested', 'start', 'when', 'how do i'];
    if (intentKeywords.some(k => fullText.includes(k))) {
      scoreBreakdown.intent = 30;
      signals.intent = 'ready_to_buy';
    }
    
    // Check engagement (number of messages indicates interest)
    const responseCount = conversationHistory.length;
    const avgResponseLength = conversationHistory.reduce((sum, m) => sum + (m.message || '').length, 0) / responseCount;
    if (responseCount > 2) {
      scoreBreakdown.engagement = 15;
      signals.engagement = responseCount > 4 ? 'immediate_responses' : 'engaged';
    } else if (responseCount === 2) {
      scoreBreakdown.engagement = 10;
      signals.engagement = 'interested';
    }
    
    let totalScore = Object.values(scoreBreakdown).reduce((a, b) => a + b, 0);
    totalScore = Math.min(totalScore, 100);  // Cap at 100
    
    let leadStatus = 'cold';
    if (totalScore >= 70) leadStatus = 'hot';
    else if (totalScore >= 40) leadStatus = 'warm';
    
    return {
      leadScore: totalScore,
      leadStatus,
      signals,
      recommendation: leadStatus === 'hot' ? 'ROUTE TO SALES - This lead is ready to close' : 
                      leadStatus === 'warm' ? 'Nurture with more info' : 
                      'Continue building relationship',
      nextAction: leadStatus === 'hot' ? 'schedule_call' : 'send_value',
      estimatedCloseProbability: totalScore / 100
    };
  } catch (error) {
    console.error('Error qualifying lead:', error.message);
    return { error: error.message };
  }
}

/**
 * Batch generate responses for multiple messages
 */
async function batchGenerateDMResponses(incomingMessages, flowId) {
  try {
    const responses = [];
    let hotLeadsCount = 0;
    let routeToSalesCount = 0;
    
    for (const msg of incomingMessages) {
      const response = await respondToMessage(msg.userId, msg.message, {
        flowId,
        currentStep: 1
      });
      
      const qualification = qualifyMessageContent(msg.message);
      
      // Determine priority based on qualification score
      let action = 'respond';
      let priority = 'low';
      
      if (qualification.score >= 80) {
        action = 'route_to_sales';
        priority = 'high';
        hotLeadsCount++;
        routeToSalesCount++;
      } else if (qualification.score >= 70) {
        action = 'route_to_sales';
        priority = 'high';
        hotLeadsCount++;
        routeToSalesCount++;
      } else if (qualification.score >= 55) {
        action = 'nurture';
        priority = 'medium';
      } else if (qualification.score >= 40) {
        action = 'nurture';
        priority = 'medium';
      }
      
      responses.push({
        userId: msg.userId,
        response: response.response,
        action,
        priority,
        leadScore: qualification.score  // Use qualification score directly
      });
    }
    
    return {
      responses,
      totalResponses: responses.length,
      hotLeads: hotLeadsCount,
      routeToSales: routeToSalesCount,
      processed: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error batch generating responses:', error.message);
    return { error: error.message };
  }
}

/**
 * Analyze conversation quality
 */
async function analyzeConversationQuality(conversationHistory) {
  try {
    if (!conversationHistory || conversationHistory.length === 0) {
      return { error: 'No conversation history provided' };
    }
    
    // Calculate engagement metrics
    const messages = conversationHistory.length;
    const userMessages = conversationHistory.filter(m => m.sender === 'user').length;
    const avgResponseTime = calculateAvgResponseTime(conversationHistory);
    const avgMessageLength = calculateAvgMessageLength(conversationHistory);
    
    // Calculate progress through typical sales flow
    const hasQualifying = conversationHistory.some(m => 
      (m.message || '').toLowerCase().includes('problem') ||
      (m.message || '').toLowerCase().includes('challenge')
    );
    const hasObjection = conversationHistory.some(m => 
      (m.message || '').toLowerCase().includes('but') ||
      (m.message || '').toLowerCase().includes('however')
    );
    const hasClosingSignal = conversationHistory.some(m => 
      (m.message || '').toLowerCase().includes('when') ||
      (m.message || '').toLowerCase().includes('how do i')
    );
    
    let stepsCompleted = 1;
    if (hasQualifying) stepsCompleted += 1;
    if (hasObjection) stepsCompleted += 1;
    if (hasClosingSignal) stepsCompleted += 1;
    
    const objectionsRaised = countObjections(conversationHistory);
    
    const qualityScore = Math.min(
      100,
      (userMessages / messages) * 20 +  // Response rate
      Math.min(avgMessageLength / 100 * 30, 30) +  // Message depth
      stepsCompleted * 15 +  // Progress
      (objectionsRaised > 0 ? 15 : 0)  // Handling objections
    );
    
    return {
      qualityScore: Math.round(qualityScore),
      engagement: {
        responseTime: `${Math.round(avgResponseTime)} min avg`,
        messageLength: avgMessageLength > 100 ? 'long' : 'medium',
        engagement: qualityScore > 75 ? 'excellent' : qualityScore > 50 ? 'good' : 'needs_improvement'
      },
      progressMetrics: {
        stepsCompleted,
        stepsTotal: 5,
        objectionsRaised,
        objectionsResolved: 0  // Would be tracked in real implementation
      },
      recommendation: qualityScore > 75 ? 'Move to call/booking — conversation is going very well' :
                      qualityScore > 50 ? 'Continue nurturing — add value and build trust' :
                      'May need to re-qualify or change approach'
    };
  } catch (error) {
    console.error('Error analyzing conversation quality:', error.message);
    return { error: error.message };
  }
}

/**
 * Get analytics for a flow
 */
function getConversationAnalytics(flowId, dateRange = 'last_30_days') {
  try {
    const flowAnalytics = analytics.get(flowId);
    
    if (!flowAnalytics) {
      return { error: `No analytics found for flow ${flowId}` };
    }
    
    // Calculate derived metrics
    const responseRate = flowAnalytics.incomingMessages > 0 
      ? Math.round((flowAnalytics.responded / flowAnalytics.incomingMessages) * 100)
      : 0;
    
    const qualificationRate = flowAnalytics.responded > 0
      ? Math.round(((flowAnalytics.hotLeads + flowAnalytics.warmLeads) / flowAnalytics.responded) * 100)
      : 0;
    
    const conversionRate = (flowAnalytics.hotLeads > 0)
      ? Math.round((flowAnalytics.conversions / flowAnalytics.hotLeads) * 100)
      : 0;
    
    return {
      flowId,
      period: dateRange,
      metrics: {
        incomingMessages: flowAnalytics.incomingMessages,
        responded: flowAnalytics.responded,
        responseRate: `${responseRate}%`,
        qualified: flowAnalytics.hotLeads + flowAnalytics.warmLeads,
        hotLeads: flowAnalytics.hotLeads,
        warmLeads: flowAnalytics.warmLeads,
        conversions: flowAnalytics.conversions,
        conversionRate: `${conversionRate}%`,
        revenue: flowAnalytics.revenue
      },
      averageConversionPath: 3.2,
      topObjections: [
        'Price too high',
        'Need to think about it',
        'Not sure if it\'s for me'
      ],
      recommendations: [
        'Build response for price objection',
        'Create urgency for \'need to think\' responses',
        'Strengthen qualification questions'
      ]
    };
  } catch (error) {
    console.error('Error getting analytics:', error.message);
    return { error: error.message };
  }
}

/**
 * Helper: Estimate conversion rate based on flow design
 */
function estimateConversionRate(conversationSequence) {
  // Heuristic: good flows have 4-6 steps, clear qualifying, and closing trigger
  const length = conversationSequence.length;
  let baseRate = 15;
  
  // Longer flows might convert better (more qualification)
  if (length >= 5) baseRate += 5;
  
  // Check for qualifying step
  if (conversationSequence.some(s => (s.qualifier || '').includes('qualification'))) {
    baseRate += 5;
  }
  
  // Check for offer/closing step
  if (conversationSequence.some(s => s.action === 'offer' || s.action === 'route_to_booking')) {
    baseRate += 5;
  }
  
  return Math.min(baseRate, 40);
}

/**
 * Helper: Qualify a message based on content
 */
function qualifyMessageContent(content) {
  const lowerContent = (content || '').toLowerCase();
  let score = 35;  // Base score
  let signal = 'neutral';
  
  // Strong buying signals with urgency
  if (lowerContent.includes('asap') || lowerContent.includes('urgent') || lowerContent.includes('when can')) {
    score = 85;
    signal = 'ready_to_buy_urgent';
  }
  // Strong buying signals
  else if (lowerContent.includes('how do i') || lowerContent.includes('ready') || lowerContent.includes('can we hop on a call')) {
    score = 82;
    signal = 'ready_to_buy';
  }
  // Price/offer interest
  else if (lowerContent.includes('price') || lowerContent.includes('cost') || lowerContent.includes('offer') || lowerContent.includes('pricing')) {
    score = 75;
    signal = 'budget_conscious';
  }
  // Problem/challenge mention with specificity
  else if ((lowerContent.includes('challenge') || lowerContent.includes('struggle')) && lowerContent.length > 50) {
    score = 68;
    signal = 'problem_aware';
  }
  // Problem/challenge mention
  else if (lowerContent.includes('help') || lowerContent.includes('problem') || lowerContent.includes('struggling')) {
    score = 58;
    signal = 'problem_aware';
  }
  // Generic interest
  else if (lowerContent.includes('interested') || lowerContent.includes('tell me more')) {
    score = 50;
    signal = 'curious';
  }
  // Questions (show interest)
  else if (lowerContent.includes('?')) {
    score = 48;
    signal = 'questioning';
  }
  
  return { score, signal };
}

/**
 * Helper: Generate mock response based on step
 */
function generateMockResponse(userMessage, stepConfig) {
  const mockResponses = {
    'problem_discovery': 'That\'s really helpful to know. What\'s been the biggest challenge for you with [topic]?',
    'qualification': 'Got it! Just to make sure we\'re a good fit — are you ready to commit to making this change?',
    'offer': 'Based on what you\'ve shared, I think we can help. I\'ve got 3 spots this month for [offer].',
    'closing': 'Perfect! Let\'s get you started. Here\'s my calendar: [link]',
    'none': 'Thanks for reaching out! What brings you here today?'
  };
  
  return mockResponses[stepConfig.qualifier] || mockResponses['none'];
}

/**
 * Helper: Calculate average response time
 */
function calculateAvgResponseTime(conversationHistory) {
  let totalTime = 0;
  let count = 0;
  
  for (let i = 1; i < conversationHistory.length; i++) {
    if (conversationHistory[i].timestamp && conversationHistory[i-1].timestamp) {
      const time = new Date(conversationHistory[i].timestamp) - new Date(conversationHistory[i-1].timestamp);
      totalTime += time;
      count++;
    }
  }
  
  // Return minutes
  return count > 0 ? (totalTime / count / 60000) : 0;
}

/**
 * Helper: Calculate average message length
 */
function calculateAvgMessageLength(conversationHistory) {
  const totalLength = conversationHistory.reduce((sum, m) => sum + (m.message || '').length, 0);
  return totalLength / conversationHistory.length;
}

/**
 * Helper: Count objections in conversation
 */
function countObjections(conversationHistory) {
  const objectionKeywords = ['but', 'however', 'concern', 'hesitant', 'worried', 'not sure'];
  return conversationHistory.filter(m => 
    objectionKeywords.some(k => (m.message || '').toLowerCase().includes(k))
  ).length;
}

// Export functions
module.exports = {
  createDMFlow,
  respondToMessage,
  qualifyLead,
  batchGenerateDMResponses,
  analyzeConversationQuality,
  getConversationAnalytics
};
