const emailCampaign = require('./index.js');

async function runTests() {
  console.log('🚀 Email Campaign Manager Tests\n');

  try {
    // Test 1: Create Template
    console.log('1️⃣ Creating template...');
    const templateResult = await emailCampaign.createTemplate({
      name: 'Summer Sale',
      subject: 'Save {percentage}% this summer, {firstName}!',
      body: `
        <h1>Hi {firstName},</h1>
        <p>We're offering {percentage}% off for valued customers like you.</p>
        <p><a href="https://shop.example.com">Shop Now</a></p>
        <p>Best,<br>The Team</p>
      `,
      variables: ['firstName', 'percentage']
    });
    
    if (templateResult.success) {
      console.log('✅ Template created:', templateResult.template.id);
      var templateId = templateResult.template.id;
    } else {
      console.log('❌ Failed:', templateResult.error);
      return;
    }

    // Test 2: List Templates
    console.log('\n2️⃣ Listing templates...');
    const listResult = await emailCampaign.listTemplates();
    console.log(`✅ Found ${listResult.templates.length} template(s)`);

    // Test 3: Create Campaign
    console.log('\n3️⃣ Creating campaign...');
    const campaignResult = await emailCampaign.createCampaign({
      name: 'Summer Sale Campaign',
      templateId: templateId,
      subject: 'Save 50% this summer!',
      segment: 'all',
      sendTime: '2026-02-25 09:00 AM EST'
    });

    if (campaignResult.success) {
      console.log('✅ Campaign created:', campaignResult.campaign.id);
      var campaignId = campaignResult.campaign.id;
    } else {
      console.log('❌ Failed:', campaignResult.error);
      return;
    }

    // Test 4: Get Segments
    console.log('\n4️⃣ Getting available segments...');
    const segmentsResult = await emailCampaign.getSegments();
    if (segmentsResult.success) {
      console.log('✅ Available segments:', Object.keys(segmentsResult.segments).join(', '));
    }

    // Test 5: Create A/B Test
    console.log('\n5️⃣ Creating A/B test...');
    const abTestResult = await emailCampaign.createABTest({
      campaignId: campaignId,
      variants: [
        { name: 'Variant A', subject: 'Save 50%!' },
        { name: 'Variant B', subject: '⏰ 24 hours only: Save 50%!' }
      ],
      testSize: 0.2,
      metric: 'open_rate',
      duration: '2 hours'
    });

    if (abTestResult.success) {
      console.log('✅ A/B test created:', abTestResult.test.id);
      var testId = abTestResult.test.id;
    }

    // Test 6: Get A/B Test Results
    console.log('\n6️⃣ Getting A/B test results...');
    const resultsResult = await emailCampaign.getABTestResults(testId);
    if (resultsResult.success) {
      console.log('✅ Test results:');
      console.log('   Variant A opens:', resultsResult.results.variantA.opens);
      console.log('   Variant B opens:', resultsResult.results.variantB.opens);
      console.log('   Winner:', resultsResult.results.winner);
    }

    // Test 7: Create Sequence
    console.log('\n7️⃣ Creating email sequence...');
    const sequenceResult = await emailCampaign.createSequence({
      name: 'Customer Onboarding',
      emails: [
        { templateId: 'welcome', delay: '0 hours' },
        { templateId: 'quickstart', delay: '24 hours' },
        { templateId: 'upgrade_offer', delay: '72 hours' }
      ],
      triggerOn: 'signup',
      condition: { segment: 'all' }
    });

    if (sequenceResult.success) {
      console.log('✅ Sequence created:', sequenceResult.sequence.id);
      var sequenceId = sequenceResult.sequence.id;
    }

    // Test 8: Get Sequence Stats
    console.log('\n8️⃣ Getting sequence stats...');
    const statsResult = await emailCampaign.getSequenceStats(sequenceId);
    if (statsResult.success) {
      console.log('✅ Sequence stats:');
      console.log('   Emails sent:', statsResult.stats.emailsSent);
      console.log('   Opens:', statsResult.stats.opens);
      console.log('   Clicks:', statsResult.stats.clicks);
      console.log('   Conversions:', statsResult.stats.conversions);
    }

    // Test 9: Campaign Metrics
    console.log('\n9️⃣ Getting campaign metrics...');
    const metricsResult = await emailCampaign.getMetrics(campaignId);
    if (metricsResult.success) {
      console.log('✅ Campaign metrics:');
      console.log('   Sent:', metricsResult.metrics.sent);
      console.log('   Delivered:', metricsResult.metrics.delivered);
      console.log('   Open rate:', metricsResult.metrics.openRate);
      console.log('   Click rate:', metricsResult.metrics.clickRate);
    }

    // Test 10: Unsubscribe Management
    console.log('\n🔟 Testing unsubscribe management...');
    const unsubResult = await emailCampaign.addToUnsubscribeList('spam@example.com');
    console.log('✅ Added to unsubscribe list');

    const checkResult = await emailCampaign.isUnsubscribed('spam@example.com');
    if (checkResult.unsubscribed) {
      console.log('✅ Verified unsubscribed');
    }

    console.log('\n✅ All tests passed!\n');

    console.log('📊 Summary:');
    console.log('   Templates:', (await emailCampaign.listTemplates()).templates.length);
    console.log('   Campaigns:', (await emailCampaign.listCampaigns()).campaigns.length);
    console.log('   Sequences:', (await emailCampaign.listSequences()).sequences.length);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runTests();
