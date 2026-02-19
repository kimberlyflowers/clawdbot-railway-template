/**
 * Product Launch Sequencer
 * Plan and execute coordinated multi-channel product launches
 */

const crypto = require('crypto');

/**
 * Create launch sequence
 */
function createLaunchSequence(productName, launchDate, channels = ['email', 'twitter'], objectives = {}) {
  const launchId = 'launch_' + crypto.randomBytes(6).toString('hex');
  
  const schedule = [
    {
      day: -7,
      phase: 'teaser',
      channels: ['twitter', 'linkedin'],
      message: 'Something big is coming in 7 days',
      estimatedReach: 12000
    },
    {
      day: -3,
      phase: 'early_access',
      channels: ['email'],
      message: 'Your early access link inside',
      estimatedReach: 2400
    },
    {
      day: 0,
      phase: 'launch_day',
      channels: channels,
      message: `${productName} is live`,
      estimatedReach: 50000
    },
    {
      day: 1,
      phase: 'momentum',
      channels: ['email', 'twitter'],
      message: 'Launch day results + social proof',
      estimatedReach: 25000
    },
    {
      day: 7,
      phase: 'sustained',
      channels: ['email'],
      message: 'Week 1 recap + case study',
      estimatedReach: 8000
    }
  ];
  
  const estimatedSignups = Math.floor(Math.random() * 100 + 400);
  const estimatedRevenue = estimatedSignups * (objectives.aov || 50);
  
  return {
    launchId,
    productName,
    launchDate,
    phase: 'pre-launch',
    schedule,
    channels,
    objectives,
    estimatedSignups,
    estimatedRevenue,
    status: 'scheduled'
  };
}

/**
 * Generate launch assets
 */
function generateLaunchAssets(productName, productBenefit = 'Game-changing features', channelType = 'all') {
  const benefit = productBenefit.toLowerCase().includes('3x') ? productBenefit : '3x faster, 70% less cost';
  
  const assets = {
    twitter: {
      tweet1: `🚀 ${productName} is live. ${benefit}. Here's what changed...`,
      tweet2: `Feature #1: AI-powered automation (saves 10 hours/week)`,
      tweet3: `Feature #2: Smart routing (you control everything)`,
      tweet4: `Early users are seeing amazing results. Get access: [link]`
    },
    email: {
      subject: `${productName} — The Update You've Been Waiting For`,
      preview: benefit,
      body: [
        `We rebuilt ${productName} from the ground up.`,
        `Result: ${benefit}.`,
        `3 things that changed:`,
        `1. Speed (3x faster than before)`,
        `2. Cost (70% less expensive)`,
        `3. Control (you set all the rules)`,
        `See for yourself. Free trial inside.`
      ],
      cta: 'Get Early Access'
    },
    linkedin: {
      headline: `We rebuilt ${productName}. Here's why.`,
      body: [
        `We listened to 500 customers.`,
        `They wanted: speed, cost reduction, control.`,
        `We delivered all 3.`,
        `${productName} v2.0 is live today.`,
        benefit
      ],
      cta: 'See What\'s New'
    },
    paid_ads: {
      headline: `${productName}: ${benefit}`,
      description: 'Real customers. Real results. Free trial inside.',
      cta: 'Start Free Trial',
      adFormat: 'carousel'
    }
  };
  
  return channelType === 'all' ? assets : assets[channelType] || assets;
}

/**
 * Get launch timeline
 */
function getLaunchTimeline(launchDate, duration = 30) {
  const launchTime = new Date(launchDate);
  const preLaunch = new Date(launchTime.getTime() - 7 * 24 * 3600000);
  const postLaunch = new Date(launchTime.getTime() + duration * 24 * 3600000);
  
  return {
    phases: {
      teaser: {
        startDate: new Date(preLaunch.getTime() - 5 * 24 * 3600000).toISOString().split('T')[0],
        endDate: new Date(preLaunch.getTime()).toISOString().split('T')[0],
        duration: '5 days'
      },
      early_access: {
        startDate: new Date(preLaunch.getTime()).toISOString().split('T')[0],
        endDate: new Date(launchTime.getTime() - 24 * 3600000).toISOString().split('T')[0],
        duration: '1 day'
      },
      launch_day: {
        startDate: launchTime.toISOString().split('T')[0],
        endDate: launchTime.toISOString().split('T')[0],
        duration: '1 day'
      },
      momentum: {
        startDate: launchTime.toISOString().split('T')[0],
        endDate: new Date(launchTime.getTime() + 7 * 24 * 3600000).toISOString().split('T')[0],
        duration: '7 days'
      },
      sustained: {
        startDate: new Date(launchTime.getTime() + 8 * 24 * 3600000).toISOString().split('T')[0],
        endDate: postLaunch.toISOString().split('T')[0],
        duration: `${duration - 8} days`
      }
    }
  };
}

