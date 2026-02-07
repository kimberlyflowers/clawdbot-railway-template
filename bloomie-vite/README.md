# Bloomie Dashboard v11 — Vite Build

Single-page React dashboard for OpenClaw agent control, served via Express wrapper.

## Quick Start

```bash
# Install dependencies
npm install

# Development server (port 5173)
npm run dev

# Production build (outputs to dist/)
npm run build

# Preview build locally
npm run preview
```

## Build Output

The `npm run build` command outputs a production-ready build to the `dist/` directory:
- `index.html` — Entry point
- `app-[hash].js` — Minified React bundle
- `chunk-[hash].js` — Code-split chunks
- `[name]-[hash].css` — Styles (if any)

## Integration with Express Wrapper

The Vite build is served via Express, which:

1. **Serves the dashboard at `/`** — Express static middleware points to `dist/`
2. **Proxies OpenClaw at `/__openclaw__/*`** — WebSocket and JSON-RPC API
3. **Handles SPA routing** — Fallback to `index.html` for client-side routes

```javascript
// Express setup (pseudo-code)
app.use(express.static('dist'));  // Serve Vite build
app.use('/__openclaw__', proxyToGateway);  // Proxy to Gateway on port 18789
app.get('*', (req, res) => res.sendFile('dist/index.html'));  // SPA fallback
```

## WebSocket Connection

The dashboard connects to OpenClaw Gateway via WebSocket:

**URL:** `wss://<railway-url>/__openclaw__/ws`

**Protocol:** JSON-RPC 2.0 with event streaming

```javascript
{
  "id": 1,
  "method": "chat.send",
  "params": {
    "session": "main",
    "message": "Hello Bloomie"
  }
}
```

## Device Pairing & Auth

The dashboard implements OpenClaw's device pairing flow:

1. **Challenge:** Server sends nonce
2. **Sign:** Client signs with device key
3. **Token:** Server returns session token
4. **Connect:** Use token for authenticated WebSocket

Credentials stored locally at `~/.openclaw/agents/main/agent/auth-profiles.json` (server-side).

## Key Methods (JSON-RPC)

- `chat.send` — Send message, get streaming response
- `chat.history` — Fetch conversation history
- `sessions.list` — List active sessions
- `health` — Gateway health status
- `cron.list` — List scheduled jobs
- `browser.request` — Playwright screen capture (returns image data)

## Environment Variables

```bash
# Optional: Gateway URL (defaults to current origin)
VITE_GATEWAY_URL=wss://localhost:18789

# Optional: WebSocket timeout (ms)
VITE_WS_TIMEOUT=30000
```

## Project Structure

```
bloomie-vite/
├── src/
│   ├── App.jsx          # Main React component (1,524 lines)
│   └── main.jsx         # Entry point
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── package.json         # Dependencies
└── README.md            # This file
```

## Notes

- **No code changes:** The `App.jsx` component is used exactly as provided
- **Minified & optimized:** Production build is tree-shaken and minified
- **CSS-in-JS:** All styling is via inline React styles (no external CSS)
- **Self-contained:** Single-file component, no external dependencies except React

## License

Bloomie Dashboard — OpenClaw Control UI
