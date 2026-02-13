# OpenClaw Implementation Blueprint

Deep source code analysis of `/openclaw/src/`. File paths, function names, execution flows.

---

## 1. Agent Runtime (pi-embedded-runner)

### Entry Point
- **`/openclaw/src/agents/pi-embedded-runner/run.ts`** → `runEmbeddedPiAgent(params: RunEmbeddedPiAgentParams): Promise<EmbeddedPiRunResult>`

### Execution Flow

```
runEmbeddedPiAgent()
  ├── Lane queueing: enqueueCommandInLane(sessionLane) → enqueueCommandInLane(globalLane)
  ├── Resolve workspace dir (resolveRunWorkspaceDir)
  ├── Resolve model (resolveModel → provider, modelId, authStorage, modelRegistry)
  ├── Context window guard (resolveContextWindowInfo → evaluateContextWindowGuard)
  ├── Auth profile resolution loop:
  │   ├── ensureAuthProfileStore() → resolveAuthProfileOrder()
  │   ├── getApiKeyForModel() → authStorage.setRuntimeApiKey()
  │   └── Cooldown check: isProfileInCooldown()
  ├── MAIN RETRY LOOP (while true):
  │   ├── runEmbeddedAttempt() ← the actual LLM call
  │   ├── Error handling:
  │   │   ├── Context overflow → auto-compaction (up to 3 attempts)
  │   │   ├── Auth/rate-limit → rotate auth profile (advanceAuthProfile)
  │   │   ├── Thinking level unsupported → fallback thinking level
  │   │   └── FailoverError → throw for model fallback
  │   └── On success: buildEmbeddedRunPayloads() → return result
  └── Mark auth profile good/used
```

### Attempt Execution
- **`/openclaw/src/agents/pi-embedded-runner/run/attempt.ts`** → `runEmbeddedAttempt()`

```
runEmbeddedAttempt()
  ├── Resolve sandbox context (resolveSandboxContext)
  ├── Load skill entries & apply env overrides
  ├── Resolve bootstrap context files (AGENTS.md, SOUL.md, USER.md, etc.)
  ├── Create tools (createOpenClawCodingTools)
  ├── Build system prompt (buildEmbeddedSystemPrompt)
  ├── Acquire session write lock (acquireSessionWriteLock)
  ├── Open session file (SessionManager.open → pi-coding-agent SDK)
  ├── Guard session manager (guardSessionManager)
  ├── Sanitize session history (sanitizeSessionHistory → limitHistoryTurns)
  ├── Create agent session (createAgentSession → pi-coding-agent SDK)
  ├── Apply system prompt override
  ├── Wire streamFn = streamSimple (from pi-ai)
  ├── Subscribe to events (subscribeEmbeddedPiSession)
  ├── Set active run (setActiveEmbeddedRun)
  ├── Set timeout timer
  ├── Run hooks (before_agent_start)
  ├── Detect & load prompt images
  ├── **Call LLM**: activeSession.prompt(effectivePrompt, {images})
  ├── Wait for compaction retry if needed
  ├── Run hooks (agent_end)
  └── Return attempt result (assistantTexts, toolMetas, lastAssistant, etc.)
```

### Streaming & Event Subscription
- **`/openclaw/src/agents/pi-embedded-subscribe.ts`** → `subscribeEmbeddedPiSession()`
- **`/openclaw/src/agents/pi-embedded-subscribe.handlers.ts`** → Event handler factory
- **`/openclaw/src/agents/pi-embedded-subscribe.handlers.messages.ts`** → Message stream handling
- **`/openclaw/src/agents/pi-embedded-subscribe.handlers.tools.ts`** → Tool call/result handling
- **`/openclaw/src/agents/pi-embedded-subscribe.handlers.lifecycle.ts`** → Compaction/lifecycle

The subscription hooks into the pi-coding-agent session's event emitter. Key events:
- `assistant_message` (text_start/text_delta/text_end) → accumulated into assistantTexts, streamed via onPartialReply/onBlockReply
- `tool_call` / `tool_result` → tracked in toolMetas, emitted via onToolResult
- `compaction` → sets compactionInFlight flag, manages retry promises
- Thinking/reasoning tags (`<think>`, `<final>`) are parsed statefully from streaming deltas