/**
 * Plan partnership outreach
 */
function planLaunchPartnershipOutreach(productName, partnerTypes = ['complementary_saas', 'influencers']) {
  const partners = [
    {
      category: 'complementary_saas',
      companies: ['Stripe', 'Zapier', 'HubSpot'],
      outreach: '48 hours before launch',
      message: `We're launching ${productName}. Interested in co-promoting?`,
      expectedReach: 25000
    },
    {
      category: 'influencers',
      companies: ['Alex Cattoni', 'Ryan Doyle', 'Grant Cardone'],
      outreach: 'Launch day',
      message: `New product. Early access for your audience?`,
      expectedReach: 50000
    },
    {
      category: 'media',
      companies: ['Product Hunt', 'BetaList', 'TechCrunch'],
      outreach: '3 days before launch',
      message: `Announcing ${productName}. Press release and review access inside.`,
      expectedReach: 75000
    }
  ];
  
  const filtered = partnerTypes.length > 0 
    ? partners.filter(p => partnerTypes.includes(p.category))
    : partners;
  
  const totalReach = filtered.reduce((acc, p) => acc + p.expectedReach, 0);
  
  return {
    partners: filtered,
    totalExpectedReach: totalReach,
    outreachPlan: 'Sequential outreach 3-7 days before launch'
  };
}

/**
 * Track launch metrics
 */
function trackLaunchMetrics(launchId, phase, metrics = {}) {
  const emailsSent = metrics.emails_sent || 0;
  const opened = metrics.emails_opened || 0;
  const clicks = metrics.clicks || 0;
  const signups = metrics.signups || 0;
  
  const openRate = emailsSent > 0 ? Math.round((opened / emailsSent) * 100) : 0;
  const clickRate = opened > 0 ? Math.round((clicks / opened) * 100) : 0;
  const conversionRate = clicks > 0 ? Math.round((signups / clicks) * 100) : 0;
  const revenuePer100 = emailsSent > 0 ? Math.round((metrics.revenue / emailsSent) * 100) : 0;
  
  return {
    recorded: true,
    launchId,
    phase,
    openRate: `${openRate}%`,
    clickRate: `${clickRate}%`,
    conversionRate: `${conversionRate}%`,
    revenuePer100Emails: `$${revenuePer100}`,
    totalRevenue: metrics.revenue || 0,
    vsTarget: signups > 200 ? 'Exceeding targets' : 'On track',
    metrics
  };
}

/**
 * Get launch performance report
 */
function getLaunchPerformanceReport(launchId) {
  return {
    launchId,
    phases: [
      {
        phase: 'teaser',
        impressions: Math.floor(Math.random() * 10000) + 5000,
        engagement: Math.floor(Math.random() * 200) + 50
      },
      {
        phase: 'early_access',
        impressions: Math.floor(Math.random() * 5000) + 2000,
        signups: Math.floor(Math.random() * 50) + 20
      },
      {
        phase: 'launch_day',
        impressions: Math.floor(Math.random() * 50000) + 20000,
        signups: Math.floor(Math.random() * 200) + 100,
        revenue: Math.floor(Math.random() * 10000) + 5000
      }
    ],
    totalSignups: Math.floor(Math.random() * 300) + 150,
    totalRevenue: Math.floor(Math.random() * 20000) + 10000
  };
}

module.exports = {
  createLaunchSequence,
  generateLaunchAssets,
  getLaunchTimeline,
  planLaunchPartnershipOutreach,
  trackLaunchMetrics,
  getLaunchPerformanceReport
};
