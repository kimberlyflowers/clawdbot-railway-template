# OpenClaw Complete Feature Map

> **Version**: 2026.2.4 (40425db)  
> **Generated**: 2026-02-07  
> **Purpose**: Exhaustive reference for integrating OpenClaw into a custom AI agent platform

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Gateway](#2-gateway)
3. [WebSocket Protocol](#3-websocket-protocol)
4. [HTTP APIs](#4-http-apis)
5. [CLI Commands](#5-cli-commands)
6. [Configuration Schema](#6-configuration-schema)
7. [Chat Channels](#7-chat-channels)
8. [Model Providers & Auth](#8-model-providers--auth)
9. [Agent System](#9-agent-system)
10. [Multi-Agent Routing](#10-multi-agent-routing)
11. [Session Management](#11-session-management)
12. [Memory System](#12-memory-system)
13. [Tools (Agent-Facing)](#13-tools-agent-facing)
14. [Skills](#14-skills)
15. [Plugins / Extensions](#15-plugins--extensions)
16. [Hooks](#16-hooks)
17. [Cron & Automation](#17-cron--automation)
18. [Heartbeat](#18-heartbeat)
19. [Nodes (Devices)](#19-nodes-devices)
20. [Browser Control](#20-browser-control)
21. [Canvas](#21-canvas)
22. [Sandboxing](#22-sandboxing)
23. [Control UI (Web Dashboard)](#23-control-ui-web-dashboard)
24. [TTS (Text-to-Speech)](#24-tts-text-to-speech)
25. [Media Understanding](#25-media-understanding)
26. [Security & Auth](#26-security--auth)
27. [Health & Diagnostics](#27-health--diagnostics)
28. [Logging](#28-logging)
29. [Workspace Files](#29-workspace-files)
30. [Environment Variables](#30-environment-variables)

---

## 1. Architecture Overview

- **Single Gateway process** owns all messaging surfaces and state
- Control-plane clients (CLI, macOS app, web UI, automations) connect via **WebSocket** on configured port (default `127.0.0.1:18789`)
- **Nodes** (macOS/iOS/Android/headless) connect via same WebSocket with `role: node`
- **Canvas host** (default port `18793`) serves agent-editable HTML and A2UI
- One Gateway per host; it is the only place that opens channel sessions (e.g., WhatsApp)
- Agent runs use **pi-agent-core** runtime embedded in the Gateway
- All session state is owned by the Gateway (source of truth)

### Component Flow
```
Client (CLI/UI/macOS) ──WS──▶ Gateway ──▶ Model Provider (Anthropic/OpenAI/etc.)
                                │
Node (iOS/Android/Mac) ──WS──▶ │
                                │
Channel (WhatsApp/Telegram) ◀──┤
```

---

## 2. Gateway

### Starting/Stopping
```bash
openclaw gateway                    # Foreground
openclaw gateway start              # Service (launchd/systemd)
openclaw gateway stop
openclaw gateway restart
openclaw gateway status
openclaw gateway install            # Install as system service
openclaw gateway uninstall
openclaw gateway run                # Explicit foreground run
```

### Options
| Flag | Description |
|------|-------------|
| `--port <port>` | WebSocket port (default: config `gateway.port` or 18789) |
| `--bind <mode>` | `loopback\|lan\|tailnet\|auto\|custom` |
| `--auth <mode>` | `token\|password` |
| `--token <token>` | Shared auth token |
| `--password <pw>` | Auth password |
| `--force` | Kill existing listener on port |
| `--tailscale <mode>` | `off\|serve\|funnel` |
| `--verbose` | Verbose logging |
| `--compact` | Compact WS log style |
| `--dev` | Dev profile (isolated state, port 19001) |
| `--reset` | Reset dev config (requires `--dev`) |
| `--raw-stream` | Log raw model stream events to JSONL |

### Subcommands
| Command | Description |
|---------|-------------|
| `gateway call <method>` | Call a Gateway RPC method |
| `gateway discover` | Discover gateways via Bonjour |
| `gateway health` | Fetch Gateway health |
| `gateway probe` | Reachability + discovery + health summary |
| `gateway usage-cost` | Usage cost summary from session logs |

---

## 3. WebSocket Protocol

### Transport
- WebSocket, text frames with JSON payloads
- First frame **must** be `connect`
- Protocol version negotiated via `minProtocol`/`maxProtocol` (current: 3)

### Frame Types
```
Request:  { type: "req", id, method, params }
Response: { type: "res", id, ok, payload | error }
Event:    { type: "event", event, payload, seq?, stateVersion? }
```

### Handshake
1. Gateway sends `connect.challenge` with nonce
2. Client sends `connect` with auth, role, scopes, device identity
3. Gateway responds `hello-ok` with protocol version, policy, optional device token

### Roles
- **`operator`**: control plane client (CLI/UI/automation)
  - Scopes: `operator.read`, `operator.write`, `operator.admin`, `operator.approvals`, `operator.pairing`
- **`node`**: capability host (camera/screen/canvas)
  - Declares `caps`, `commands`, `permissions`

### Key RPC Methods (Gateway API Surface)
| Method | Description |
|--------|-------------|
| `connect` | Handshake |
| `health` | Health snapshot |
| `status` | Channel/gateway status |
| `system-presence` | Connected devices/clients |
| `agent` | Start an agent run (returns runId) |
| `agent.wait` | Wait for agent run completion |
| `chat.send` | Send chat message (non-blocking, returns runId) |
| `chat.history` | Get chat history |
| `chat.abort` | Stop active agent run |
| `chat.inject` | Append assistant note (no agent run) |
| `send` | Send outbound message |
| `sessions.list` | List sessions |
| `sessions.patch` | Patch session (thinking/verbose overrides) |
| `channels.status` | Per-channel status |
| `config.get` | Get current config |
| `config.schema` | Get config JSON schema |
| `config.set` | Set config value |
| `config.apply` | Validate + write + restart |
| `config.patch` | Merge partial update + restart |
| `models.list` | List available models |
| `cron.list` | List cron jobs |
| `cron.add` | Add cron job |
| `cron.update` | Update cron job |
| `cron.remove` | Remove cron job |
| `cron.run` | Force-run a cron job |
| `cron.runs` | Get run history |
| `cron.status` | Scheduler status |
| `skills.*` | Skills management |
| `node.list` | List connected nodes |
| `node.invoke` | Invoke node command |
| `exec.approval.resolve` | Resolve exec approval |
| `web.login.*` | Channel QR login |
| `device.token.rotate` | Rotate device token |
| `device.token.revoke` | Revoke device token |
| `logs.tail` | Live log tail |
| `update.run` | Package update + restart |

### Event Types
| Event | Description |
|-------|-------------|
| `agent` | Agent streaming (assistant/tool/lifecycle) |
| `chat` | Chat delta/final messages |
| `presence` | Device presence changes |
| `tick` | Periodic keepalive |
| `health` | Health state changes |
| `heartbeat` | Heartbeat events |
| `cron` | Cron job events |
| `shutdown` | Gateway shutdown |
| `exec.approval.requested` | Exec needs approval |
| `connect.challenge` | Pre-connect nonce |

---

## 4. HTTP APIs

### OpenAI Chat Completions (disabled by default)
- **Endpoint**: `POST /v1/chat/completions`
- **Enable**: `gateway.http.endpoints.chatCompletions.enabled: true`
- **Auth**: `Authorization: Bearer <token>`
- **Agent selection**: `model: "openclaw:<agentId>"` or header `x-openclaw-agent-id`
- **Session**: `x-openclaw-session-key` header or `user` field for stable sessions
- **Streaming**: `stream: true` → SSE (`data: [DONE]` terminator)

### OpenResponses API (disabled by default)
- **Endpoint**: `POST /v1/responses`
- **Enable**: `gateway.http.endpoints.responses.enabled: true`
- **Auth**: Same as Chat Completions
- **Features**: Item-based input, client tool calls, images, files (PDF), SSE streaming
- **SSE Events**: `response.created`, `response.in_progress`, `response.output_text.delta`, `response.completed`, etc.
- **File support**: text/plain, text/markdown, text/html, text/csv, application/json, application/pdf (max 5MB)
- **Image support**: jpeg, png, gif, webp (max 10MB, base64 or URL)

### Tools Invoke HTTP API
- **Endpoint**: `POST /v1/tools/invoke`
- Invoke gateway tools via HTTP

---

## 5. CLI Commands

### Top-Level Commands
```
openclaw acp                # Agent Control Protocol tools
openclaw agent              # Run an agent turn
openclaw agents             # Manage isolated agents
openclaw approvals          # Exec approvals
openclaw browser            # Manage OpenClaw browser
openclaw channels           # Channel management
openclaw completion         # Shell completion
openclaw config             # Config helpers (get/set/unset/wizard)
openclaw configure          # Interactive credential setup
openclaw cron               # Cron scheduler
openclaw dashboard          # Open Control UI
openclaw devices            # Device pairing + tokens
openclaw directory          # Directory commands
openclaw dns                # DNS helpers
openclaw docs               # Docs helpers
openclaw doctor             # Health checks + quick fixes
openclaw gateway            # Gateway control
openclaw health             # Fetch health from running gateway
openclaw hooks              # Hooks tooling
openclaw logs               # Gateway logs
openclaw memory             # Memory search tools
openclaw message            # Send messages and channel actions
openclaw models             # Model configuration
openclaw node               # Node control
openclaw nodes              # Node commands
openclaw onboard            # Interactive setup wizard
openclaw pairing            # Pairing helpers
openclaw plugins            # Plugin management
openclaw reset              # Reset local config/state
openclaw sandbox            # Sandbox tools
openclaw security           # Security helpers
openclaw sessions           # List stored sessions
openclaw setup              # Initialize config + workspace
openclaw skills             # Skills management
openclaw status             # Channel health + recent sessions
openclaw system             # System events, heartbeat, presence
openclaw tui                # Terminal UI
openclaw uninstall          # Uninstall gateway + data
openclaw update             # CLI update helpers
openclaw webhooks           # Webhook helpers
```

### Global Flags
| Flag | Description |
|------|-------------|
| `--dev` | Dev profile (isolated state, port 19001) |
| `--profile <name>` | Named profile isolation |
| `--no-color` | Disable ANSI colors |
| `-V, --version` | Version |

---

## 6. Configuration Schema

Config file: `~/.openclaw/openclaw.json` (or `OPENCLAW_CONFIG_PATH`)  
Format: JSON5 supported

### Complete Config Key Reference

#### `meta`
- `meta.lastTouchedVersion` (string)
- `meta.lastTouchedAt` (string)

#### `env`
- `env.shellEnv.enabled` (boolean) — Enable shell environment resolution
- `env.shellEnv.timeoutMs` (integer) — Shell env timeout
- `env.vars` (object) — Static environment variables

#### `diagnostics`
- `diagnostics.enabled` (boolean)
- `diagnostics.flags` (string[])
- `diagnostics.otel.enabled` (boolean) — OpenTelemetry
- `diagnostics.otel.endpoint` (string)
- `diagnostics.otel.protocol` (`http/protobuf` | `grpc`)
- `diagnostics.otel.headers` (object)
- `diagnostics.otel.serviceName` (string)
- `diagnostics.otel.traces` / `metrics` / `logs` (boolean)
- `diagnostics.otel.sampleRate` (0-1)
- `diagnostics.otel.flushIntervalMs` (integer)
- `diagnostics.cacheTrace.enabled` (boolean)
- `diagnostics.cacheTrace.filePath` (string)
- `diagnostics.cacheTrace.includeMessages` / `includePrompt` / `includeSystem` (boolean)

#### `logging`
- `logging.level` — `silent|fatal|error|warn|info|debug|trace`
- `logging.file` (string) — Log file path
- `logging.consoleLevel` — Same enum as level
- `logging.consoleStyle` — `pretty|compact|json`
- `logging.redactSensitive` — `off|tools`
- `logging.redactPatterns` (string[])

#### `update`
- `update.channel` — `stable|beta|dev`
- `update.checkOnStart` (boolean)

#### `browser`
- `browser.enabled` (boolean, default: true)
- `browser.evaluateEnabled` (boolean)
- `browser.cdpUrl` (string) — Remote CDP URL
- `browser.remoteCdpTimeoutMs` / `remoteCdpHandshakeTimeoutMs` (integer)
- `browser.executablePath` (string) — Chrome/Chromium path
- `browser.headless` (boolean)
- `browser.noSandbox` (boolean)
- `browser.attachOnly` (boolean)
- `browser.defaultProfile` (string)
- `browser.snapshotDefaults.mode` (`efficient`)
- `browser.profiles.<key>.cdpPort` (integer) / `cdpUrl` / `driver` (`clawd|extension`) / `color`

#### `ui`
- `ui.seamColor` (hex color)
- `ui.assistant.name` (string, max 50)
- `ui.assistant.avatar` (string, max 200)

#### `auth`
- `auth.profiles.<key>.provider` (string)
- `auth.profiles.<key>.mode` — `api_key|oauth|token`
- `auth.profiles.<key>.email` (string)
- `auth.order.<provider>` (string[]) — Profile priority order
- `auth.cooldowns.billingBackoffHours` / `billingMaxHours` / `failureWindowHours` (number)
- `auth.cooldowns.billingBackoffHoursByProvider.<provider>` (number)

#### `models`
- `models.mode` — `merge|replace`
- `models.providers.<key>.baseUrl` (string)
- `models.providers.<key>.apiKey` (string, supports `${ENV_VAR}`)
- `models.providers.<key>.auth` — `api-key|aws-sdk|oauth|token`
- `models.providers.<key>.api` — `openai-completions|openai-responses|anthropic-messages|google-generative-ai|github-copilot|bedrock-converse-stream`
- `models.providers.<key>.headers` (object)
- `models.providers.<key>.authHeader` (boolean)
- `models.providers.<key>.models[]` — `{ id, name, reasoning?, input?, cost?, contextWindow?, maxTokens? }`
- `models.bedrockDiscovery.enabled` / `region` / `providerFilter` / `refreshInterval` / `defaultContextWindow` / `defaultMaxTokens`

#### `agents`
- `agents.defaults.model.primary` (string) — e.g. `anthropic/claude-opus-4-6`
- `agents.defaults.model.fallbacks` (string[])
- `agents.defaults.imageModel.primary` / `fallbacks`
- `agents.defaults.models.<alias>.alias` / `params` / `streaming`
- `agents.defaults.workspace` (string) — Default workspace path
- `agents.defaults.repoRoot` (string)
- `agents.defaults.skipBootstrap` (boolean)
- `agents.defaults.bootstrapMaxChars` (integer)
- `agents.defaults.userTimezone` (string) — IANA timezone
- `agents.defaults.timeFormat` — `auto|12|24`
- `agents.defaults.envelopeTimezone` / `envelopeTimestamp` / `envelopeElapsed`
- `agents.defaults.contextTokens` (integer)
- `agents.defaults.thinkingDefault` — `off|minimal|low|medium|high|xhigh`
- `agents.defaults.verboseDefault` — `off|on|full`
- `agents.defaults.elevatedDefault` — `off|on|ask|full`
- `agents.defaults.blockStreamingDefault` — `off|on`
- `agents.defaults.blockStreamingBreak` — `text_end|message_end`
- `agents.defaults.blockStreamingChunk.minChars` / `maxChars` / `breakPreference`
- `agents.defaults.blockStreamingCoalesce.minChars` / `maxChars` / `idleMs`
- `agents.defaults.humanDelay.mode` — `off|natural|custom`
- `agents.defaults.humanDelay.minMs` / `maxMs`
- `agents.defaults.timeoutSeconds` (integer, default 600)
- `agents.defaults.mediaMaxMb` (number)
- `agents.defaults.typingIntervalSeconds` / `typingMode`
- `agents.defaults.maxConcurrent` (integer)
- `agents.defaults.subagents.maxConcurrent` / `archiveAfterMinutes` / `model` / `thinking`
- `agents.defaults.heartbeat.*` — See [Heartbeat](#18-heartbeat)
- `agents.defaults.compaction.*` — See [Compaction](#compaction)
- `agents.defaults.contextPruning.*` — See below
- `agents.defaults.memorySearch.*` — See [Memory](#12-memory-system)
- `agents.defaults.sandbox.*` — See [Sandboxing](#22-sandboxing)
- `agents.defaults.cliBackends.*` — External CLI agent backends
- `agents.list[]` — Array of agent definitions (multi-agent)

#### `agents.defaults.compaction`
- `mode` — `default|safeguard`
- `reserveTokensFloor` (integer)
- `maxHistoryShare` (number)
- `memoryFlush.enabled` (boolean)
- `memoryFlush.softThresholdTokens` (integer)
- `memoryFlush.prompt` / `systemPrompt` (string)

#### `agents.defaults.contextPruning`
- `mode` — `off|cache-ttl`
- `ttl` (string)
- `keepLastAssistants` (integer)
- `softTrimRatio` / `hardClearRatio` (number)
- `minPrunableToolChars` (integer)
- `tools.allow` / `tools.deny` (string[])
- `softTrim.maxChars` / `headChars` / `tailChars`
- `hardClear.enabled` / `placeholder`

#### `tools`
- `tools.profile` — `minimal|coding|messaging|full`
- `tools.allow` / `tools.alsoAllow` / `tools.deny` (string[])
- `tools.byProvider.<provider>.profile` / `allow` / `deny`
- `tools.web.search.enabled` / `provider` (`brave|perplexity`) / `apiKey` / `maxResults` / `timeoutSeconds` / `cacheTtlMinutes`
- `tools.web.search.perplexity.apiKey` / `baseUrl` / `model`
- `tools.web.fetch.enabled` / `maxChars` / `maxCharsCap` / `timeoutSeconds` / `cacheTtlMinutes` / `maxRedirects` / `userAgent`
- `tools.media.models` / `concurrency`
- `tools.media.image.*` / `audio.*` / `video.*` — Enable/configure media understanding per type
- `tools.links.enabled` / `scope` / `maxLinks` / `timeoutSeconds` / `models`
- `tools.message.allowCrossContextSend` / `crossContext.*` / `broadcast.*`
- `tools.agentToAgent.enabled` / `allow` (string[])
- `tools.elevated.enabled` / `allowFrom`
- `tools.exec.host` / `security` / `ask` / `node` / `pathPrepend` / `safeBins` / `backgroundMs` / `timeoutSec` / `cleanupMs` / `notifyOnExit`
- `tools.exec.applyPatch.enabled` / `allowModels`
- `tools.subagents.tools.allow` / `deny`
- `tools.sandbox.tools.allow` / `deny`

#### `bindings` (array) — Multi-agent routing rules
Each: `{ agentId, match: { channel, accountId?, peer?: { kind, id }, guildId?, teamId? } }`

#### `broadcast`
- `broadcast.strategy` (string)

#### `audio`
- `audio.transcription.command` (string[]) / `timeoutSeconds`

#### `media`
- `media.preserveFilenames` (boolean)

#### `messages`
- `messages.messagePrefix` / `responsePrefix` (string)
- `messages.groupChat.mentionPatterns` (string[]) / `historyLimit`
- `messages.queue.mode` — `steer|followup|collect|steer-backlog|steer+backlog|queue|interrupt`
- `messages.queue.byChannel.<channel>` — Per-channel queue mode
- `messages.queue.debounceMs` / `cap` / `drop`
- `messages.inbound.debounceMs` / `byChannel`
- `messages.ackReaction` / `ackReactionScope` / `removeAckAfterReply`
- `messages.tts.*` — See [TTS](#24-tts-text-to-speech)

#### `commands`
- `commands.native` — `boolean | "auto"` (default: auto)
- `commands.nativeSkills` — `boolean | "auto"` (default: auto)
- `commands.text` / `bash` / `config` / `debug` / `restart` (boolean)
- `commands.bashForegroundMs` (integer)
- `commands.useAccessGroups` (boolean)
- `commands.ownerAllowFrom` (string[])

#### `approvals`
- `approvals.exec.enabled` (boolean)
- `approvals.exec.mode` — `session|targets|both`
- `approvals.exec.agentFilter` / `sessionFilter` / `targets` (string[])

#### `session`
- `session.scope` — `per-sender|global`
- `session.dmScope` — `main|per-peer|per-channel-peer|per-account-channel-peer`
- `session.identityLinks` (object) — Cross-channel identity mapping
- `session.resetTriggers` (string[])
- `session.idleMinutes` (integer)
- `session.reset.mode` — `daily|idle`
- `session.reset.atHour` (integer) / `idleMinutes`
- `session.resetByType.dm` / `group` / `thread` — Per-type reset policy
- `session.resetByChannel.<channel>` — Per-channel reset policy
- `session.store` (string) — Store path
- `session.typingIntervalSeconds` / `typingMode`
- `session.mainKey` (string, default: "main")
- `session.sendPolicy.default` (`allow|deny`) / `rules[]`
- `session.agentToAgent.maxPingPongTurns` (integer)

#### `cron`
- `cron.enabled` (boolean, default: true)
- `cron.store` (string)
- `cron.maxConcurrentRuns` (integer, default: 1)

#### `hooks`
- `hooks.enabled` (boolean)
- `hooks.path` / `token` / `maxBodyBytes`
- `hooks.presets` / `transformsDir` / `mappings`
- `hooks.gmail.*` — Gmail PubSub integration
- `hooks.internal.enabled` / `handlers` / `entries` / `load.extraDirs` / `installs`

#### `web`
- `web.enabled` (boolean)
- `web.heartbeatSeconds` (integer)
- `web.reconnect.initialMs` / `maxMs` / `factor` / `jitter` / `maxAttempts`

#### `channels`
- `channels.<channelId>.*` — Per-channel configuration (see [Channels](#7-chat-channels))

#### `discovery`
- `discovery.wideArea.enabled` (boolean)
- `discovery.mdns.mode` (string)

#### `canvasHost`
- `canvasHost.enabled` (boolean)
- `canvasHost.root` / `port` (default: 18793)
- `canvasHost.liveReload` (boolean)

#### `talk`
- `talk.voiceId` / `voiceAliases` / `modelId` / `outputFormat` / `apiKey`
- `talk.interruptOnSpeech` (boolean)

#### `gateway`
- `gateway.port` (integer, default: 18789)
- `gateway.mode` — `local|remote`
- `gateway.bind` — `auto|lan|loopback|custom|tailnet`
- `gateway.controlUi.enabled` / `basePath` / `root` / `allowedOrigins` / `allowInsecureAuth` / `dangerouslyDisableDeviceAuth`
- `gateway.auth.mode` — `token|password`
- `gateway.auth.token` / `password` / `allowTailscale`
- `gateway.trustedProxies` (string[])
- `gateway.tailscale.mode` — `off|serve|funnel`
- `gateway.tailscale.resetOnExit`
- `gateway.remote.url` / `transport` (`ssh|direct`) / `token` / `password` / `tlsFingerprint` / `sshTarget` / `sshIdentity`
- `gateway.reload.mode` — `off|restart|hot|hybrid`
- `gateway.tls.enabled` / `autoGenerate` / `certPath` / `keyPath` / `caPath`
- `gateway.http.endpoints.chatCompletions.enabled` (boolean)
- `gateway.http.endpoints.responses.enabled` / `maxBodyBytes` / `files.*` / `images.*`
- `gateway.nodes.browser.mode` (`auto|manual|off`) / `node`
- `gateway.nodes.allowCommands` / `denyCommands`

#### `memory`
- `memory.backend` — `builtin|qmd`
- `memory.citations` — `auto|on|off`
- `memory.qmd.*` — QMD sidecar configuration

#### `skills`
- `skills.allowBundled` (string[])
- `skills.load.extraDirs` / `watch` / `watchDebounceMs`
- `skills.install.preferBrew` / `nodeManager` (`npm|pnpm|yarn|bun`)
- `skills.entries.<id>.enabled` / `apiKey` / `env` / `config`

#### `plugins`
- `plugins.enabled` (boolean, default: true)
- `plugins.allow` / `deny` (string[])
- `plugins.load.paths` (string[])
- `plugins.slots.memory` (string) — Exclusive memory plugin slot
- `plugins.entries.<id>.enabled` / `config`
- `plugins.installs.<id>.source` (`npm|archive|path`) / `spec` / `version`

#### `nodeHost`
- `nodeHost.browserProxy.enabled` / `allowProfiles`

---

## 7. Chat Channels

### Built-in Channels
| Channel | Transport | Key Requirements |
|---------|-----------|-----------------|
| **WhatsApp** | Baileys (WhatsApp Web) | QR pairing, phone online |
| **Telegram** | grammY (Bot API) | Bot token |
| **Discord** | discord.js (Bot API + Gateway) | Bot token, guild permissions |
| **Slack** | Bolt SDK | Workspace app credentials |
| **Signal** | signal-cli (JSON-RPC over HTTP) | Linked device |
| **iMessage (legacy)** | imsg CLI (stdio JSON-RPC) | macOS, deprecated |
| **BlueBubbles** | REST API | macOS server, **recommended for iMessage** |
| **WebChat** | Gateway WS API | Built-in |

### Plugin Channels (install separately)
| Channel | Plugin Package |
|---------|---------------|
| **Microsoft Teams** | `@openclaw/msteams` |
| **Mattermost** | Plugin (built-in or external) |
| **LINE** | `@openclaw/line` |
| **Feishu / Lark** | Plugin |
| **Google Chat** | Plugin |
| **Matrix** | `@openclaw/matrix` |
| **Nextcloud Talk** | `@openclaw/nextcloud-talk` |
| **Nostr** | `@openclaw/nostr` |
| **Tlon** | Plugin |
| **Twitch** | Plugin |
| **Zalo** | `@openclaw/zalo` |
| **Zalo Personal** | `@openclaw/zalouser` |

### Channel Features
- All channels support text; media/reactions/polls vary
- Multi-account support (e.g., multiple WhatsApp numbers)
- Group chat with mention-based activation
- DM allowlists and policies per channel
- Per-channel queue mode configuration

---

## 8. Model Providers & Auth

### Built-in Providers (no `models.providers` config needed)
| Provider | Auth | Example Model |
|----------|------|---------------|
| `anthropic` | `ANTHROPIC_API_KEY` or setup-token | `anthropic/claude-opus-4-6` |
| `openai` | `OPENAI_API_KEY` | `openai/gpt-5.1-codex` |
| `openai-codex` | OAuth (ChatGPT) | `openai-codex/gpt-5.3-codex` |
| `opencode` | `OPENCODE_API_KEY` | `opencode/claude-opus-4-6` |
| `google` | `GEMINI_API_KEY` | `google/gemini-3-pro-preview` |
| `google-vertex` | gcloud ADC | Vertex models |
| `google-antigravity` | OAuth plugin | Antigravity models |
| `google-gemini-cli` | OAuth plugin | Gemini CLI models |
| `openrouter` | `OPENROUTER_API_KEY` | `openrouter/anthropic/claude-sonnet-4-5` |
| `xai` | `XAI_API_KEY` | xAI models |
| `groq` | `GROQ_API_KEY` | Groq models |
| `cerebras` | `CEREBRAS_API_KEY` | Cerebras models |
| `mistral` | `MISTRAL_API_KEY` | Mistral models |
| `github-copilot` | `COPILOT_GITHUB_TOKEN` | Copilot models |
| `zai` | `ZAI_API_KEY` | `zai/glm-4.7` |
| `vercel-ai-gateway` | `AI_GATEWAY_API_KEY` | Vercel AI Gateway |

### Custom Providers (via `models.providers`)
| Provider | API Type | Auth |
|----------|----------|------|
| Ollama | `openai-completions` | None (local) |
| Moonshot (Kimi) | `openai-completions` | `MOONSHOT_API_KEY` |
| Kimi Coding | `anthropic-messages` | `KIMI_API_KEY` |
| Synthetic | `anthropic-messages` | `SYNTHETIC_API_KEY` |
| MiniMax | `anthropic-messages` | `MINIMAX_API_KEY` |
| LM Studio / vLLM | `openai-completions` | Varies |
| AWS Bedrock | `bedrock-converse-stream` | `aws-sdk` |

### Auth Profiles
- Stored per-agent at `~/.openclaw/agents/<agentId>/agent/auth-profiles.json`
- Modes: `api_key`, `oauth`, `token`
- Multiple profiles per provider with priority ordering
- Billing backoff and failure cooldowns
- CLI: `openclaw models auth login|paste-token --provider <provider>`

### Model Failover
- `agents.defaults.model.fallbacks` — Ordered fallback list
- Automatic failover on billing errors with configurable backoff

---

## 9. Agent System

### Agent Loop Lifecycle
1. `agent` RPC validates params, resolves session, returns `{ runId, acceptedAt }`
2. Resolves model + thinking/verbose defaults, loads skills
3. Runs `runEmbeddedPiAgent` (pi-agent-core runtime)
4. Emits lifecycle/stream events: `assistant`, `tool`, `lifecycle`
5. Final payloads assembled, delivered to channel

### Concurrency
- Runs serialized per session key (session lane) + optional global lane
- `agents.defaults.maxConcurrent` (default: 4)
- `agents.defaults.subagents.maxConcurrent` (default: 8)

### System Prompt Assembly
- OpenClaw base prompt + skills prompt + bootstrap context + per-run overrides
- Model-specific limits and compaction reserve enforced
- Workspace files (AGENTS.md, SOUL.md, USER.md, TOOLS.md, HEARTBEAT.md) injected

### Streaming
- Assistant deltas streamed in real-time
- Block streaming: `text_end` or `message_end` breaks
- Chunking: configurable min/max chars, break preference (paragraph/newline/sentence)
- Human delay: optional natural typing simulation

### Thinking Levels
- `off|minimal|low|medium|high|xhigh`
- Per-session override via `/thinking <level>`
- Per-agent default: `agents.defaults.thinkingDefault`

### Verbose Mode
- `off|on|full`
- Shows tool calls and internal state
- Per-session override via `/verbose <level>`

---

## 10. Multi-Agent Routing

### Agent Definition
Each agent has:
- **Workspace** (files, persona, skills)
- **State directory** (`agentDir`) for auth profiles, model registry
- **Session store** (per-agent under `~/.openclaw/agents/<agentId>/sessions`)
- **Optional** per-agent model, sandbox, tools, heartbeat overrides

### Configuration
```json5
{
  agents: {
    list: [
      { id: "home", default: true, workspace: "~/.openclaw/workspace-home" },
      { id: "work", workspace: "~/.openclaw/workspace-work" }
    ]
  },
  bindings: [
    { agentId: "home", match: { channel: "whatsapp", accountId: "personal" } },
    { agentId: "work", match: { channel: "whatsapp", accountId: "biz" } }
  ]
}
```

### Routing Priority (most-specific wins)
1. `peer` match (exact DM/group/channel id)
2. `guildId` (Discord)
3. `teamId` (Slack)
4. `accountId` match
5. Channel-level match (`accountId: "*"`)
6. Fallback to default agent

### Per-Agent Overrides
- `agents.list[].model` / `sandbox` / `tools` / `heartbeat` / `groupChat`
- `agents.list[].subagents.allowAgents` — Allowlist for cross-agent spawns

### Agent-to-Agent Communication
- `tools.agentToAgent.enabled: true` + `allow: ["agent1", "agent2"]`
- Via `sessions_send` tool with ping-pong protocol
- `session.agentToAgent.maxPingPongTurns` (0-5)

---

## 11. Session Management

### Session Keys
| Context | Key Format |
|---------|-----------|
| DM (main) | `agent:<agentId>:<mainKey>` |
| DM (per-peer) | `agent:<agentId>:dm:<peerId>` |
| DM (per-channel-peer) | `agent:<agentId>:<channel>:dm:<peerId>` |
| Group | `agent:<agentId>:<channel>:group:<id>` |
| Telegram topic | `...:group:<id>:topic:<threadId>` |
| Cron | `cron:<jobId>` |
| Webhook | `hook:<uuid>` |
| Node | `node-<nodeId>` |

### DM Scopes
- `main` (default): all DMs share main session (continuity)
- `per-peer`: isolate by sender id
- `per-channel-peer`: isolate by channel + sender
- `per-account-channel-peer`: isolate by account + channel + sender

### Reset Policies
- `daily` (default): reset at `atHour` (default 4am local)
- `idle`: reset after `idleMinutes` of inactivity
- Per-type overrides: `session.resetByType.dm/group/thread`
- Per-channel overrides: `session.resetByChannel.<channel>`

### Chat Commands
| Command | Action |
|---------|--------|
| `/new [model]` | New session (optional model switch) |
| `/reset` | Reset session |
| `/stop` | Abort current run |
| `/status` | Session status info |
| `/compact [instructions]` | Manual compaction |
| `/context list\|detail` | System prompt inspection |
| `/thinking <level>` | Override thinking level |
| `/verbose <level>` | Override verbose mode |
| `/reasoning on\|off` | Toggle reasoning delivery |
| `/send on\|off\|inherit` | Override send policy |

### Storage
- Store: `~/.openclaw/agents/<agentId>/sessions/sessions.json`
- Transcripts: `~/.openclaw/agents/<agentId>/sessions/<SessionId>.jsonl`

---

## 12. Memory System

### Workspace-Based Memory
- `memory/YYYY-MM-DD.md` — Daily logs (read today + yesterday at session start)
- `MEMORY.md` — Curated long-term memory (main session only, security)

### Memory Tools
| Tool | Description |
|------|-------------|
| `memory_search` | Semantic search over memory Markdown files |
| `memory_get` | Read specific memory file content |

### Vector Memory Search
- **Providers**: `openai`, `local`, `gemini`, `voyage`
- **Storage**: per-agent SQLite at `~/.openclaw/memory/<agentId>.sqlite`
- **Hybrid search**: BM25 + vector similarity (configurable weights)
- **Embedding cache**: SQLite-backed, avoids re-embedding unchanged text
- **sqlite-vec**: Optional acceleration for vector queries
- **Local mode**: node-llama-cpp with GGUF models (auto-download)
- **Batch indexing**: OpenAI and Gemini batch APIs for large backfills

### QMD Backend (experimental)
- `memory.backend = "qmd"` — Local-first BM25 + vectors + reranking via QMD CLI
- Runs as sidecar, auto-updates index on interval
- Falls back to builtin on failure

### Pre-Compaction Memory Flush
- Silent agent turn before compaction to write durable notes
- Configurable via `agents.defaults.compaction.memoryFlush`

---

## 13. Tools (Agent-Facing)

### Core Tools
| Tool | Description |
|------|-------------|
| `exec` | Run shell commands |
| `process` | Manage background exec sessions (list/poll/log/write/kill) |
| `read` | Read file contents (text + images) |
| `write` | Write/create files |
| `edit` | Precise text replacement in files |
| `apply_patch` | Multi-hunk patch (experimental, OpenAI only) |
| `web_search` | Brave Search API |
| `web_fetch` | Fetch URL → markdown/text |
| `browser` | Control dedicated browser (snapshot/act/screenshot) |
| `canvas` | Drive node Canvas (present/eval/snapshot/A2UI) |
| `nodes` | Discover/control paired nodes |
| `image` | Analyze image with vision model |
| `message` | Send messages across channels |
| `cron` | Manage cron jobs |
| `gateway` | Gateway restart/config/update |
| `tts` | Text-to-speech |
| `sessions_list` | List sessions |
| `sessions_history` | Get session transcript |
| `sessions_send` | Send to another session |
| `sessions_spawn` | Spawn sub-agent |
| `session_status` | Current session info |
| `agents_list` | List available agents |

### Tool Groups (for allow/deny)
| Group | Tools |
|-------|-------|
| `group:runtime` | exec, bash, process |
| `group:fs` | read, write, edit, apply_patch |
| `group:sessions` | sessions_list, sessions_history, sessions_send, sessions_spawn, session_status |
| `group:memory` | memory_search, memory_get |
| `group:web` | web_search, web_fetch |
| `group:ui` | browser, canvas |
| `group:automation` | cron, gateway |
| `group:messaging` | message |
| `group:nodes` | nodes |
| `group:openclaw` | All built-in tools |

### Tool Profiles
| Profile | Description |
|---------|-------------|
| `minimal` | session_status only |
| `coding` | group:fs, group:runtime, group:sessions, group:memory, image |
| `messaging` | group:messaging, sessions_list/history/send, session_status |
| `full` | No restriction |

---

## 14. Skills

Skills are tool-usage guides (SKILL.md files) injected into the system prompt. They are **not** tools themselves but instructions for how to use CLI tools.

### Bundled Skills (53 total)
| Skill | Purpose |
|-------|---------|
| `1password` | 1Password CLI integration |
| `apple-notes` | Apple Notes (macOS) |
| `apple-reminders` | Apple Reminders (macOS) |
| `bear-notes` | Bear Notes app |
| `bird` | Twitter/X CLI |
| `blogwatcher` | Blog monitoring |
| `blucli` | Bluetooth CLI |
| `bluebubbles` | iMessage via BlueBubbles |
| `camsnap` | Camera snapshot |
| `canvas` | Canvas rendering guide |
| `clawhub` | ClawHub integration |
| `coding-agent` | Coding agent patterns |
| `discord` | Discord skill guide |
| `eightctl` | 8Sleep control |
| `food-order` | Food ordering |
| `gemini` | Gemini-specific guide |
| `gifgrep` | GIF search |
| `github` | GitHub CLI |
| `gog` | Google Calendar |
| `goplaces` | Location/places |
| `healthcheck` | Health monitoring guide |
| `himalaya` | Email via Himalaya CLI |
| `imsg` | iMessage (legacy) |
| `local-places` | Local places (Google Places API server) |
| `mcporter` | Media conversion |
| `model-usage` | Model usage tracking |
| `nano-banana-pro` | Image generation (Banana) |
| `nano-pdf` | PDF handling |
| `notion` | Notion API |
| `obsidian` | Obsidian notes |
| `openai-image-gen` | OpenAI image generation |
| `openai-whisper` | Whisper transcription (local) |
| `openai-whisper-api` | Whisper transcription (API) |
| `openhue` | Philips Hue control |
| `oracle` | Oracle/divination |
| `ordercli` | Order management |
| `peekaboo` | macOS screen analysis |
| `sag` | ElevenLabs TTS |
| `session-logs` | Session log analysis |
| `sherpa-onnx-tts` | Local TTS (Sherpa-ONNX) |
| `skill-creator` | Create new skills |
| `slack` | Slack skill guide |
| `songsee` | Music recognition |
| `sonoscli` | Sonos control |
| `spotify-player` | Spotify control |
| `summarize` | Summarization patterns |
| `things-mac` | Things 3 (macOS) |
| `tmux` | Tmux session management |
| `trello` | Trello boards |
| `video-frames` | Video frame extraction |
| `voice-call` | Voice call guide |
| `wacli` | WhatsApp CLI |
| `weather` | Weather data |

### Management
```bash
openclaw skills list
openclaw skills info <id>
openclaw skills enable <id>
openclaw skills disable <id>
openclaw skills install <path-or-npm-spec>
```

### Configuration
```json5
{
  skills: {
    entries: {
      "weather": { enabled: true, apiKey: "..." },
      "github": { enabled: true, env: { GITHUB_TOKEN: "..." } }
    },
    load: { extraDirs: ["~/my-skills"] },
    install: { nodeManager: "npm" }
  }
}
```

---

## 15. Plugins / Extensions

### Plugin Types
- **Bundled** (shipped with OpenClaw, disabled by default)
- **Installed** (npm/archive/path, enabled by default)
- **Workspace** extensions (`<workspace>/.openclaw/extensions/`)
- **Global** extensions (`~/.openclaw/extensions/`)

### Plugin Capabilities
- Gateway RPC methods
- Gateway HTTP handlers
- Agent tools
- CLI commands
- Background services
- Config validation
- Skills directories
- Auto-reply commands

### Official Plugins
| Plugin | Description |
|--------|-------------|
| `memory-core` | Built-in memory search (default) |
| `memory-lancedb` | LanceDB long-term memory (auto-recall/capture) |
| `voice-call` | Voice calling (Telnyx/Twilio/Plivo) |
| `discord` | Discord integration |
| `telegram` | Telegram integration |
| `whatsapp` | WhatsApp integration |
| `slack` | Slack integration |
| `signal` | Signal integration |
| `imessage` | iMessage integration |
| `bluebubbles` | BlueBubbles iMessage |
| `msteams` | Microsoft Teams |
| `line` | LINE Messaging |
| `feishu` | Feishu/Lark |
| `googlechat` | Google Chat |
| `matrix` | Matrix protocol |
| `nextcloud-talk` | Nextcloud Talk |
| `nostr` | Nostr DMs |
| `tlon` | Tlon/Urbit |
| `twitch` | Twitch chat |
| `zalo` / `zalouser` | Zalo bots / personal |
| `mattermost` | Mattermost |
| `google-antigravity-auth` | Google Antigravity OAuth |
| `google-gemini-cli-auth` | Gemini CLI OAuth |
| `qwen-portal-auth` | Qwen OAuth |
| `copilot-proxy` | VS Code Copilot proxy |
| `llm-task` | JSON-only LLM step for workflows |
| `lobster` | Typed workflow runtime |
| `open-prose` | Prose plugin |
| `diagnostics-otel` | OpenTelemetry diagnostics |

### Plugin Hooks (Lifecycle)
| Hook | When |
|------|------|
| `before_agent_start` | Before agent run |
| `agent_end` | After agent completion |
| `before_compaction` / `after_compaction` | Compaction lifecycle |
| `before_tool_call` / `after_tool_call` | Tool execution |
| `tool_result_persist` | Before tool result written to transcript |
| `message_received` / `message_sending` / `message_sent` | Message lifecycle |
| `session_start` / `session_end` | Session boundaries |
| `gateway_start` / `gateway_stop` | Gateway lifecycle |

### Plugin Slots (Exclusive)
```json5
{ plugins: { slots: { memory: "memory-core" } } }  // or "memory-lancedb" or "none"
```

### CLI
```bash
openclaw plugins list
openclaw plugins install <spec>     # npm, local path, tarball, zip
openclaw plugins enable/disable <id>
openclaw plugins update <id> | --all
openclaw plugins doctor
```

---

## 16. Hooks

### Types
- **Gateway hooks**: Event-driven scripts for commands and lifecycle
- **Webhooks**: External HTTP triggers (see `openclaw webhooks`)
- **Plugin hooks**: Extension points inside agent/tool lifecycle

### Bundled Hooks
| Hook | Event | Description |
|------|-------|-------------|
| `session-memory` | `command:new` | Save session context to memory |
| `command-logger` | `command:*` | Log all commands to file |
| `boot-md` | `gateway:start` | Run BOOT.md on gateway start |
| `soul-evil` | `agent:bootstrap` | Swap SOUL.md content (novelty) |

### Hook Events
- `command:new`, `command:reset`, `command:stop`
- `agent:bootstrap`
- Gateway lifecycle events

### Discovery Directories (precedence order)
1. `<workspace>/hooks/`
2. `~/.openclaw/hooks/`
3. `<openclaw>/dist/hooks/bundled/`

### CLI
```bash
openclaw hooks list
openclaw hooks enable/disable <id>
openclaw hooks check
openclaw hooks info <id>
openclaw hooks install <path-or-spec>
```

---

## 17. Cron & Automation

### Schedule Types
| Kind | Description |
|------|-------------|
| `at` | One-shot ISO 8601 timestamp |
| `every` | Fixed interval (ms) |
| `cron` | 5-field cron expression + optional IANA timezone |

### Execution Modes
| Mode | Session | Payload | Delivery |
|------|---------|---------|----------|
| Main | `agent:<agentId>:<mainKey>` | `systemEvent` | Via heartbeat |
| Isolated | `cron:<jobId>` | `agentTurn` | `announce` or `none` |

### Job Properties
- `name`, `description`, `jobId`
- `schedule`: `{ kind, at?, everyMs?, expr?, tz? }`
- `sessionTarget`: `main` or `isolated`
- `wakeMode`: `now` or `next-heartbeat`
- `payload`: `{ kind: "systemEvent", text }` or `{ kind: "agentTurn", message, model?, thinking?, timeoutSeconds? }`
- `delivery`: `{ mode: "announce"|"none", channel, to, bestEffort }`
- `agentId` (optional, for multi-agent)
- `deleteAfterRun` (default: true for `at`)
- `enabled` (boolean)

### Storage
- Jobs: `~/.openclaw/cron/jobs.json`
- Run history: `~/.openclaw/cron/runs/<jobId>.jsonl`

### CLI
```bash
openclaw cron add --name "..." --at|--cron|--every ... [options]
openclaw cron list
openclaw cron edit <jobId> [patches]
openclaw cron run <jobId> --force
openclaw cron runs --id <jobId>
openclaw system event --text "..." --mode now|next-heartbeat
```

### Gateway RPC
`cron.list`, `cron.status`, `cron.add`, `cron.update`, `cron.remove`, `cron.run`, `cron.runs`

---

## 18. Heartbeat

### Overview
Periodic agent turns in main session for proactive background work.

### Configuration
```json5
{
  agents: {
    defaults: {
      heartbeat: {
        every: "30m",              // interval (0m disables)
        model: "anthropic/...",    // optional model override
        target: "last",            // last | none | <channel>
        to: "+15551234567",        // optional recipient
        accountId: "...",          // optional multi-account
        prompt: "...",             // custom prompt
        ackMaxChars: 300,          // max chars after HEARTBEAT_OK
        includeReasoning: false,
        activeHours: { start: "08:00", end: "24:00", timezone: "America/New_York" }
      }
    }
  }
}
```

### Response Contract
- `HEARTBEAT_OK` = nothing to report (stripped, not delivered)
- Any other text = alert (delivered to target)

### Visibility Controls
Per-channel/account: `showOk`, `showAlerts`, `useIndicator`

---

## 19. Nodes (Devices)

### What Nodes Are
iOS/Android/macOS apps and headless hosts that connect via WebSocket with `role: node`.

### Capabilities
| Command | Description |
|---------|-------------|
| `camera.snap` | Take photo (front/back/both) |
| `camera.clip` | Record video clip |
| `screen.record` | Record screen |
| `location.get` | Get GPS location |
| `canvas.navigate` | Navigate canvas URL |
| `system.notify` | Send notification |
| `system.run` | Execute command on node |

### Pairing
- Devices require approval on first connect
- `openclaw devices list|approve|reject`
- Device tokens issued after pairing

### CLI
```bash
openclaw nodes list
openclaw nodes describe <id>
openclaw nodes camera snap --node <id>
openclaw nodes screen record --node <id>
openclaw node run --node <id> --command "..."
```

---

## 20. Browser Control

### Profiles
- Default profile: `chrome` (or `browser.defaultProfile`)
- Auto-allocated ports: 18800-18899 (~100 profiles)
- Drivers: `clawd` (managed) or `extension` (Chrome extension relay)

### Actions
| Action | Description |
|--------|-------------|
| `status` | Browser status |
| `start` / `stop` | Launch/stop browser |
| `profiles` | List profiles |
| `create-profile` / `delete-profile` / `reset-profile` | Profile management |
| `tabs` / `open` / `focus` / `close` | Tab management |
| `snapshot` | Accessibility tree (aria/ai mode) |
| `screenshot` | Visual capture |
| `act` | UI automation (click/type/press/hover/drag/select/fill) |
| `navigate` | Go to URL |
| `console` | Browser console |
| `pdf` | Save as PDF |
| `upload` | File upload |
| `dialog` | Handle dialogs |

### Targets
- `host` (default), `sandbox`, `node`
- Auto-routes to browser-capable node if connected

---

## 21. Canvas

### Actions
| Action | Description |
|--------|-------------|
| `present` | Show canvas on node |
| `hide` | Hide canvas |
| `navigate` | Load URL |
| `eval` | Execute JavaScript |
| `snapshot` | Capture rendered UI |
| `a2ui_push` | Push A2UI content |
| `a2ui_reset` | Reset A2UI |

### Configuration
```json5
{ canvasHost: { enabled: true, port: 18793, root: "...", liveReload: true } }
```

---

## 22. Sandboxing

### Modes (`agents.defaults.sandbox.mode`)
| Mode | Behavior |
|------|----------|
| `off` | No sandboxing (host execution) |
| `non-main` | Sandbox non-main sessions only |
| `all` | Sandbox every session |

### Scope (`agents.defaults.sandbox.scope`)
| Scope | Containers |
|-------|-----------|
| `session` | One per session |
| `agent` | One per agent |
| `shared` | One shared by all |

### Workspace Access (`agents.defaults.sandbox.workspaceAccess`)
| Mode | Behavior |
|------|----------|
| `none` | Isolated sandbox workspace |
| `ro` | Agent workspace mounted read-only at `/agent` |
| `rw` | Agent workspace mounted read/write at `/workspace` |

### Docker Options
- `docker.image` (default: `openclaw-sandbox:bookworm-slim`)
- `docker.network` (default: `none`)
- `docker.setupCommand` — One-time post-creation script
- `docker.env`, `docker.binds`, `docker.user`, `docker.memory`, `docker.cpus`
- `docker.capDrop`, `docker.seccompProfile`, `docker.apparmorProfile`

### Sandboxed Browser
- `sandbox.browser.enabled` / `image` / `cdpPort` / `vncPort` / `headless`
- `sandbox.browser.allowHostControl` — Allow sandboxed sessions to use host browser

---

## 23. Control UI (Web Dashboard)

### Access
- Local: `http://127.0.0.1:18789/`
- Tailscale: `https://<magicdns>/`
- Custom base: `gateway.controlUi.basePath`

### Sections
| Section | Features |
|---------|----------|
| **Chat** | Send messages, stream tool calls, abort, inject |
| **Channels** | Status, QR login, per-channel config |
| **Instances** | Presence list (connected devices/clients) |
| **Sessions** | List, per-session thinking/verbose overrides |
| **Cron Jobs** | List/add/run/enable/disable, run history |
| **Skills** | Status, enable/disable, install, API key updates |
| **Nodes** | List + capabilities |
| **Exec Approvals** | Gateway/node allowlists + ask policy |
| **Config** | View/edit `openclaw.json`, schema-driven forms, raw JSON |
| **Debug** | Status/health/models snapshots, event log, manual RPC |
| **Logs** | Live tail with filter/export |
| **Update** | Package/git update + restart |

### Auth
- Token or password via WebSocket handshake
- Device pairing required for non-local connections
- `gateway.controlUi.allowInsecureAuth` — Skip device identity (HTTP fallback)

---

## 24. TTS (Text-to-Speech)

### Providers
| Provider | Config Key |
|----------|-----------|
| ElevenLabs | `messages.tts.elevenlabs.*` |
| OpenAI TTS | `messages.tts.openai.*` |
| Edge TTS | `messages.tts.edge.*` |
| Sherpa-ONNX | Local skill |

### Configuration
```json5
{
  messages: {
    tts: {
      enabled: true,
      provider: "elevenlabs",
      mode: "auto",
      elevenlabs: {
        apiKey: "...",
        voiceId: "...",
        modelId: "eleven_multilingual_v2"
      }
    }
  }
}
```

---

## 25. Media Understanding

### Supported Types
| Type | Config | Providers |
|------|--------|-----------|
| **Image** | `tools.media.image.*` | Vision models, Deepgram |
| **Audio** | `tools.media.audio.*` | Whisper, Deepgram |
| **Video** | `tools.media.video.*` | Frame extraction + vision |

### Per-Type Settings
- `enabled` (boolean)
- `scope.default` (`allow|deny`) + `scope.rules[]`
- `maxBytes`, `maxChars`, `prompt`, `timeoutSeconds`, `language`
- `deepgram.*` — Language detection, punctuation, smart format
- `attachments.mode` (`first|all`) / `maxAttachments`
- `models[]` — Specific models for this media type

### Link Understanding
- `tools.links.enabled` — Auto-fetch and understand linked content
- `tools.links.scope`, `maxLinks`, `timeoutSeconds`, `models`

---

## 26. Security & Auth

### Gateway Auth
- **Token**: `gateway.auth.token` or `OPENCLAW_GATEWAY_TOKEN`
- **Password**: `gateway.auth.password` or `OPENCLAW_GATEWAY_PASSWORD`
- **Tailscale**: `gateway.auth.allowTailscale` for identity-header auth

### Device Pairing
- All clients include device identity on `connect`
- New devices require approval (except loopback auto-approve)
- Non-local connections must sign challenge nonce
- `openclaw devices list|approve|reject|revoke`

### TLS
- `gateway.tls.enabled` / `autoGenerate` / `certPath` / `keyPath` / `caPath`
- Client cert pinning: `gateway.remote.tlsFingerprint`

### Exec Security
- `tools.exec.security` — `deny|allowlist|full`
- `tools.exec.ask` — `off|on-miss|always`
- Exec approvals: `approvals.exec.*`
- Elevated mode: `tools.elevated.*`

### Send Policy
- `session.sendPolicy.default` (`allow|deny`) + rules
- Pattern matching on channel, chatType, keyPrefix

### CLI
```bash
openclaw security audit
openclaw security check
```

---

## 27. Health & Diagnostics

### Health Check
```bash
openclaw health --json              # Full health snapshot from gateway
openclaw status                     # Local summary
openclaw status --all               # Full diagnosis
openclaw status --deep              # + gateway probes
openclaw doctor                     # Health checks + quick fixes
```

### Gateway RPC
- `health` — Full health snapshot (channel probes, session store, creds age)
- `status` — Gateway/channel status

### Diagnostics
- `diagnostics.enabled` (boolean)
- `diagnostics.flags` (string[]) — Feature flags
- OpenTelemetry: `diagnostics.otel.*` (traces, metrics, logs)
- Cache trace: `diagnostics.cacheTrace.*`

---

## 28. Logging

### Configuration
```json5
{
  logging: {
    level: "info",           // silent|fatal|error|warn|info|debug|trace
    consoleLevel: "info",
    consoleStyle: "pretty",  // pretty|compact|json
    file: "/tmp/openclaw/openclaw.log",
    redactSensitive: "tools",
    redactPatterns: []
  }
}
```

### CLI
```bash
openclaw logs                        # Tail gateway logs
openclaw logs --follow               # Follow mode
openclaw logs --filter <pattern>     # Filter
```

### Log Locations
- Default: `/tmp/openclaw/openclaw-*.log`
- Configurable via `logging.file`

---

## 29. Workspace Files

### Standard Layout
```
<workspace>/
├── AGENTS.md          # Agent behavior rules (loaded every session)
├── SOUL.md            # Agent identity/personality
├── USER.md            # User context
├── TOOLS.md           # Environment-specific tool notes
├── MEMORY.md          # Curated long-term memory
├── HEARTBEAT.md       # Heartbeat checklist
├── BOOTSTRAP.md       # First-run bootstrap (deleted after)
├── BOOT.md            # Run on gateway start (hook)
├── memory/
│   └── YYYY-MM-DD.md  # Daily memory logs
├── hooks/             # Workspace hooks
└── skills/            # Workspace skills
```

### File Purposes
| File | Loaded When | Purpose |
|------|-------------|---------|
| `AGENTS.md` | Every session | Agent behavior rules |
| `SOUL.md` | Every session | Identity/personality |
| `USER.md` | Every session | User context |
| `TOOLS.md` | Every session | Tool/env notes |
| `MEMORY.md` | Main session only | Long-term memory (private) |
| `HEARTBEAT.md` | Heartbeat runs | Heartbeat checklist |
| `BOOTSTRAP.md` | First session | One-time setup (then delete) |

---

## 30. Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENCLAW_CONFIG_PATH` | Config file path |
| `OPENCLAW_STATE_DIR` | State directory (default: `~/.openclaw`) |
| `OPENCLAW_GATEWAY_TOKEN` | Gateway auth token |
| `OPENCLAW_GATEWAY_PASSWORD` | Gateway auth password |
| `OPENCLAW_PROFILE` | Named profile |
| `OPENCLAW_SKIP_CRON` | Disable cron (`1`) |
| `OPENCLAW_PLUGIN_CATALOG_PATHS` | External plugin catalogs |
| `OPENCLAW_CONTROL_UI_BASE_PATH` | UI build base path |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `OPENCODE_API_KEY` | OpenCode Zen API key |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `XAI_API_KEY` | xAI API key |
| `GROQ_API_KEY` | Groq API key |
| `CEREBRAS_API_KEY` | Cerebras API key |
| `MISTRAL_API_KEY` | Mistral API key |
| `BRAVE_API_KEY` | Brave Search API key |
| `VOYAGE_API_KEY` | Voyage embeddings API key |
| `ZAI_API_KEY` | Z.AI API key |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway key |
| `SYNTHETIC_API_KEY` | Synthetic API key |
| `MOONSHOT_API_KEY` | Moonshot AI API key |
| `KIMI_API_KEY` | Kimi Coding API key |
| `MINIMAX_API_KEY` | MiniMax API key |
| `COPILOT_GITHUB_TOKEN` | GitHub Copilot token |

---

## Appendix: File Paths Reference

| Path | Description |
|------|-------------|
| `~/.openclaw/openclaw.json` | Main config |
| `~/.openclaw/workspace/` | Default workspace |
| `~/.openclaw/agents/<id>/agent/` | Per-agent state dir |
| `~/.openclaw/agents/<id>/agent/auth-profiles.json` | Per-agent auth |
| `~/.openclaw/agents/<id>/sessions/` | Per-agent sessions |
| `~/.openclaw/agents/<id>/sessions/sessions.json` | Session store |
| `~/.openclaw/agents/<id>/sessions/<id>.jsonl` | Session transcripts |
| `~/.openclaw/memory/<id>.sqlite` | Memory vector index |
| `~/.openclaw/cron/jobs.json` | Cron job store |
| `~/.openclaw/cron/runs/<id>.jsonl` | Cron run history |
| `~/.openclaw/hooks/` | Managed hooks |
| `~/.openclaw/skills/` | Shared skills |
| `~/.openclaw/extensions/` | Global extensions |
| `~/.openclaw/credentials/` | Channel credentials |
| `~/.openclaw/logs/` | Log files |
| `~/.openclaw/sandboxes/` | Sandbox workspaces |

---

*This document covers OpenClaw 2026.2.4. Some features may require specific API keys, platform support (macOS for iMessage/Apple integrations), or plugin installation. Items marked as experimental may change.*