### Key SDK Dependencies
- `@mariozechner/pi-agent-core` — AgentMessage types
- `@mariozechner/pi-ai` — `streamSimple` (the actual LLM API call)
- `@mariozechner/pi-coding-agent` — `createAgentSession`, `SessionManager`, `SettingsManager`, `estimateTokens`, `generateSummary`

---

## 2. Prompt Assembly

### Entry Point
- **`/openclaw/src/agents/system-prompt.ts`** → `buildAgentSystemPrompt(params)`
- Called from **`/openclaw/src/agents/pi-embedded-runner/system-prompt.ts`** → `buildEmbeddedSystemPrompt()` which wraps `buildAgentSystemPrompt()`

### System Prompt Ordering (exact sequence in `buildAgentSystemPrompt`):

```
1. "You are a personal assistant running inside OpenClaw."
2. ## Tooling — Tool availability list with summaries
3. ## Tool Call Style — Narration guidance
4. ## Safety — Anthropic-inspired safety rules
5. ## OpenClaw CLI Quick Reference
6. ## Skills (mandatory) — if skillsPrompt provided and not minimal mode
7. ## Memory Recall — if memory_search/memory_get tools available
8. ## OpenClaw Self-Update — if gateway tool available
9. ## Model Aliases — if aliases configured
10. "If you need the current date..." hint
11. ## Workspace — working directory
12. ## Documentation — docs path, links
13. ## Sandbox — if sandbox enabled
14. ## User Identity — owner numbers
15. ## Current Date & Time — timezone
16. ## Workspace Files (injected) — header for context files
17. ## Reply Tags — reply_to_current/reply_to:<id>
18. ## Messaging — message tool guidance
19. ## Voice (TTS) — if TTS configured
20. ## Subagent Context / Group Chat Context — extraSystemPrompt
21. ## Reactions — if reaction guidance
22. ## Reasoning Format — if reasoning tag hint
23. # Project Context — injected context files (AGENTS.md, SOUL.md, USER.md, TOOLS.md, etc.)
    - If SOUL.md present: "embody its persona and tone"
24. ## Silent Replies — HEARTBEAT_OK guidance
25. ## Heartbeats — heartbeat prompt
26. ## Runtime — runtime line (agent, host, os, model, channel, thinking level)
    Reasoning: {level}
```

### Bootstrap/Context File Resolution
- **`/openclaw/src/agents/bootstrap-files.ts`** → `resolveBootstrapContextForRun()`
  - Scans workspace for: `AGENTS.md`, `SOUL.md`, `USER.md`, `TOOLS.md`, `HEARTBEAT.md`, `IDENTITY.md`, `BOOTSTRAP.md`
  - Returns `bootstrapFiles` (for system prompt report) and `contextFiles` (injected into prompt)
  - Max chars per file: `resolveBootstrapMaxChars(config)` (default ~50K)

### Prompt Modes
- `"full"` — all sections (main agent)
- `"minimal"` — Tooling, Safety, Workspace, Runtime only (subagents)
- `"none"` — just identity line

### Skills Prompt
- **`/openclaw/src/agents/skills.ts`** → `resolveSkillsPromptForRun()` → `buildWorkspaceSkillsPrompt()`
- Scans workspace `skills/` directory for SKILL.md files
- Generates `<available_skills>` XML block with name, description, location

---

## 3. Compaction Engine

### Core Logic
- **`/openclaw/src/agents/compaction.ts`** — Pure compaction algorithms
- **`/openclaw/src/agents/pi-embedded-runner/compact.ts`** → `compactEmbeddedPiSession()` / `compactEmbeddedPiSessionDirect()`

### When Compaction Triggers
1. **Auto-compaction on context overflow**: In `runEmbeddedPiAgent()`, if LLM returns context overflow error → calls `compactEmbeddedPiSessionDirect()` (up to `MAX_OVERFLOW_COMPACTION_ATTEMPTS = 3`)
2. **SDK-level compaction**: The pi-coding-agent SDK triggers compaction internally based on `reserveTokens` settings
3. **Manual `/compact` command**: User-triggered via auto-reply command system

### Compaction Algorithm (`compaction.ts`)

