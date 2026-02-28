/**
 * Startup Initialization
 * Runs at session start to load identity, soul, memory, and checkpoint from persistent /data/
 */

const fs = require('fs').promises;
const path = require('path');

const PERSISTENT_DIR = '/data';
const FILES = {
  identity: path.join(PERSISTENT_DIR, 'IDENTITY.md'),
  soul: path.join(PERSISTENT_DIR, 'SOUL.md'),
  memory: path.join(PERSISTENT_DIR, 'MEMORY.md'),
  checkpoint: path.join(PERSISTENT_DIR, 'CHECKPOINT.md'),
};

async function loadPersistentState() {
  try {
    const state = {};

    // Load identity
    try {
      state.identity = await fs.readFile(FILES.identity, 'utf8');
    } catch (err) {
      console.warn('⚠️  IDENTITY.md not found in /data/');
    }

    // Load soul
    try {
      state.soul = await fs.readFile(FILES.soul, 'utf8');
    } catch (err) {
      console.warn('⚠️  SOUL.md not found in /data/');
    }

    // Load memory
    try {
      state.memory = await fs.readFile(FILES.memory, 'utf8');
    } catch (err) {
      console.warn('⚠️  MEMORY.md not found in /data/');
    }

    // Load checkpoint
    try {
      state.checkpoint = await fs.readFile(FILES.checkpoint, 'utf8');
    } catch (err) {
      // Checkpoint might not exist on first run
    }

    return state;
  } catch (err) {
    console.error('Error loading persistent state:', err.message);
    return {};
  }
}

async function checkpointPrompt() {
  try {
    const checkpointContent = await fs.readFile(FILES.checkpoint, 'utf8');
    if (checkpointContent) {
      return {
        hasCheckpoint: true,
        content: checkpointContent,
      };
    }
  } catch (err) {
    // No checkpoint exists
  }

  return { hasCheckpoint: false };
}

module.exports = {
  loadPersistentState,
  checkpointPrompt,
  FILES,
};
