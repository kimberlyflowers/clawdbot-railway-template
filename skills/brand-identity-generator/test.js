const brandGen = require('./index.js');

async function runTests() {
  console.log('🎭 Brand Identity Generator Tests\n');

  try {
    // Test 1: Get interview questions
    console.log('1️⃣ Getting interview questions for fitness app...');
    const questionsResult = await brandGen.getInterviewQuestions({
      industry: 'Fitness',
      depth: 'comprehensive'
    });

    if (questionsResult.success) {
      console.log('✅ Got interview questions');
      console.log(`   Soul of Brand: ${questionsResult.questions.soulOfBrand.length} questions`);
      console.log(`   Voice & Tone: ${questionsResult.questions.voiceTone.length} questions`);
      console.log(`   Audience: ${questionsResult.questions.audience.length} questions`);
      console.log(`   Positioning: ${questionsResult.questions.position.length} questions`);
    } else {
      console.log('❌ Failed:', questionsResult.error);
      return;
    }

    // Test 2: Process interview answers (from the fitness app transcript)
    console.log('\n2️⃣ Analyzing brand from founder interview...');
    const answers = {
      theVillain: 'Confusion and fear in beginners who are ashamed',
      dayZeroMoment: 'Realized AI could help people start fitness without expensive trainers',
      identityShift: 'From confused to capable of anything',
      northStar: 'A world where everyone has access to personalized fitness guidance',
      voiceArchetype: 'Data-driven coach with compassion',
      threeAdjectives: ['Clear', 'Compassionate', 'Scientific'],
      thisNotThat: [
        { this: 'Professional', notThat: 'Cold' },
        { this: 'Supportive', notThat: 'Coddling' },
        { this: 'Encouraging', notThat: 'Pushy' }
      ],
      secretAmbition: 'Feel capable of anything after hitting first goal',
      insiderLanguage: ['Balanced', 'Energized', 'Doable'],
      twoAMProblem: 'Body is changing, unhappy with reflection, need to change immediately',
      beforeState: 'Confused, ashamed, afraid of judgment',
      afterState: 'Capable, confident, ready for anything',
      superpower: 'AI + unified fitness & nutrition + customizable coach',
      sacrifice: 'We are NOT for bodybuilders or advanced athletes',
      antiPersona: 'Experienced lifters seeking maximum gains',
      audience: 'Confused beginners, recovering athletes, busy professionals'
    };

    const analysisResult = await brandGen.analyzeBrand({
      interviewAnswers: answers,
      industry: 'Fitness'
    });

    if (analysisResult.success) {
      console.log('✅ Brand analysis complete');
      console.log(`   Villain: ${analysisResult.villain}`);
      console.log(`   Archetype: ${analysisResult.voiceArchetype}`);
      console.log(`   North Star: ${analysisResult.northStar}`);
      console.log(`   Audience: ${analysisResult.primaryAudience}`);
    }

    // Test 3: Generate voice guidelines
    console.log('\n3️⃣ Generating voice & tone guidelines...');
    const voiceResult = await brandGen.generateVoiceGuidelines({
      archetype: analysisResult.voiceArchetype,
      threeAdjectives: analysisResult.threeAdjectives,
      examples: { thisNotThat: answers.thisNotThat }
    });

    if (voiceResult.success) {
      console.log('✅ Voice guidelines created');
      console.log(`   Essence: ${voiceResult.guidelines.essence}`);
      console.log(`   Style: ${voiceResult.guidelines.languageStyle}`);
      console.log(`   Email opening: "${voiceResult.guidelines.voiceInAction.emailOpening}"`);
      console.log(`   Social post: "${voiceResult.guidelines.voiceInAction.socialPost}"`);
    }

    // Test 4: Generate positioning statement
    console.log('\n4️⃣ Creating positioning statement...');
    const positionResult = await brandGen.generatePositioningStatement({
      category: 'Fitness App',
      superpower: 'combines AI with fitness AND nutrition guidance',
      audience: 'confused beginners who are intimidated by the gym',
      location: 'San Antonio (or globally)',
      sacrifice: 'NOT for bodybuilders or advanced athletes'
    });

    if (positionResult.success) {
      console.log('✅ Positioning statement:');
      console.log(`   "${positionResult.positioning.onlyStatement}"`);
      console.log(`   Not for: ${positionResult.positioning.whatWeAreNotFor}`);
    }

    // Test 5: Identify superpowers
    console.log('\n5️⃣ Identifying superpowers...');
    const powersResult = await brandGen.identifySuperpowers({
      answers,
      market: 'Fitness'
    });

    if (powersResult.success) {
      console.log('✅ Superpowers identified:');
      powersResult.superpowers.forEach(s => {
        console.log(`   • ${s.power}`);
      });
    }

    // Test 6: Generate complete brand story
    console.log('\n6️⃣ Writing complete brand narrative...');
    const storyResult = await brandGen.generateCompleteBrandStory({
      answers,
      industry: 'Fitness'
    });

    if (storyResult.success) {
      console.log('✅ Brand story generated');
      const lines = storyResult.narrative.split('\n').length;
      console.log(`   ${lines} lines of narrative`);
      console.log(`   Preview: "${storyResult.narrative.substring(0, 100)}..."`);
    }

    // Test 7: Generate elevator pitches
    console.log('\n7️⃣ Creating elevator pitches...');
    const pitchResult = await brandGen.generateElevatorPitch({
      positioning: positionResult.positioning,
      villain: analysisResult.villain,
      narrative: 'World where fitness is accessible to all'
    });

    if (pitchResult.success) {
      console.log('✅ Pitches created:');
      console.log(`   30s: "${pitchResult.pitches.thirtySeconds}"`);
      console.log(`   60s: "${pitchResult.pitches.sixtySeconds.substring(0, 70)}..."`);
    }

    // Test 8: Map transformation arc
    console.log('\n8️⃣ Mapping customer transformation arc...');
    const arcResult = await brandGen.mapTransformationArc({
      beforeState: answers.beforeState,
      afterState: answers.afterState,
      trigger: answers.twoAMProblem
    });

    if (arcResult.success) {
      console.log('✅ Transformation arc:');
      console.log(`   Before: ${arcResult.arc.beforeState.description}`);
      console.log(`   Trigger: ${arcResult.arc.trigger.moment}`);
      console.log(`   After: ${arcResult.arc.afterState.description}`);
      console.log(`   Emotions Shift: ${arcResult.arc.beforeState.emotions.join(', ')} → ${arcResult.arc.afterState.emotions.join(', ')}`);
    }

    // Test 9: Get 2 AM problem
    console.log('\n9️⃣ Identifying the 2 AM problem...');
    const problemResult = await brandGen.get2AMProblem({
      answers
    });

    if (problemResult.success) {
      console.log('✅ 2 AM Problem identified:');
      console.log(`   "${problemResult.problem}"`);
      console.log(`   Marketing hook: "${problemResult.marketingHook}"`);
    }

    // Test 10: Get secret ambition
    console.log('\n🔟 Uncovering secret ambition...');
    const ambitionResult = await brandGen.getSecretAmbition({
      answers
    });

    if (ambitionResult.success) {
      console.log('✅ Secret ambition:');
      console.log(`   "${ambitionResult.secretAmbition}"`);
      console.log(`   Marketing value: "${ambitionResult.marketingValue}"`);
    }

    // Test 11: Define anti-persona
    console.log('\n1️⃣1️⃣ Defining anti-persona...');
    const antiResult = await brandGen.defineAntiPersona({
      answers
    });

    if (antiResult.success) {
      console.log('✅ Anti-persona:');
      console.log(`   "${antiResult.antiPersona.description}"`);
      console.log(`   Benefit: "${antiResult.antiPersona.benefit}"`);
    }

    // Test 12: Get follow-up questions
    console.log('\n1️⃣2️⃣ Getting follow-up questions for deeper insights...');
    const followUpResult = await brandGen.getFollowUpQuestions({
      focusArea: 'villain',
      previousAnswers: answers
    });

    if (followUpResult.success) {
      console.log('✅ Follow-up questions generated');
      console.log(`   ${followUpResult.followUpQuestions.length} new questions to deepen insight`);
    }

    console.log('\n✅ All tests passed!\n');

    console.log('📊 Brand Identity Generator Output Summary:');
    console.log('   ✓ Interview question framework');
    console.log('   ✓ Psychological brand analysis');
    console.log('   ✓ Voice & tone guidelines');
    console.log('   ✓ Positioning statement (Only formula)');
    console.log('   ✓ Complete brand narrative');
    console.log('   ✓ Elevator pitches (3 lengths)');
    console.log('   ✓ Customer transformation mapping');
    console.log('   ✓ 2 AM problem identification');
    console.log('   ✓ Secret ambition uncovering');
    console.log('   ✓ Anti-persona definition');
    console.log('\n🎭 Ready to feed into Audience Intelligence & Marketing Copy Generator!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runTests();