```
summarizeInStages():
  ├── If few messages or fits in one chunk → summarizeWithFallback()
  ├── Split messages by token share (splitMessagesByTokenShare)
  ├── Summarize each chunk independently
  └── Merge partial summaries with MERGE_SUMMARIES_INSTRUCTIONS

summarizeWithFallback():
  ├── Try full summarizeChunks()
  ├── If fails: separate oversized messages (>50% context)
  ├── Summarize only small messages + note oversized ones
  └── Final fallback: text noting message count

chunkMessagesByMaxTokens():
  - Splits messages into chunks ≤ maxTokens
  - Each chunk gets summarized via generateSummary() (SDK call → LLM)

Adaptive chunk ratio: computeAdaptiveChunkRatio()
  - BASE_CHUNK_RATIO = 0.4, MIN_CHUNK_RATIO = 0.15
  - SAFETY_MARGIN = 1.2 (20% buffer for token estimation)
  - If avg message > 10% of context → reduce chunk ratio
```

### Memory Flush Before Compaction
- **`/openclaw/src/auto-reply/reply/memory-flush.ts`** → `shouldRunMemoryFlush()` / `resolveMemoryFlushSettings()`
- **Triggered in `agent-runner.ts`** before compaction when:
  - `totalTokens >= contextWindow - reserveTokens - softThreshold` (default soft threshold: 4000 tokens)
  - Haven't flushed at current compaction count
- Sends a special prompt: "Pre-compaction memory flush. Store durable memories now..."
- Agent writes to `memory/YYYY-MM-DD.md` files, then compaction proceeds

### Compaction Safeguard
- **`/openclaw/src/agents/pi-extensions/compaction-safeguard.ts`**
- Extension that monitors compaction health and can block problematic compaction attempts

### Context Pruning Extension
- **`/openclaw/src/agents/pi-extensions/context-pruning/`**
- Alternative to full compaction: prunes old messages based on cache TTL or token budget
- Modes: `cache-ttl` (Anthropic cache-aware), standard pruning

---

## 4. WebSocket Server

### Server Setup
- **`/openclaw/src/gateway/server.ts`** → re-exports from `server.impl.ts`
- **`/openclaw/src/gateway/server.impl.ts`** → `GatewayServer` type, full server initialization

### Connection Lifecycle
- **`/openclaw/src/gateway/server/ws-connection.ts`** → `attachGatewayWsConnectionHandler()`
- **`/openclaw/src/gateway/server/ws-connection/message-handler.ts`** → `attachGatewayWsMessageHandler()`

### Handshake / Auth Flow
```
Client connects via WebSocket
  ├── First frame must be: { type: "req", method: "connect", params: ConnectParams }
  ├── Protocol version check (PROTOCOL_VERSION)
  ├── Role validation: "operator" | "node"
  ├── Origin check for Control UI / Webchat
  ├── Device identity verification:
  │   ├── Derive device ID from public key
  │   ├── Verify signature (Ed25519)
  │   ├── Check nonce (anti-replay)
  │   └── Device pairing flow if not paired
  ├── Auth: authorizeGatewayConnect() — token, password, or Tailscale whois
  ├── Device token issuance: ensureDeviceToken()
  ├── For nodes: command allowlist filtering
  ├── Response: { type: "res", ok: true, payload: hello-ok }
  │   hello-ok contains: protocol, server info, features, snapshot, canvasHostUrl, auth token, policy
  └── Node registration if role === "node"
```

### RPC Method Dispatch
- **`/openclaw/src/gateway/server-methods.ts`** → `handleGatewayRequest()`
- **`/openclaw/src/gateway/server-methods-list.ts`** → `listGatewayMethods()`, `GATEWAY_EVENTS`
- Methods registered in **`/openclaw/src/gateway/server-methods/`**:
  - `agent.ts` — agent run
  - `chat.ts` — chat interactions
  - `sessions.ts` — session management
  - `channels.ts` — channel operations
  - `config.ts` — config get/apply
  - `cron.ts` — cron management
  - `devices.ts` — device pairing
  - `health.ts` — health probes
  - `models.ts` — model listing
  - `nodes.ts` — node operations
  - `send.ts` — message sending
  - `tts.ts` — text-to-speech
  - `web.ts` — web search/fetch

### Frame Protocol
- **`/openclaw/src/gateway/protocol/index.ts`** — Frame validation, error codes
- **`/openclaw/src/gateway/protocol/schema/frames.ts`** — Frame type definitions
- Frame types: `req` (request), `res` (response), `evt` (event broadcast)
- Request: `{ type: "req", id: string, method: string, params?: unknown }`
- Response: `{ type: "res", id: string, ok: boolean, payload?: unknown, error?: ErrorShape }`
- Max payload: `MAX_PAYLOAD_BYTES`, max buffered: `MAX_BUFFERED_BYTES`

