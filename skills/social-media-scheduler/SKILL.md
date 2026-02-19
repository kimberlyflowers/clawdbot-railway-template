---
name: social-media-scheduler
description: Social media scheduling and automation - create, schedule, and distribute content across Twitter, Instagram, TikTok, LinkedIn with AI graphics generation, engagement tracking, and performance analytics.
---

# Social Media Scheduler

**Enterprise social media automation and content distribution**

## Overview

Schedule posts across major social platforms. Auto-generate graphics with Canvas and videos with video-frames. Track engagement, analyze performance, and optimize posting times.

## Features

- 📅 **Smart Scheduling** - Schedule posts, find optimal posting times
- 🎨 **Auto-Graphics** - Generate social graphics with Canvas API
- 🎬 **Auto-Video** - Generate videos with AI (video-frames + sag voiceover)
- 🔄 **Cross-posting** - Post to multiple platforms from one interface
- 📊 **Engagement Tracking** - Monitor likes, comments, shares, reach
- 🏆 **Performance Analytics** - Best performing posts, trends, audience insights
- 🏷️ **Hashtag Intelligence** - Auto-generate relevant hashtags, trending analysis
- 📱 **Platform Optimization** - Format content for each platform's best practices
- 🎯 **Audience Insights** - Demographics, engagement patterns, growth trends
- 🔔 **Notifications** - Alerts for high engagement, trending content

## Supported Platforms

- ✅ **Twitter/X** - Tweets, threads, retweets
- ✅ **LinkedIn** - Posts, articles, company updates
- ✅ **Instagram** - Posts, captions, story scheduling (via API)
- ✅ **TikTok** - Video scheduling (Business API)
- ✅ **Facebook** - Posts and scheduling
- 🔄 **YouTube** - Video scheduling via video-frames integration

## Core Functions

### Post Management

```javascript
// Create post
await socialScheduler.createPost({
  platforms: ['twitter', 'linkedin'],
  content: 'Check out our latest product update!',
  mediaType: 'image' | 'video' | 'carousel',
  autoGenerate: true,  // Auto-create graphics
  hashtags: ['auto']   // Auto-generate hashtags
})

// Schedule post
await socialScheduler.schedulePost(postId, {
  platforms: ['twitter', 'linkedin'],
  scheduledTime: '2026-02-25T09:00:00Z',
  bestTime: true  // Use optimal time for each platform
})

// Get scheduled posts
await socialScheduler.getScheduledPosts()

// Get post details
await socialScheduler.getPost(postId)

// Edit post (before posting)
await socialScheduler.updatePost(postId, { content: '...' })

// Delete post
await socialScheduler.deletePost(postId)

// Publish immediately
await socialScheduler.publishPost(postId)
```

### Content Creation

```javascript
// Auto-generate graphics
await socialScheduler.generateGraphic({
  postId: 'post_123',
  template: 'announcement' | 'quote' | 'product' | 'event',
  text: 'Your post text',
  brandColors: { primary: '#FF6B6B', secondary: '#4ECDC4' },
  includeImage: true
})

// Auto-generate video
await socialScheduler.generateVideo({
  postId: 'post_123',
  template: 'product_demo' | 'testimonial' | 'tutorial',
  voiceoverText: 'Speaking script',
  images: ['url1', 'url2'],
  musicTrack: 'upbeat'  // Optional background music
})

// Get media
await socialScheduler.getMediaForPost(postId)

// Upload media
await socialScheduler.uploadMedia(postId, {
  type: 'image',
  media: Buffer | URL
})
```

### Hashtags & Optimization

```javascript
// Auto-generate hashtags
await socialScheduler.generateHashtags({
  text: 'Post content',
  platform: 'twitter',  // Different hashtags per platform
  count: 10,
  trending: true  // Include trending hashtags
})

// Get trending hashtags for industry
await socialScheduler.getTrendingHashtags({
  industry: 'SaaS',
  region: 'US',
  limit: 20
})

// Get hashtag performance
await socialScheduler.getHashtagStats(hashtag)
```

