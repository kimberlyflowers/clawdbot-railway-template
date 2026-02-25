/**
 * DM Sales Automation
 * Send sequences, track responses, measure ROI
 */

class DMAutomation {
  constructor() {
    this.sequences = {};
    this.responses = [];
  }

  /**
   * Create DM sequence for Petal Core Beauty
   */
  createPCBSequence() {
    return {
      name: 'PCB Warm Follower Sequence',
      messages: [
        {
          day: 0,
          text: 'Hey! 👋 Noticed you\'ve been engaging with our posts — love that you care about clean skincare. Quick question: what\'s your biggest skin challenge right now?',
          goal: 'qualification'
        },
        {
          day: 1,
          text: 'Just wanted to share something that might help. Most serums have 2-3 active ingredients. Ours has 12 — all clean, all proven.',
          goal: 'introduce_difference'
        },
        {
          day: 2,
          text: 'Week 1 = skin feels softer. Week 2 = people notice your glow. We have 3,400+ customers who experienced this transformation.',
          goal: 'social_proof'
        },
        {
          day: 3,
          text: 'I have a code for first-time buyers. CLEANSTART = 15% off + free shipping.',
          goal: 'offer'
        },
        {
          day: 5,
          text: 'Last thing — no pressure. But the code expires Thursday.',
          goal: 'urgency'
        }
      ],
      expectedConversionRate: 0.08
    };
  }

  /**
   * Calculate automation ROI
   */
  calculateROI(leadCount, conversionRate, avgOrderValue) {
    const conversions = Math.round(leadCount * conversionRate);
    const revenue = conversions * avgOrderValue;
    const cost = leadCount * 0.05; // $0.05 per DM
    
    return {
      leadsTargeted: leadCount,
      expectedConversions: conversions,
      revenue: revenue,
      cost: cost,
      roi: ((revenue - cost) / cost * 100).toFixed(0) + '%'
    };
  }
}

module.exports = DMAutomation;
