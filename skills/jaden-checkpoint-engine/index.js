/**
 * Jaden Checkpoint Engine
 * Auto-saves build progress, enables resume on context reset
 */

const fs = require('fs');
const path = require('path');

const CHECKPOINT_FILE = path.join(__dirname, '../../.checkpoint/build-state.json');

// Ensure checkpoint directory exists
function ensureCheckpointDir() {
  const dir = path.dirname(CHECKPOINT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Save current build state to checkpoint file
 */
function saveCheckpoint(skillNumber, skillName, status, testResults = {}) {
  ensureCheckpointDir();
  
  const checkpoint = {
    skillNumber,
    skillName,
    status,
    testResults,
    timestamp: new Date().toISOString(),
    isBuildInProgress: status === 'in_progress' || status === 'failed'
  };
  
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
  
  return {
    saved: true,
    file: CHECKPOINT_FILE,
    message: `Build state saved: Skill #${skillNumber} - ${skillName}`,
    checkpoint
  };
}

/**
 * Load checkpoint from file
 */
function loadCheckpoint() {
  ensureCheckpointDir();
  
  if (!fs.existsSync(CHECKPOINT_FILE)) {
    return {
      exists: false,
      isBuildInProgress: false,
      message: 'No checkpoint found — fresh start'
    };
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf-8'));
    return {
      ...data,
      exists: true
    };
  } catch (error) {
    return {
      exists: false,
      isBuildInProgress: false,
      error: error.message
    };
  }
}

/**
 * Generate user-facing resume prompt
 */
function getResumePrompt() {
  const state = loadCheckpoint();
  
  if (!state.isBuildInProgress) {
    return null;
  }
  
  const testStatus = state.testResults && state.testResults.passing 
    ? `${state.testResults.passing}/${state.testResults.total} tests passing`
    : 'Tests not run yet';
  
  return `
🔄 BUILD CHECKPOINT DETECTED

You were building: Skill #${state.skillNumber} - ${state.skillName}
Status: ${state.status} (${testStatus})
Last checkpoint: ${new Date(state.timestamp).toISOString().split('T')[0]} ${new Date(state.timestamp).toISOString().split('T')[1].slice(0, 5)} UTC

Resume from Skill #${state.skillNumber}? Answer: "resume" or "restart"
  `;
}

/**
 * Check if build is in progress
 */
function isInProgress() {
  const state = loadCheckpoint();
  return state.isBuildInProgress === true;
}

/**
 * Clear checkpoint (called after full build suite completes)
 */
function clearCheckpoint() {
  ensureCheckpointDir();
  
  if (fs.existsSync(CHECKPOINT_FILE)) {
    fs.unlinkSync(CHECKPOINT_FILE);
  }
  
  return {
    cleared: true,
    message: 'Build checkpoint cleared — full suite complete'
  };
}

/**
 * Get skill skills list for resuming
 */
function getSkillsList() {
  return [
    { number: 1, name: 'Viral Hook Generator', status: 'completed' },
    { number: 2, name: 'DM Sales Engine', status: 'pending' },
    { number: 3, name: 'Story Arc Builder', status: 'pending' },
    { number: 4, name: 'Landing Page Optimizer', status: 'pending' },
    { number: 5, name: 'Trend Hijacker', status: 'pending' },
    { number: 6, name: 'Audience Psychographer', status: 'pending' },
    { number: 7, name: 'Product Launch Sequencer', status: 'pending' },
    { number: 8, name: 'Content Repurposer', status: 'pending' },
    { number: 9, name: 'Testimonial Amplifier', status: 'pending' },
    { number: 10, name: 'Competitor Decoder', status: 'pending' }
  ];
}

module.exports = {
  saveCheckpoint,
  loadCheckpoint,
  getResumePrompt,
  isInProgress,
  clearCheckpoint,
  getSkillsList,
  CHECKPOINT_FILE
};