### Timing & Optimization

```javascript
// Get optimal posting times
await socialScheduler.getBestPostingTime({
  platform: 'twitter',
  audience: 'tech_professionals',
  dayOfWeek: 'Tuesday'
})

// Analyze audience timezone
await socialScheduler.getAudienceTimezones()

// Get posting schedule recommendations
await socialScheduler.getScheduleRecommendations({
  postsPerWeek: 5,
  bestTimes: true
})
```

### Engagement Tracking

```javascript
// Track post performance
await socialScheduler.getPostMetrics(postId)
// Returns: { likes, comments, shares, retweets, reach, impressions, engagementRate }

// Get real-time engagement
await socialScheduler.getLiveMetrics(postId, platform)

// Track comment sentiment
await socialScheduler.getCommentSentiment(postId)

// Get share breakdown
await socialScheduler.getShareBreakdown(postId)
// Returns: { direct, retweets, mentions, replies }
```

### Analytics & Reporting

```javascript
// Get analytics dashboard
await socialScheduler.getAnalytics({
  startDate: '2026-02-01',
  endDate: '2026-02-19',
  platforms: ['twitter', 'linkedin']
})

// Top performing posts
await socialScheduler.getTopPosts({
  metric: 'engagement' | 'reach' | 'conversions',
  limit: 10,
  timeframe: '30_days' | '7_days' | 'all_time'
})

// Audience growth
await socialScheduler.getGrowthMetrics({
  timeframe: '30_days'
})
// Returns: { followers, engagement_rate, reach_growth, impression_growth }

// Competitor analysis
await socialScheduler.getCompetitorAnalysis({
  competitors: ['@competitor1', '@competitor2'],
  metric: 'engagement_rate'
})

// Generate report
await socialScheduler.getReport({
  platforms: ['twitter', 'linkedin'],
  startDate: '2026-02-01',
  endDate: '2026-02-19'
})
```

### Calendar & Planning

```javascript
// Get content calendar
await socialScheduler.getContentCalendar({
  startDate: '2026-02-01',
  endDate: '2026-02-28'
})

// Create content plan
await socialScheduler.createContentPlan({
  month: 'February',
  postsPerWeek: 5,
  contentMix: {
    educational: 0.4,
    promotional: 0.3,
    engagement: 0.2,
    news: 0.1
  }
})

// Get calendar suggestions
await socialScheduler.getSuggestions({
  dayOfWeek: 'Monday'
})
```

### Team Collaboration

```javascript
// Schedule content queue
await socialScheduler.getQueue()

// Add to queue
await socialScheduler.queuePost(postId)

// Approve post (for multi-user workflows)
await socialScheduler.approvePost(postId)

// Bulk schedule
await socialScheduler.bulkSchedule([
  { content: 'Post 1', scheduledTime: '...' },
  { content: 'Post 2', scheduledTime: '...' }
])
```

## Usage Example

