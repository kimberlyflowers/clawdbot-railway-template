# Checkpoint Patterns & Examples

## Pattern 1: Long-Running Skill Creation

**Scenario:** Building a complex skill with multiple components over multiple sessions.

```javascript
const manager = require('./checkpoint-manager.js');

// Session 1: Start skill structure
await manager.saveCheckpoint({
  taskId: 'skill-dm-sales',
  taskName: 'Building Skill: DM Sales Automation',
  progress: 20,
  lastAction: 'Created SKILL.md template',
  context: {
    skillDir: '/data/workspace/skills/dm-sales',
    components: 'SKILL.md',
    completed: '1/5'
  },
  nextStep: 'Implement scripts/send-dm.js',
  blockers: null
});

// Later: Update progress as you complete work
await manager.saveCheckpoint({
  taskId: 'skill-dm-sales',
  taskName: 'Building Skill: DM Sales Automation',
  progress: 60,
  lastAction: 'Implemented sendDM() with retry logic',
  context: {
    skillDir: '/data/workspace/skills/dm-sales',
    components: 'SKILL.md, scripts/send-dm.js, scripts/batch-processor.js',
    completed: '3/5'
  },
  nextStep: 'Test sendDM() on 100 users, then implement rate limiting',
  blockers: null
});

// Session 2: Resume and continue
const checkpoint = await manager.loadCheckpoint();
if (checkpoint && checkpoint.taskId === 'skill-dm-sales') {
  console.log(`Resuming: ${checkpoint.taskName}`);
  console.log(`Progress: ${checkpoint.progress}%`);
  console.log(`Last action: ${checkpoint.lastAction}`);
  console.log(`Next step: ${checkpoint.nextStep}`);
  // Continue from nextStep
}
```

## Pattern 2: Batch Processing with Recovery

**Scenario:** Processing 1000 items, need to survive crashes/restarts.

```javascript
const manager = require('./checkpoint-manager.js');

async function processBatch(items) {
  let processed = 0;
  let lastProcessedItem = null;

  // Load checkpoint to resume
  const checkpoint = await manager.loadCheckpoint();
  if (checkpoint && checkpoint.taskId === 'batch-process') {
    processed = checkpoint.context.processed;
    lastProcessedItem = checkpoint.context.lastItem;
    console.log(`Resuming from item ${processed}/${items.length}`);
  }

  for (let i = processed; i < items.length; i++) {
    try {
      const item = items[i];
      await processItem(item); // Your processing logic
      lastProcessedItem = item.id;
      processed++;

      // Auto-save every 10 items or every 5 minutes
      if (i % 10 === 0) {
        await manager.saveCheckpoint({
          taskId: 'batch-process',
          taskName: 'Batch Processing Items',
          progress: Math.round((processed / items.length) * 100),
          lastAction: `Processed item ${item.id}`,
          context: {
            total: items.length,
            processed,
            lastItem: item.id,
          },
          nextStep: `Continue with item ${i + 1}`,
          blockers: null,
        });
      }
    } catch (err) {
      // Save error state before throwing
      await manager.saveCheckpoint({
        taskId: 'batch-process',
        taskName: 'Batch Processing Items',
        progress: Math.round((processed / items.length) * 100),
        lastAction: `Error processing item ${items[i].id}`,
        context: {
          total: items.length,
          processed,
          lastItem: lastProcessedItem,
        },
        nextStep: `Retry from item ${i}`,
        blockers: err.message,
      });
      throw err;
    }
  }

  // Complete: clear checkpoint
  await manager.clearCheckpoint();
  console.log(`✓ Completed all ${processed} items`);
}
```

## Pattern 3: Multi-Step Deployment

**Scenario:** Deploying to instance, each step takes time and could fail.

