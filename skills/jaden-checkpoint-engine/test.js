/**
 * Test suite for Jaden Checkpoint Engine
 */

const checkpoint = require('./index.js');
const fs = require('fs');
const path = require('path');

const CHECKPOINT_FILE = checkpoint.CHECKPOINT_FILE;

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

function cleanup() {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    fs.unlinkSync(CHECKPOINT_FILE);
  }
}

// Run tests
console.log('🧪 Jaden Checkpoint Engine Tests\n');

cleanup();

test('Save checkpoint with skill #2', () => {
  const result = checkpoint.saveCheckpoint(
    2,
    'DM Sales Engine',
    'in_progress',
    { passing: 8, failing: 2, total: 10 }
  );
  
  assert(result.saved === true, 'Result should have saved: true');
  assert(result.checkpoint.skillNumber === 2, 'Skill number should be 2');
  assert(result.checkpoint.isBuildInProgress === true, 'Build should be marked in progress');
});

test('Load checkpoint and verify data', () => {
  const state = checkpoint.loadCheckpoint();
  
  assert(state.exists === true, 'Checkpoint should exist');
  assert(state.isBuildInProgress === true, 'Build should be in progress');
  assert(state.skillNumber === 2, 'Skill number should be 2');
  assert(state.skillName === 'DM Sales Engine', 'Skill name should match');
  assert(state.testResults.passing === 8, 'Test results should match');
});

test('Get resume prompt', () => {
  const prompt = checkpoint.getResumePrompt();
  
  assert(prompt !== null, 'Prompt should not be null');
  assert(prompt.includes('DM Sales Engine'), 'Prompt should include skill name');
  assert(prompt.includes('8/10 tests'), 'Prompt should include test status');
  assert(prompt.includes('Resume from Skill #2'), 'Prompt should ask to resume');
});

test('Check if build is in progress', () => {
  const inProgress = checkpoint.isInProgress();
  
  assert(inProgress === true, 'Build should be marked in progress');
});

test('Save checkpoint with completed status', () => {
  const result = checkpoint.saveCheckpoint(
    3,
    'Story Arc Builder',
    'completed',
    { passing: 12, failing: 0, total: 12 }
  );
  
  assert(result.checkpoint.status === 'completed', 'Status should be completed');
  const state = checkpoint.loadCheckpoint();
  assert(state.isBuildInProgress === false, 'Completed builds should not be marked in progress');
});

test('Save checkpoint with failed status', () => {
  const result = checkpoint.saveCheckpoint(
    4,
    'Landing Page Optimizer',
    'failed',
    { passing: 6, failing: 6, total: 12 }
  );
  
  const state = checkpoint.loadCheckpoint();
  assert(state.isBuildInProgress === true, 'Failed builds should still be marked in progress');
});

test('Clear checkpoint', () => {
  const result = checkpoint.clearCheckpoint();
  
  assert(result.cleared === true, 'Result should show cleared: true');
  assert(!fs.existsSync(CHECKPOINT_FILE), 'Checkpoint file should be deleted');
  
  const state = checkpoint.loadCheckpoint();
  assert(state.exists === false, 'Checkpoint should not exist after clearing');
  assert(state.isBuildInProgress === false, 'Build should not be in progress');
});

test('Load when no checkpoint exists', () => {
  const state = checkpoint.loadCheckpoint();
  
  assert(state.exists === false, 'Should return exists: false');
  assert(state.isBuildInProgress === false, 'Should not be in progress');
});

test('Get resume prompt when no build in progress', () => {
  const prompt = checkpoint.getResumePrompt();
  
  assert(prompt === null, 'Should return null when no build in progress');
});

test('Get skills list', () => {
  const skills = checkpoint.getSkillsList();
  
  assert(Array.isArray(skills), 'Should return an array');
  assert(skills.length === 10, 'Should have 10 skills');
  assert(skills[0].number === 1, 'First skill should be #1');
  assert(skills[1].name === 'DM Sales Engine', 'Second skill should be DM Sales Engine');
});

test('Checkpoint file persists across loads', () => {
  checkpoint.saveCheckpoint(2, 'DM Sales Engine', 'in_progress', {});
  const load1 = checkpoint.loadCheckpoint();
  const load2 = checkpoint.loadCheckpoint();
  
  assert(load1.skillNumber === load2.skillNumber, 'Data should persist');
  assert(load1.timestamp === load2.timestamp, 'Timestamp should be identical');
});

cleanup();

// Summary
console.log(`\n📊 Test Summary: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
