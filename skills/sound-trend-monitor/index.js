const fs = require('fs');

const creativeCenter = JSON.parse(
  fs.readFileSync('/data/tiktok-intel/creative-center.json', 'utf8')
);

function getTrendingSounds() {
  return creativeCenter.trending_sounds.map(s => ({
    sound: s.sound,
    videos_using: s.videos,
    weekly_growth: s.growth,
    momentum: parseInt(s.growth) > 20 ? 'hot' : 'trending'
  }));
}

function analyzeSound(soundName) {
  const sound = creativeCenter.trending_sounds.find(s => s.sound.includes(soundName));
  if (!sound) return null;
  
  return {
    sound: sound.sound,
    usage_count: sound.videos,
    growth_rate: sound.growth,
    category: sound.category,
    best_for: sound.usage,
    opportunity_level: parseInt(sound.growth) > 20 ? 'emerging' : 'stable'
  };
}

function rankSoundsByGrowth() {
  return creativeCenter.trending_sounds
    .map(s => ({
      sound: s.sound,
      growth: parseInt(s.growth),
      usage: s.videos
    }))
    .sort((a, b) => b.growth - a.growth);
}

module.exports = {
  getTrendingSounds,
  analyzeSound,
  rankSoundsByGrowth
};