```javascript
const manager = require('./checkpoint-manager.js');

const deploymentSteps = [
  { step: 1, name: 'Build Docker image', action: 'docker build' },
  { step: 2, name: 'Push to registry', action: 'docker push' },
  { step: 3, name: 'Update instance', action: 'ssh deploy' },
  { step: 4, name: 'Run migrations', action: 'db migrate' },
  { step: 5, name: 'Verify health', action: 'healthcheck' },
];

async function deploy() {
  let currentStep = 0;

  // Resume from checkpoint
  const checkpoint = await manager.loadCheckpoint();
  if (checkpoint && checkpoint.taskId === 'deploy-production') {
    currentStep = checkpoint.context.nextStep - 1;
    console.log(`Resuming deployment from step ${currentStep + 1}`);
  }

  for (let i = currentStep; i < deploymentSteps.length; i++) {
    const { step, name, action } = deploymentSteps[i];

    try {
      console.log(`Deploying step ${step}/${deploymentSteps.length}: ${name}`);

      // Save checkpoint before step
      await manager.saveCheckpoint({
        taskId: 'deploy-production',
        taskName: 'Deploy to Production',
        progress: Math.round((step / deploymentSteps.length) * 100),
        lastAction: `Starting: ${name}`,
        context: {
          currentStep: step,
          nextStep: step + 1,
        },
        nextStep: `Execute: ${action}`,
        blockers: null,
      });

      // Execute step
      await executeStep(action);

      // Update checkpoint after step completes
      await manager.saveCheckpoint({
        taskId: 'deploy-production',
        taskName: 'Deploy to Production',
        progress: Math.round((step / deploymentSteps.length) * 100),
        lastAction: `Completed: ${name}`,
        context: {
          currentStep: step,
          nextStep: step + 1,
        },
        nextStep: deploymentSteps[i + 1] ? `Execute: ${deploymentSteps[i + 1].action}` : 'Deployment complete',
        blockers: null,
      });
    } catch (err) {
      await manager.saveCheckpoint({
        taskId: 'deploy-production',
        taskName: 'Deploy to Production',
        progress: Math.round((step / deploymentSteps.length) * 100),
        lastAction: `Failed: ${name}`,
        context: {
          currentStep: step,
          nextStep: step, // Retry same step
        },
        nextStep: `Retry: ${action}`,
        blockers: `${name} failed: ${err.message}`,
        priority: 'high',
      });
      throw err;
    }
  }

  // Success: clear checkpoint
  await manager.clearCheckpoint();
  console.log('✓ Deployment complete');
}
```

## Pattern 4: API Integration with Pagination

**Scenario:** Fetching data from paginated API that might timeout.

```javascript
const manager = require('./checkpoint-manager.js');

async function fetchAllPages(apiClient) {
  let page = 1;
  let results = [];

  // Resume from checkpoint
  const checkpoint = await manager.loadCheckpoint();
  if (checkpoint && checkpoint.taskId === 'api-fetch') {
    page = checkpoint.context.nextPage;
    console.log(`Resuming from page ${page}`);
  }

  while (page <= 100) {
    // Assume API has max 100 pages
    try {
      const response = await apiClient.getPage(page);
      results.push(...response.data);

      // Save progress
      await manager.saveCheckpoint({
        taskId: 'api-fetch',
        taskName: 'Fetch Data from API',
        progress: page,
        lastAction: `Fetched page ${page}`,
        context: {
          nextPage: page + 1,
          totalResults: results.length,
        },
        nextStep: `Fetch page ${page + 1}`,
        blockers: null,
      });

      if (!response.hasNextPage) break;
      page++;
    } catch (err) {
      await manager.saveCheckpoint({
        taskId: 'api-fetch',
        taskName: 'Fetch Data from API',
        progress: page,
        lastAction: `Error on page ${page}`,
        context: {
          nextPage: page,
          totalResults: results.length,
        },
        nextStep: `Retry page ${page}`,
        blockers: `API error: ${err.message}`,
      });
      throw err;
    }
  }

  await manager.clearCheckpoint();
  return results;
}
```

## Integration: Auto-Prompt on Session Start

In your session initialization, add checkpoint detection:

```javascript
async function initSession() {
  const manager = require('./checkpoint-manager.js');
  const checkpoint = await manager.loadCheckpoint();

  if (checkpoint) {
    console.log('\n🔄 Checkpoint detected!\n');
    console.log(`  Task: ${checkpoint.taskName}`);
    console.log(`  Progress: ${checkpoint.progress}%`);
    console.log(`  Last action: ${checkpoint.lastAction}`);
    console.log(`  Next step: ${checkpoint.nextStep}`);
    console.log(`  Saved: ${checkpoint.savedAt}\n`);

    if (checkpoint.blockers) {
      console.log(`⚠️  BLOCKER: ${checkpoint.blockers}\n`);
    }

    // Prompt for resume
    const resume = await askUser('Resume this task? (yes/no): ');
    if (resume.toLowerCase() === 'yes') {
      return checkpoint;
    } else {
      await manager.clearCheckpoint();
      return null;
    }
  }

  return null;
}
```

## Best Practices

1. **Save before risky operations** - Before API calls, file writes, deployments
2. **Include full context** - Don't just save task ID; save variables, paths, counts
3. **Update progress** - Use numeric progress (0-100) or step counts
4. **Clear on success** - Always clear checkpoint when task completes
5. **Name clearly** - Use human-readable task names for easy resumption
6. **Set priority** - Mark critical tasks as "high" priority
7. **Document blockers** - If something failed, explain why for next session
8. **Timestamp history** - Checkpoints auto-timestamp in history for audit trail
