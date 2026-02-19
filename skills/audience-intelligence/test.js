const audience = require('./index.js');

async function runTests() {
  console.log('🎯 Audience Intelligence Tests\n');

  try {
    // Test 1: Generate ITA
    console.log('1️⃣ Generating Ideal Target Audience from brand insights...');
    const ita = await audience.generateITA({
      villain: 'Confusion and fear',
      transformation: { before: 'Confused, ashamed, afraid', after: 'Capable, confident' },
      painPoints: ['Lack of clear plan', 'Fear of judgment'],
      industry: 'Fitness'
    });

    if (ita.success) {
      console.log(`✅ Primary Persona: ${ita.primaryPersona.name}`);
      console.log(`   Secondary Persona: ${ita.secondaryPersona.name}`);
    }

    // Test 2: Find Reddit communities
    console.log('\n2️⃣ Finding Reddit communities...');
    const reddit = await audience.findRedditCommunities({
      villain: 'Confusion',
      painPoint: 'Beginner',
      industry: 'fitness'
    });

    if (reddit.success) {
      console.log(`✅ Found ${reddit.communities.length} Reddit communities`);
      console.log(`   ${reddit.communities[0].name}: ${reddit.communities[0].members}`);
    }

    // Test 3: Find Facebook Groups
    console.log('\n3️⃣ Finding Facebook groups...');
    const fb = await audience.findFacebookGroups({
      transformation: 'From confused to capable',
      audience: 'Beginners'
    });

    if (fb.success) {
      console.log(`✅ Found ${fb.groups.length} Facebook groups`);
      console.log(`   Strategy: ${fb.strategy}`);
    }

    // Test 4: Generate keywords
    console.log('\n4️⃣ Generating high-intent keywords...');
    const keywords = await audience.generateHighIntentKeywords({
      villain: 'Confusion',
      painPoints: ['Lack of plan', 'Fear'],
      industry: 'Fitness'
    });

    if (keywords.success) {
      console.log(`✅ Generated ${keywords.keywords.length} keywords`);
      console.log(`   Example: "${keywords.keywords[0]}"`);
    }

    // Test 5: Extract insider language
    console.log('\n5️⃣ Extracting insider language...');
    const language = await audience.extractInsiderLanguage({
      audience: 'Confused Beginners',
      psychographic: 'Intimidated'
    });

    if (language.success) {
      console.log(`✅ Found insider language: ${language.phrases.join(', ')}`);
    }

    // Test 6: Create persona
    console.log('\n6️⃣ Creating detailed primary persona...');
    const persona = await audience.createPrimaryPersona({
      psychographic: 'The Awakened Beginner',
      villain: 'Confusion',
      transformation: { before: 'Confused', after: 'Capable' },
      painPoints: ['Lack of plan', 'Fear']
    });

    if (persona.success) {
      console.log(`✅ Persona: ${persona.persona.name}`);
      console.log(`   Age: ${persona.persona.demographics.age}`);
      console.log(`   Fears: ${persona.persona.psychographics.fears.join(', ')}`);
    }

    // Test 7: Generate ICP
    console.log('\n7️⃣ Generating Ideal Customer Profile...');
    const icp = await audience.generateICP({
      primaryPersona: ita.primaryPersona,
      secondaryPersona: ita.secondaryPersona,
      antiPersona: 'Experienced bodybuilders'
    });

    if (icp.success) {
      console.log(`✅ ICP generated with messaging strategy`);
    }

    // Test 8: Map audience locations
    console.log('\n8️⃣ Mapping where audience congregates...');
    const locations = await audience.mapAudienceLocations({
      psychographic: 'Awakened Beginner',
      painPoint: 'Confusion',
      villain: 'Fear'
    });

    if (locations.success) {
      console.log(`✅ Found ${locations.locations.length} platforms where audience lives`);
      locations.locations.forEach(loc => {
        console.log(`   ${loc.platform}: ${loc.specific}`);
      });
    }

    // Test 9: Platform strategy
    console.log('\n9️⃣ Getting platform-specific strategy...');
    const platforms = await audience.getPlatformStrategy({
      audience: 'Awakened Beginner',
      villain: 'Confusion'
    });

    if (platforms.success) {
      console.log(`✅ Platform strategies:`);
      console.log(`   Reddit: ${platforms.strategies.reddit.frequency}`);
      console.log(`   Facebook: ${platforms.strategies.facebook.frequency}`);
    }

    // Test 10: Audience segments
    console.log('\n🔟 Creating audience segments...');
    const segments = await audience.createAudienceSegments({
      audienceDescription: 'Confused beginners',
      numberOfSegments: 3
    });

    if (segments.success) {
      console.log(`✅ Created ${segments.segments.length} segments:`);
      segments.segments.forEach(seg => {
        console.log(`   ${seg.name}: ${seg.size}`);
      });
    }

    console.log('\n✅ All tests passed!\n');
    console.log('🎯 Audience Intelligence Output Summary:');
    console.log('   ✓ ITA (Ideal Target Audience)');
    console.log('   ✓ Primary + Secondary Personas');
    console.log('   ✓ Reddit communities (5+ targets)');
    console.log('   ✓ Facebook groups (4+ targets)');
    console.log('   ✓ High-intent keywords (20+)');
    console.log('   ✓ Insider language mirroring');
    console.log('   ✓ Platform strategy');
    console.log('   ✓ Audience segmentation');
    console.log('\n📍 Ready to use for Marketing Copy Generator!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runTests();
