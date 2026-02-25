/**
 * TikTok Shop ROI Tracker
 * Link videos to real sales data
 */

class TikTokROITracker {
  constructor() {
    this.videoMetrics = new Map();
  }

  /**
   * Track video performance with sales data
   */
  trackVideo(videoData) {
    return {
      videoId: videoData.videoId,
      views: videoData.views,
      saves: videoData.saves,
      clicks: videoData.shopClicks,
      conversions: videoData.conversions,
      revenue: videoData.revenue,
      conversionRate: (videoData.conversions / videoData.shopClicks * 100).toFixed(2) + '%',
      roi: ((videoData.revenue - 50) / 50 * 100).toFixed(0) + '%',
      recommendation: videoData.conversions > 10 ? 'SCALE' : 'OPTIMIZE'
    };
  }

  /**
   * Calculate ROI for Petal Core Beauty videos
   */
  pcbVideoAnalysis() {
    const videos = [
      {
        videoId: 'pcb-hook-1',
        title: 'POV: You\'ve been using the wrong serum',
        views: 2400000,
        saves: 145000,
        shopClicks: 89000,
        conversions: 3400,
        revenue: 108800
      },
      {
        videoId: 'pcb-hook-2',
        title: 'This one serum did what my $200 routine couldn\'t',
        views: 1800000,
        saves: 98000,
        shopClicks: 67000,
        conversions: 2680,
        revenue: 85760
      },
      {
        videoId: 'pcb-hook-3',
        title: 'Dermatologist explains why this serum works',
        views: 1200000,
        saves: 72000,
        shopClicks: 54000,
        conversions: 2160,
        revenue: 69120
      }
    ];

    const results = videos.map(v => this.trackVideo(v));
    return {
      totalViews: videos.reduce((a, b) => a + b.views, 0),
      totalClicks: videos.reduce((a, b) => a + b.shopClicks, 0),
      totalConversions: videos.reduce((a, b) => a + b.conversions, 0),
      totalRevenue: videos.reduce((a, b) => a + b.revenue, 0),
      avgConversionRate: (videos.reduce((a, b) => a + b.conversions, 0) / videos.reduce((a, b) => a + b.shopClicks, 0) * 100).toFixed(2) + '%',
      videos: results
    };
  }
}

module.exports = TikTokROITracker;
