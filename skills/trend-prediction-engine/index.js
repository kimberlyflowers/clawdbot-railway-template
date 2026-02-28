const fs = require('fs');

const creativeCenter = JSON.parse(
  fs.readFileSync('/data/tiktok-intel/creative-center.json', 'utf8')
);
const googleTrends = JSON.parse(
  fs.readFileSync('/data/tiktok-intel/google-trends.json', 'utf8')
);

function predictTrendPeak(hashtag) {
  const trend = creativeCenter.trending_hashtags.find(h => h.tag.includes(hashtag.toLowerCase()));
  if (!trend) return null;
  
  const growthRate = parseInt(trend.growth);
  const daysToCategory = growthRate > 15 ? 7 : growthRate > 5 ? 14 : 21;
  const peakDate = new Date();
  peakDate.setDate(peakDate.getDate() + daysToCategory);
  
  return {
    hashtag: trend.tag,
    current_growth: trend.growth,
    videos_using: trend.videos,
    predicted_peak_date: peakDate.toISOString().split('T')[0],
    days_until_peak: daysToCategory,
    momentum_score: growthRate,
    recommended_action: growthRate > 15 ? 'Post now' : 'Monitor closely'
  };
}

function analyzeHashtagMomentum() {
  return creativeCenter.trending_hashtags
    .map(h => ({
      hashtag: h.tag,
      growth: parseInt(h.growth),
      videos: h.videos,
      momentum: parseInt(h.growth) > 10 ? 'accelerating' : 'stable'
    }))
    .sort((a, b) => b.growth - a.growth);
}

function predictEmerging() {
  return creativeCenter.trending_hashtags
    .filter(h => parseInt(h.growth) > 10)
    .map(h => ({
      hashtag: h.tag,
      growth: h.growth,
      opportunity: 'high'
    }))
    .slice(0, 3);
}

module.exports = {
  predictTrendPeak,
  analyzeHashtagMomentum,
  predictEmerging
};