```javascript
const socialScheduler = require('./skills/social-media-scheduler');

// Step 1: Create a post with auto-generated graphic
const post = await socialScheduler.createPost({
  platforms: ['twitter', 'linkedin', 'instagram'],
  content: 'Excited to announce our new AI features! 🚀 Learn more in our latest blog post.',
  mediaType: 'image',
  autoGenerate: true,
  hashtags: ['auto']  // Auto-generate hashtags
});

console.log(`Post created: ${post.id}`);

// Step 2: Auto-generate graphics for each platform
const graphic = await socialScheduler.generateGraphic({
  postId: post.id,
  template: 'announcement',
  text: 'New AI Features Available',
  brandColors: { primary: '#FF6B6B', secondary: '#4ECDC4' }
});

console.log(`Graphic generated: ${graphic.url}`);

// Step 3: Get optimal posting time for your audience
const bestTime = await socialScheduler.getBestPostingTime({
  platform: 'twitter',
  audience: 'tech_professionals'
});

console.log(`Best time to post: ${bestTime.time}`);

// Step 4: Schedule across platforms at optimal times
const scheduled = await socialScheduler.schedulePost(post.id, {
  platforms: ['twitter', 'linkedin', 'instagram'],
  bestTime: true  // Automatically use optimal times
});

console.log(`Scheduled for: ${scheduled.scheduleTimes}`);

// Step 5: Get analytics as engagement comes in
setInterval(async () => {
  const metrics = await socialScheduler.getPostMetrics(post.id);
  console.log(`Engagement: ${metrics.likes} likes, ${metrics.shares} shares`);
}, 60000);

// Step 6: Analyze performance
const topPosts = await socialScheduler.getTopPosts({
  metric: 'engagement',
  timeframe: '7_days',
  limit: 5
});

console.log('Top performing posts this week:');
topPosts.forEach(p => {
  console.log(`- ${p.content.substring(0, 50)}... (${p.engagementRate}%)`);
});
```

## Platform-Specific Best Practices

### Twitter/X
- Optimal length: 280 characters (or 500+ for threads)
- Best posting times: 8-10 AM, 5-6 PM weekdays
- Hashtags: 2-3 relevant hashtags
- Engagement: Retweets, replies, likes

### LinkedIn
- Optimal length: 1300+ characters (more is better)
- Best posting times: Tuesday-Thursday, 8 AM-12 PM
- Hashtags: 5-10 industry-relevant
- Engagement: Comments drive reach

### Instagram
- Optimal length: 125-150 characters (caption)
- Best posting times: 11 AM, 1-3 PM, 7-9 PM
- Hashtags: 20-30 relevant hashtags
- Engagement: Comments/saves drive algorithm

### TikTok
- Video length: 15-60 seconds (shorter = higher engagement)
- Best posting times: 6-10 AM, 7-11 PM
- Sound: Trending audio is critical
- Engagement: Shares and watch time drive reach

## Integrations

- **Canvas** (verified) - Auto-generate social graphics
- **video-frames** (verified) - Auto-generate videos
- **sag** (verified) - Auto-generate voiceovers
- **GHL** (verified) - Track social interactions as CRM activities
- **Email Campaign Manager** - Cross-channel marketing
- **Discord/Slack** (verified) - Team notifications

## Configuration

```bash
# Required API Keys
TWITTER_API_KEY=<your_key>
TWITTER_API_SECRET=<your_secret>
TWITTER_ACCESS_TOKEN=<your_token>
TWITTER_ACCESS_SECRET=<your_token_secret>

INSTAGRAM_ACCESS_TOKEN=<your_token>
LINKEDIN_ACCESS_TOKEN=<your_token>
TIKTOK_ACCESS_TOKEN=<your_token>
FACEBOOK_PAGE_ACCESS_TOKEN=<your_token>

# Optional
CANVAS_API_KEY=<via_ghl>
BRAND_COLOR_PRIMARY=#FF6B6B
BRAND_COLOR_SECONDARY=#4ECDC4
```

## Performance & Limits

- **Post scheduling**: Unlimited future posts
- **API rate limits**: Respects platform rate limits (automatic queuing)
- **Concurrent posts**: Up to 50 simultaneous posts
- **Analytics**: Real-time updates, 90-day history
- **Content library**: Unlimited storage

## Expected Results

- **Consistency**: 5-7 posts/week maintained
- **Engagement lift**: 30-50% with optimal timing
- **Reach growth**: 10-20% monthly growth with consistent posting
- **Conversion**: 2-5% CTR on links in posts

---

**Built by**: Jaden  
**Status**: Production Ready  
**Verified Dependencies**: Canvas ✅, video-frames ✅, sag ✅, GHL ✅
