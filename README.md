# Bloomie Dashboard v11 + OpenClaw Integration

**Production-ready React dashboard for OpenClaw agent control, packaged for integration into existing Railway services.**

## 📦 What You Have

```
workspace/
├── bloomie-vite/                    # ← Dashboard package (copy to b301)
│   ├── src/
│   │   ├── App.jsx                  # 1,524-line React component (unchanged)
│   │   └── main.jsx                 # React entry point
│   ├── index.html                   # HTML template
│   ├── vite.config.js               # Vite build config
│   ├── package.json                 # Vite + React deps
│   ├── MERGE_INTO_EXISTING.md       # ⭐ READ FIRST
│   ├── INTEGRATION.md               # Detailed reference
│   ├── server.js.example            # Drop-in Express server
│   └── package.json.example         # Root pkg.json reference
│
├── INTEGRATION_SUMMARY.md           # Quick 3-step guide
├── AGENTS.md                        # Agent config
├── SOUL.md                          # Agent personality
├── USER.md                          # User context
├── TOOLS.md                         # Tool references
└── ... (other workspace files)
```

---

## 🚀 Quick Integration (3 Steps)

### 1. Copy Dashboard to Your b301 Repo

```bash
cp -r bloomie-vite/ /path/to/b301-repo/
```

### 2. Update Server + Dependencies

In b301 repo:

```javascript
// server.js
const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

app.use(express.static(path.join(__dirname, 'bloomie-vite', 'dist')));

app.use('/__openclaw__', createProxyMiddleware({
  target: 'http://127.0.0.1:18789',
  changeOrigin: true,
  pathRewrite: { '^/__openclaw__': '' },
  ws: true
}));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'bloomie-vite', 'dist', 'index.html'));
});
```

Root `package.json`:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "http-proxy-middleware": "^2.0.6",
    "ws": "^8.14.2"
  },
  "scripts": {
    "build": "cd bloomie-vite && npm install && npm run build",
    "start": "node server.js"
  }
}
```

### 3. Deploy to b301

```bash
git add bloomie-vite/ server.js package.json
git commit -m "Integrate Bloomie Dashboard v11"
git push origin master
```

Railway auto-deploys. ✅

---

## 📋 Architecture

```
Browser
  ↓
Express Server (port 8080, in b301 container)
  ├─ Serves: bloomie-vite/dist/ (Vite-built React app)
  ├─ Proxies: /__openclaw__/* → localhost:18789 (OpenClaw Gateway)
  └─ SPA: * → index.html (client-side routing)
  ↓
React Dashboard (App.jsx)
  ├─ WebSocket: /__openclaw__/ws → Gateway
  ├─ JSON-RPC: Send commands to agents
  └─ Device Pairing: Authenticate with gateway
```

---

## 🔑 Key Features

✅ **1,524-line React component** — Exact, no modifications
✅ **Vite build** — Optimized, tree-shaken, minified
✅ **Express proxy** — WebSocket + HTTP proxying to Gateway
✅ **SPA routing** — Client-side navigation
✅ **Device pairing** — OpenClaw auth flow built-in
✅ **Self-contained** — CSS-in-JS, no external stylesheets
✅ **Single file** — Copy one folder, integrate everything

---

## 📖 Documentation

| File | Purpose |
|------|---------|
| **INTEGRATION_SUMMARY.md** | Quick overview + 3-step guide |
| **bloomie-vite/MERGE_INTO_EXISTING.md** | Detailed step-by-step instructions |
| **bloomie-vite/INTEGRATION.md** | Architecture, troubleshooting, reference |
| **bloomie-vite/server.js.example** | Ready-to-use Express server |
| **bloomie-vite/package.json.example** | Root package.json template |

---

## 🏗️ Build Process

**On Railway (b301 deploy):**

```
1. Checkout repo with bloomie-vite/ folder
2. npm install (root dependencies)
3. npm run build
   └─ cd bloomie-vite && npm install && npm run build
      └─ Outputs: bloomie-vite/dist/index.html, app-[hash].js, chunks, etc.
4. npm start
   └─ node server.js (Express starts, serves dashboard)
```

---

## 🧪 Test Locally

```bash
# Build dashboard
npm run build

# Start server
npm start

# Visit http://localhost:8080
```

Expected:
- ✅ Bloomie welcome screen loads
- ✅ DevTools → Network: `index.html`, `app-*.js` load
- ✅ DevTools → Console: WebSocket connects to `/__openclaw__/ws`
- ✅ Send a message: JSON-RPC request to Gateway

---

## 🔗 Gateway Connection

The dashboard connects to OpenClaw Gateway via:

```javascript
// Inside browser, from dashboard component
new WebSocket('wss://localhost:8080/__openclaw__/ws')
  ↓ (Express proxies to)
  ↓
// Inside container, on localhost
ws://127.0.0.1:18789/ws (OpenClaw Gateway)
```

Requests use JSON-RPC 2.0 protocol:

```json
{
  "id": 1,
  "method": "chat.send",
  "params": {
    "session": "main",
    "message": "Hello Bloomie"
  }
}
```

---

## 📱 What the Dashboard Does

- **Chat** — Send messages to OpenClaw agents, stream responses
- **Status** — View project progress, autopilot jobs, completed tasks
- **Files** — Browse deliverables, open artifacts for review
- **Device Pairing** — Authenticate with gateway
- **Settings** — Configure agents, API keys, channels, billing
- **Live Browser** — See agent's screen while they work
- **Approval UI** — Review and rate completed work

---

## 🛠️ Integration Checklist

- [ ] Copy `bloomie-vite/` to b301 repo
- [ ] Update `server.js` (or copy `server.js.example`)
- [ ] Update `package.json` with Express + proxy deps
- [ ] Run `npm run build` locally to verify
- [ ] Commit and push to b301
- [ ] Railway deploys automatically
- [ ] Visit dashboard at b301 URL
- [ ] Verify WebSocket connects to Gateway
- [ ] Send test message to agent

---

## 📝 Commits in This Workspace

```
9c8c2b2 Add integration guides for b301 merge (no standalone server)
5fb4cda Initial: Bloomie Dashboard v11 with Vite build for Railway deployment
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Run `npm run build` locally to debug |
| Dashboard loads but Gateway unavailable | Check OpenClaw is running on localhost:18789 |
| WebSocket fails | Ensure `ws: true` in proxy config |
| SPA routing broken | Check `app.get('*', ...)` fallback in server |
| 404 on /app-*.js | Verify `bloomie-vite/dist/` exists after build |

---

## 🎯 Next Steps

1. **Read:** `INTEGRATION_SUMMARY.md`
2. **Read:** `bloomie-vite/MERGE_INTO_EXISTING.md`
3. **Copy:** `bloomie-vite/` folder into b301 repo
4. **Update:** `server.js` and `package.json`
5. **Test:** `npm run build && npm start`
6. **Deploy:** `git push origin master`

---

## 📄 License

Bloomie Dashboard v11 — OpenClaw Control UI