---

## 5. Channel Adapters

### Plugin Architecture
- **`/openclaw/src/channels/plugins/index.ts`** → Channel plugin registry
- **`/openclaw/src/channels/plugins/types.plugin.ts`** → Plugin interface
- **`/openclaw/src/channels/plugins/catalog.ts`** → Plugin catalog

### Channel-Specific Implementations
| Channel | Monitor | Send | Normalize |
|---------|---------|------|-----------|
| WhatsApp | `/openclaw/src/web/auto-reply/monitor/` | `/openclaw/src/web/outbound.ts` | `/openclaw/src/channels/plugins/normalize/whatsapp.ts` |
| Telegram | `/openclaw/src/telegram/bot.ts` | `/openclaw/src/telegram/send.ts` | `/openclaw/src/channels/plugins/normalize/telegram.ts` |
| Discord | `/openclaw/src/discord/monitor.ts` | `/openclaw/src/discord/send.ts` | `/openclaw/src/channels/plugins/normalize/discord.ts` |
| Slack | `/openclaw/src/slack/monitor.ts` | `/openclaw/src/slack/send.ts` | `/openclaw/src/channels/plugins/normalize/slack.ts` |
| Signal | `/openclaw/src/signal/monitor.ts` | `/openclaw/src/signal/send.ts` | `/openclaw/src/channels/plugins/normalize/signal.ts` |
| iMessage | `/openclaw/src/imessage/monitor.ts` | `/openclaw/src/imessage/send.ts` | `/openclaw/src/channels/plugins/normalize/imessage.ts` |

### Inbound Message Flow
```
Channel event (e.g. Telegram update, Discord message)
  ├── Channel-specific monitor receives raw event
  ├── Normalize to common format (normalize/*.ts)
  ├── Activation check (mention gating, group policy)
  ├── Route to agent: resolveAgentRoute() → agentId + sessionKey
  └── Dispatch to auto-reply system
```

### Auto-Reply Dispatch & Queue
- **`/openclaw/src/auto-reply/dispatch.ts`** — Main dispatch entry
- **`/openclaw/src/auto-reply/reply.ts`** → re-exports
- **`/openclaw/src/auto-reply/reply/queue/`** — Queue system
  - `enqueue.ts` → `enqueueFollowupRun()` — deduplication by message ID
  - `drain.ts` — processes queued messages
  - `state.ts` → `FOLLOWUP_QUEUES` Map
  - `types.ts` → `QueueSettings` (maxSize, dropPolicy)
  - `settings.ts` → resolves queue settings from config

### Queue Modes (configured per channel/session)
- **steer** — interrupts current run, steers the agent with new input
- **followup** — queues message, runs after current completes
- **collect** — batches messages, runs once with collected input
- **interrupt** — aborts current run, starts fresh

---

## 6. Model Provider Abstraction

### Model Resolution
- **`/openclaw/src/agents/pi-embedded-runner/model.ts`** → `resolveModel()` — resolves provider, model, authStorage, modelRegistry from config
- **`/openclaw/src/agents/model-auth.ts`** → `getApiKeyForModel()`, `ensureAuthProfileStore()`, `resolveAuthProfileOrder()`
- **`/openclaw/src/agents/auth-profiles.ts`** / **`/openclaw/src/agents/auth-profiles/`** — Auth profile management

### Auth Profile Resolution Order
- **`/openclaw/src/agents/auth-profiles/order.ts`** → `resolveAuthProfileOrder()`
  - Check explicit preferred profile
  - Use configured order from config
  - Sort by lastUsed if no explicit order
  - Skip profiles in cooldown

### Streaming
- The LLM call is `streamSimple` from `@mariozechner/pi-ai`
- Injected as `activeSession.agent.streamFn = streamSimple`
- Can be wrapped by cache trace or Anthropic payload logger

### Failover & Retry
- **`/openclaw/src/agents/failover-error.ts`** → `FailoverError` class, `resolveFailoverStatus()`
- **`/openclaw/src/agents/model-fallback.ts`** → Model fallback configuration
- Flow:
  1. LLM call fails → classify error (`classifyFailoverReason`)
  2. If auth/rate-limit → `markAuthProfileFailure()` → cooldown
  3. Try next auth profile (`advanceAuthProfile()`)
  4. If all profiles exhausted → throw `FailoverError`
  5. Caller (auto-reply) catches `FailoverError` → tries fallback model from config

