/**
 * Test suite for Content Repurposer
 */

const repurposer = require('./index.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(`   Error: ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log('🧪 Content Repurposer Tests\n');

test('Repurpose blog post to multiple formats', () => {
  const content = 'This is a long blog post about AI and automation in marketing. It covers multiple angles...';
  const result = repurposer.repurposeContent(
    content,
    'blog_post',
    ['twitter', 'email', 'linkedin']
  );
  
  assert(result.repurposeId.startsWith('repurpose_'), 'Should have repurpose ID');
  assert(result.outputCount === 3, 'Should generate 3 outputs');
  assert(result.outputs.twitter, 'Should have twitter output');
  assert(result.outputs.email, 'Should have email output');
  assert(result.outputs.linkedin, 'Should have linkedin output');
});

test('Repurpose with default formats', () => {
  const content = 'Sample content for repurposing';
  const result = repurposer.repurposeContent(content, 'blog_post');
  
  assert(result.outputCount >= 3, 'Should have at least 3 default formats');
});

test('Generate for all supported platforms', () => {
  const content = 'Test content';
  const platforms = ['twitter', 'email', 'linkedin', 'tiktok_script', 'instagram_carousel'];
  const result = repurposer.repurposeContent(content, 'blog_post', platforms);
  
  assert(result.outputCount === 5, 'Should generate for all platforms');
  assert(result.outputs.tiktok_script, 'Should have TikTok script');
  assert(result.outputs.instagram_carousel, 'Should have Instagram carousel');
});

test('Extract content pillars', () => {
  const content = 'This article discusses automation, cost reduction, and data-driven decisions';
  const result = repurposer.extractContentPillars(content);
  
  assert(Array.isArray(result.pillars), 'Should return pillars array');
  assert(result.pillars.length > 0, 'Should extract pillars');
  assert(result.pillars[0].pillar, 'Each pillar should have text');
  assert(typeof result.pillars[0].importance === 'number', 'Should have importance score');
});

test('Generate email sequence', () => {
  const result = repurposer.generateEmailSequence('AI automation', 3);
  
  assert(Array.isArray(result.sequence), 'Should return email sequence array');
  assert(result.sequence.length === 3, 'Should have 3 emails');
  assert(result.sequence[0].subject, 'Each email should have subject');
  assert(result.sequence[0].angle, 'Each email should have angle');
  assert(result.sequence[0].cta, 'Each email should have CTA');
});

test('Generate variable email sequences', () => {
  const seq1 = repurposer.generateEmailSequence('Topic', 2);
  const seq3 = repurposer.generateEmailSequence('Topic', 5);
  
  assert(seq1.sequence.length === 2, 'Should generate 2-email sequence');
  assert(seq3.sequence.length === 5, 'Should generate 5-email sequence');
});

test('Generate Twitter clips', () => {
  const content = 'Sample content for Twitter';
  const result = repurposer.generateSocialMediaClips(content, 'twitter');
  
  assert(result.platform === 'twitter', 'Should specify platform');
  assert(Array.isArray(result.clips), 'Should have clips array');
  assert(result.clips.length > 0, 'Should generate clips');
  assert(result.clips[0].viral_score, 'Should score virality');
});

test('Generate TikTok scripts', () => {
  const content = 'Sample content';
  const result = repurposer.generateSocialMediaClips(content, 'tiktok');
  
  assert(result.platform === 'tiktok', 'Should specify TikTok platform');
  assert(Array.isArray(result.scripts), 'Should have scripts');
  assert(result.scripts[0].hook, 'Script should have hook');
  assert(result.scripts[0].videoLength, 'Script should have video length');
});

test('Generate Instagram content', () => {
  const content = 'Sample content';
  const result = repurposer.generateSocialMediaClips(content, 'instagram');
  
  assert(result.platform === 'instagram', 'Should specify Instagram');
});

test('Get batch repurpose statistics', () => {
  const result = repurposer.getBatchRepurposeStats('repurpose_123');
  
  assert(result.repurposeId === 'repurpose_123', 'Should have ID');
  assert(result.totalImpressionsAcrossPlatforms > 0, 'Should have total impressions');
  assert(result.impressionBreakdown.twitter > 0, 'Should break down by platform');
  assert(result.engagement.clicks > 0, 'Should have engagement metrics');
  assert(result.engagement.clickRate, 'Should have click rate');
});

test('Get repurpose score', () => {
  const result = repurposer.getRepurposeScore(3000, 'blog_post');
  
  assert(typeof result.repurposeScore === 'number', 'Should return numeric score');
  assert(result.repurposeScore >= 0 && result.repurposeScore <= 100, 'Score should be 0-100');
  assert(result.recommendation, 'Should have recommendation');
});

test('Score different content types', () => {
  const blogPost = repurposer.getRepurposeScore(3000, 'blog_post');
  const caseStudy = repurposer.getRepurposeScore(3000, 'case_study');
  
  assert(caseStudy.repurposeScore > blogPost.repurposeScore, 'Case study should score higher');
});

test('Handle missing content gracefully', () => {
  const result = repurposer.repurposeContent('');
  
  assert(result.error || result.repurposeId, 'Should handle empty content');
});

// Summary
console.log(`\n📊 Test Summary: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
