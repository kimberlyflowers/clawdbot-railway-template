const fs = require('fs').promises;
const path = require('path');

const PERSISTENT_DIR = '/data';
const CHECKPOINT_FILE = path.join(PERSISTENT_DIR, 'CHECKPOINT.md');
const HISTORY_DIR = path.join(PERSISTENT_DIR, '.checkpoint-history');

/**
 * Initialize checkpoint system (create history dir if needed)
 */
async function init() {
  try {
    await fs.mkdir(HISTORY_DIR, { recursive: true });
  } catch (err) {
    // Silently fail if already exists
  }
}

/**
 * Save checkpoint state to CHECKPOINT.md and history
 */
async function saveCheckpoint(state) {
  await init();

  if (!state.taskId) {
    throw new Error('Checkpoint requires taskId');
  }

  const checkpoint = {
    taskId: state.taskId,
    taskName: state.taskName || state.taskId,
    progress: state.progress || 0,
    lastAction: state.lastAction || 'initialized',
    context: state.context || {},
    nextStep: state.nextStep || 'Continue',
    blockers: state.blockers || null,
    savedAt: new Date().toISOString(),
    priority: state.priority || 'normal',
  };

  // Write to CHECKPOINT.md
  const md = formatCheckpointMarkdown(checkpoint);
  await fs.writeFile(CHECKPOINT_FILE, md, 'utf8');

  // Archive to history with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const historyFile = path.join(HISTORY_DIR, `checkpoint-${checkpoint.taskId}-${timestamp}.json`);
  await fs.writeFile(historyFile, JSON.stringify(checkpoint, null, 2), 'utf8');

  console.log(`✓ Checkpoint saved: ${checkpoint.taskName} (${checkpoint.progress}%)`);
  return checkpoint;
}

/**
 * Load current checkpoint state
 */
async function loadCheckpoint() {
  try {
    const content = await fs.readFile(CHECKPOINT_FILE, 'utf8');
    const checkpoint = parseCheckpointMarkdown(content);
    return checkpoint;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return null; // No checkpoint exists
    }
    console.error('Error loading checkpoint:', err.message);
    return null;
  }
}

/**
 * Clear current checkpoint (archive it first)
 */
async function clearCheckpoint() {
  try {
    const checkpoint = await loadCheckpoint();
    if (checkpoint) {
      // Archive before clearing
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const historyFile = path.join(HISTORY_DIR, `checkpoint-archived-${timestamp}.json`);
      await fs.writeFile(historyFile, JSON.stringify(checkpoint, null, 2), 'utf8');
    }
    await fs.unlink(CHECKPOINT_FILE);
    console.log('✓ Checkpoint cleared');
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Error clearing checkpoint:', err.message);
    }
  }
}

/**
 * List all checkpoint history
 */
async function listCheckpoints() {
  try {
    await init();
    const files = await fs.readdir(HISTORY_DIR);
    const checkpoints = [];

    for (const file of files.sort().reverse()) {
      const filePath = path.join(HISTORY_DIR, file);
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(content);
        checkpoints.push({
          file,
          taskId: data.taskId,
          taskName: data.taskName,
          savedAt: data.savedAt,
          progress: data.progress,
        });
      } catch (err) {
        // Skip malformed files
      }
    }

    return checkpoints;
  } catch (err) {
    console.error('Error listing checkpoints:', err.message);
    return [];
  }
}

/**
 * Archive checkpoint and move to history
 */
async function archiveCheckpoint(taskId) {
  try {
    const checkpoint = await loadCheckpoint();
    if (checkpoint && checkpoint.taskId === taskId) {
      await clearCheckpoint();
      console.log(`✓ Archived checkpoint for ${taskId}`);
    }
  } catch (err) {
    console.error('Error archiving checkpoint:', err.message);
  }
}

/**
 * Format checkpoint as markdown for CHECKPOINT.md
 */
function formatCheckpointMarkdown(checkpoint) {
  const contextStr = Object.entries(checkpoint.context || {})
    .map(([k, v]) => `${k}=${v}`)
    .join(', ');

  return `# 🔄 Active Checkpoint

- **Task:** ${checkpoint.taskName}
- **TaskID:** \`${checkpoint.taskId}\`
- **Progress:** ${checkpoint.progress}%
- **Last Action:** ${checkpoint.lastAction}
- **Context:** ${contextStr || '(none)'}
- **Next Step:** ${checkpoint.nextStep}
- **Blockers:** ${checkpoint.blockers || 'None'}
- **Priority:** ${checkpoint.priority}
- **Saved:** ${checkpoint.savedAt}

---

## Resume Instructions

When you load this session, you should:

1. Read this checkpoint
2. Recall the task: **${checkpoint.taskName}**
3. Remember where you left off: **${checkpoint.lastAction}**
4. Continue with the next step: **${checkpoint.nextStep}**

If there are blockers, address them before resuming.
`;
}

/**
 * Parse checkpoint from markdown
 */
function parseCheckpointMarkdown(content) {
  const checkpoint = {
    taskId: extractField(content, 'TaskID'),
    taskName: extractField(content, 'Task'),
    progress: parseInt(extractField(content, 'Progress')) || 0,
    lastAction: extractField(content, 'Last Action'),
    nextStep: extractField(content, 'Next Step'),
    blockers: extractField(content, 'Blockers') === 'None' ? null : extractField(content, 'Blockers'),
    priority: extractField(content, 'Priority'),
    savedAt: extractField(content, 'Saved'),
    context: parseContext(extractField(content, 'Context')),
  };

  return checkpoint;
}

/**
 * Extract field value from markdown
 */
function extractField(content, fieldName) {
  const regex = new RegExp(`^- \\*\\*${fieldName}:\\*\\*\\s*(.+)$`, 'm');
  const match = content.match(regex);
  return match ? match[1].replace(/`/g, '').trim() : '';
}

/**
 * Parse context string into object
 */
function parseContext(contextStr) {
  const context = {};
  if (!contextStr || contextStr === '(none)') return context;

  contextStr.split(',').forEach((pair) => {
    const [key, value] = pair.split('=').map((s) => s.trim());
    if (key && value) {
      context[key] = value;
    }
  });

  return context;
}

module.exports = {
  init,
  saveCheckpoint,
  loadCheckpoint,
  clearCheckpoint,
  listCheckpoints,
  archiveCheckpoint,
};