### Billing Backoff
- Auth profiles track failures with cooldown periods
- **`/openclaw/src/agents/auth-profiles/constants.ts`** — Cooldown durations
- Profiles cycle through: good → failure → cooldown → retry

---

## 7. Session Store

### Session Persistence
- **`/openclaw/src/config/sessions/store.ts`** → `loadSessionStore()`, `saveSessionStore()`
- Store path: JSON file at `{stateDir}/sessions.json`
- Cached with TTL (default 45s), invalidated on write
- Atomic writes on Unix (tmp + rename), direct write on Windows

### Session Entry (types.ts)
Key fields: sessionKey, channel, lastTo, lastAccountId, lastThreadId, agentId, model, totalTokens, compactionCount, memoryFlushCompactionCount, updatedAt, deliveryContext

### Session Key Resolution
- **`/openclaw/src/routing/session-key.ts`** — Key format: `agent:{agentId}:{channel}:{peer}` or `agent:{agentId}:main`
- **`/openclaw/src/config/sessions/session-key.ts`** — Normalization helpers

### Transcript Writing
- **`/openclaw/src/config/sessions/transcript.ts`** — `writeTranscriptEntry()`, `readTranscript()`
- Transcripts stored as JSONL files in `{stateDir}/transcripts/{agentId}/`
- Each line: JSON object with role, content, timestamp, metadata
- **`/openclaw/src/agents/session-write-lock.ts`** → `acquireSessionWriteLock()` — file-based locking

### Session File (pi-coding-agent SDK)
- Managed by `SessionManager` from pi-coding-agent
- Binary/JSON session file containing full conversation history
- Opened per-run, locked exclusively during writes

---

## 8. Tool Execution

### Tool Registration
- **`/openclaw/src/agents/pi-tools.ts`** → `createOpenClawCodingTools()` — Main tool factory
  - Creates all tools: exec, read, write, edit, browser, web_search, web_fetch, etc.
  - Applies tool policy filtering
- **`/openclaw/src/agents/openclaw-tools.ts`** → `createOpenClawTools()` — Higher-level tools (gateway, sessions, cron, etc.)

### Tool Split (SDK vs Custom)
- **`/openclaw/src/agents/pi-embedded-runner/tool-split.ts`** → `splitSdkTools()`
  - `builtInTools` — tools the SDK handles natively (read, write, edit, exec, etc.)
  - `customTools` — OpenClaw-specific tools passed as custom tools to the SDK

### Tool Policy
- **`/openclaw/src/agents/tool-policy.ts`** — Tool allowlist/denylist resolution
- **`/openclaw/src/agents/pi-tools.policy.ts`** — Policy enforcement per tool call
- Policy sources: config `tools.allow`/`tools.deny`, sandbox restrictions, channel capabilities

### Exec Approval System
- **`/openclaw/src/infra/exec-approvals.ts`** — Approval request/response
- **`/openclaw/src/gateway/exec-approval-manager.ts`** → `ExecApprovalManager`
- **`/openclaw/src/agents/pi-tools.before-tool-call.ts`** → `beforeToolCall` hook
- Flow: exec tool call → check policy → if "ask" mode → send approval request via gateway → wait for user approval → execute or reject

### Elevated Mode
- **`/openclaw/src/agents/bash-tools.exec.ts`** — Exec tool implementation
- Elevated levels: `off`, `on` (host exec with approvals), `ask` (prompt before each), `full` (auto-approve)
- Configured per-session via `/elevated` directive

### Tool Definition Adapter
- **`/openclaw/src/agents/pi-tool-definition-adapter.ts`** → `toClientToolDefinitions()` — Converts tools to LLM-compatible JSON schema format

---

## 9. Multi-Agent Routing

### Binding Match Algorithm
- **`/openclaw/src/routing/resolve-route.ts`** → `resolveAgentRoute(input): ResolvedAgentRoute`
- **`/openclaw/src/routing/bindings.ts`** → `listBindings(cfg)`

### Match Priority (highest to lowest):
```
1. binding.peer — exact peer (DM user, group ID) match
2. binding.peer.parent — parent peer (thread parent) match
3. binding.guild — Discord guild ID match
4. binding.team — Slack team ID match
5. binding.account — specific account ID (no peer/guild/team)
6. binding.channel — wildcard account (accountId: "*")
7. default — resolveDefaultAgentId(cfg)
```

### Agent Isolation
- Each agent gets its own:
  - **Workspace**: `resolveAgentWorkspaceDir()` → `{workspaceRoot}/{agentId}/`
  - **Session key**: `agent:{agentId}:...` prefix
  - **Auth profiles**: resolved per-agent from config
  - **Session files**: separate session manager per agent

### Session Key Format
- Main: `agent:{agentId}:main`
- DM: `agent:{agentId}:{channel}:dm:{peerId}`
- Group: `agent:{agentId}:{channel}:group:{groupId}`
- Subagent: `agent:{agentId}:subagent:{uuid}`

---

## 10. Memory Indexing

### Memory Manager
- **`/openclaw/src/memory/manager.ts`** → `MemoryIndexManager` class (implements `MemorySearchManager`)
- Singleton cache per agent: `INDEX_CACHE = new Map<string, MemoryIndexManager>()`

### Index Storage
- SQLite database with sqlite-vec extension for vector search
- **`/openclaw/src/memory/sqlite-vec.ts`** → `loadSqliteVecExtension()`
- **`/openclaw/src/memory/memory-schema.ts`** → `ensureMemoryIndexSchema()`
- Tables:
  - `chunks` — text chunks with path, line range, hash, content
  - `chunks_vec` — vector embeddings (sqlite-vec virtual table)
  - `chunks_fts` — FTS5 full-text search index
  - `embedding_cache` — cached embeddings by content hash

### Embedding Providers
- **`/openclaw/src/memory/embeddings.ts`** → `createEmbeddingProvider()` — factory
- **`/openclaw/src/memory/embeddings-openai.ts`** — OpenAI embeddings (default: `text-embedding-3-small`)
- **`/openclaw/src/memory/embeddings-gemini.ts`** — Gemini embeddings
- **`/openclaw/src/memory/embeddings-voyage.ts`** — Voyage AI embeddings
- **`/openclaw/src/memory/node-llama.ts`** — Local llama.cpp embeddings

### Hybrid BM25 + Vector Search
- **`/openclaw/src/memory/hybrid.ts`** → `mergeHybridResults()`
- **`/openclaw/src/memory/manager-search.ts`** → `searchKeyword()`, `searchVector()`

```
Search flow:
  1. Query arrives → memory_search tool call
  2. searchVector(): embed query → sqlite-vec KNN search → vector results
  3. searchKeyword(): buildFtsQuery() → FTS5 search → BM25 ranked results
  4. mergeHybridResults():
     - Merge by chunk ID (union of both result sets)
     - Combined score = vectorWeight * vectorScore + textWeight * textScore
     - Sort by combined score descending
  5. Return top-K results with snippets + citations
```

### File Sync
- **`/openclaw/src/memory/sync-memory-files.ts`** — Syncs workspace `memory/` directory
- **`/openclaw/src/memory/sync-session-files.ts`** — Syncs session transcripts
- File watcher (chokidar) monitors workspace for changes
- On change: re-chunk markdown files (`chunkMarkdown`), re-embed changed chunks

### Embedding Batching
- **`/openclaw/src/memory/batch-openai.ts`** — OpenAI batch API
- **`/openclaw/src/memory/batch-gemini.ts`** — Gemini batch
- **`/openclaw/src/memory/batch-voyage.ts`** — Voyage batch
- Concurrency: `EMBEDDING_INDEX_CONCURRENCY = 4`
- Retry: up to 3 attempts with exponential backoff (500ms-8000ms)

---

## 11. Sub-Agent Lifecycle

### Spawn
- **`/openclaw/src/agents/tools/sessions-spawn-tool.ts`** → `createSessionsSpawnTool()` — the `sessions_spawn` tool
- Creates a new session with key `agent:{agentId}:subagent:{uuid}`
- Resolves model: prefers per-agent subagent model, then default
- Queues execution in a separate lane

### Execute
- Sub-agent runs through same `runEmbeddedPiAgent()` pipeline
- Uses `promptMode: "minimal"` (reduced system prompt)
- Workspace: shared or isolated based on config
- **`/openclaw/src/agents/pi-embedded-runner/lanes.ts`** → `resolveSessionLane()`, `resolveGlobalLane()`

### Announce
- **`/openclaw/src/agents/subagent-announce.ts`** → `announceSubagentResult()`
- **`/openclaw/src/agents/subagent-announce-queue.ts`** → `enqueueAnnounce()`
- After sub-agent completes:
  1. Read latest assistant reply from sub-agent session
  2. Format announcement with duration, token usage, cost
  3. Deliver to parent session via `queueEmbeddedPiMessage()` or `sessions_send`

### Registry
- **`/openclaw/src/agents/subagent-registry.ts`** — Tracks active sub-agents
- **`/openclaw/src/agents/subagent-registry.store.ts`** — Persistent storage

### Cleanup & Timeout
- Sub-agent timeout: configured via `timeoutMs` parameter
- On timeout: `abortRun(true)` → abort controller signals abort
- Session disposal: `session.dispose()` in finally block
- Lock release: `sessionLock.release()` in finally block

### Lane Management
- **`/openclaw/src/process/command-queue.ts`** → `enqueueCommandInLane()`
- **`/openclaw/src/process/lanes.ts`** — Lane definitions
- Each session gets its own lane (serialized execution)
- Global lane provides cross-session serialization point
- Sub-agents run in their own session lane, share global lane

---

## 12. Browser Control Server

### Server Setup
- **`/openclaw/src/browser/server.ts`** → `startBrowserControlServerFromConfig()`
- Express HTTP server on `127.0.0.1:{controlPort}`
- **`/openclaw/src/browser/routes/index.ts`** → `registerBrowserRoutes()` — route registration

### Routes
- **`/openclaw/src/browser/routes/basic.ts`** — `/status`, `/start`, `/stop`
- **`/openclaw/src/browser/routes/tabs.ts`** — `/tabs`, `/tabs/open`, `/tabs/close`
- **`/openclaw/src/browser/routes/agent.ts`** — Agent-oriented endpoints
  - **`/openclaw/src/browser/routes/agent.snapshot.ts`** — `/agent/snapshot` (accessibility tree)
  - **`/openclaw/src/browser/routes/agent.act.ts`** — `/agent/act` (click, type, etc.)
  - **`/openclaw/src/browser/routes/agent.storage.ts`** — Cookie/storage management

### Playwright-CDP Connection
- **`/openclaw/src/browser/pw-session.ts`** → Playwright browser session management
- **`/openclaw/src/browser/cdp.ts`** → CDP (Chrome DevTools Protocol) connection
- **`/openclaw/src/browser/chrome.ts`** → Chrome browser launch/management
- **`/openclaw/src/browser/profiles-service.ts`** → Browser profile management

### Snapshot Processing
- **`/openclaw/src/browser/pw-role-snapshot.ts`** → Role-based accessibility tree snapshot
- **`/openclaw/src/browser/pw-ai.ts`** → AI-oriented page analysis
- **`/openclaw/src/browser/pw-tools-core.snapshot.ts`** → Core snapshot logic

### Action Processing
- **`/openclaw/src/browser/pw-tools-core.interactions.ts`** → Click, type, hover, drag, select
- **`/openclaw/src/browser/pw-tools-core.ts`** → Tool coordination
- **`/openclaw/src/browser/client-actions.ts`** → Client-side action dispatch

### Chrome Extension Relay
- **`/openclaw/src/browser/extension-relay.ts`** → WebSocket relay for Chrome extension
- Allows controlling user's existing Chrome tabs via extension

### Server Context
- **`/openclaw/src/browser/server-context.ts`** → `BrowserServerState` — tracks profiles, running browsers
- **`/openclaw/src/browser/config.ts`** → `resolveBrowserConfig()` — resolves profile settings

---

## Key Data Flow Summary

```
Inbound message (WhatsApp/Telegram/Discord/etc.)
  → Channel monitor (normalize)
  → resolveAgentRoute() → agentId + sessionKey
  → Auto-reply dispatch (queue handling)
  → runEmbeddedPiAgent()
    → Auth profile resolution
    → runEmbeddedAttempt()
      → Build system prompt (workspace files, skills, context)
      → Open session (SessionManager)
      → Create tools (exec, browser, web, etc.)
      → createAgentSession() (pi-coding-agent SDK)
      → session.prompt() → streamSimple() → LLM API
      → Stream events → tool calls → tool execution → feed results back
      → Loop until assistant stops or timeout
    → Handle errors (retry, failover, compaction)
  → Build payloads
  → Deliver reply (channel-specific send)
```
