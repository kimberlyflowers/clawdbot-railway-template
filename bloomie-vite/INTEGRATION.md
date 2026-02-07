# Bloomie Dashboard v11 — Integration Guide

**For merging into existing OpenClaw Railway service (b301)**

## Integration Steps

### 1. Copy `bloomie-vite/` into Your Repo

```bash
cp -r bloomie-vite/ /path/to/your/existing/repo/
```

### 2. Update Your Root `package.json`

Add the Vite build as a build step:

```json
{
  "scripts": {
    "build": "cd bloomie-vite && npm install && npm run build",
    "start": "node server.js"
  }
}
```

If you already have build steps, merge them:

```json
"build": "npm run build:dashboard && <your-other-builds>",
"build:dashboard": "cd bloomie-vite && npm install && npm run build"
```

### 3. Update Your Express Server

Serve the Vite build as the static root, with OpenClaw Gateway proxied at `/__openclaw__/*`.

**Example (minimal):**

```javascript
const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Serve Vite-built dashboard at root
app.use(express.static(path.join(__dirname, 'bloomie-vite', 'dist')));

// Proxy OpenClaw Gateway (on localhost:18789)
app.use('/__openclaw__', createProxyMiddleware({
  target: 'http://127.0.0.1:18789',
  changeOrigin: true,
  pathRewrite: { '^/__openclaw__': '' },
  ws: true  // Enable WebSocket proxying
}));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'bloomie-vite', 'dist', 'index.html'));
});

app.listen(process.env.PORT || 8080, () => {
  console.log('Dashboard ready at http://localhost:8080');
});
```

### 4. Ensure Dependencies

Your root `package.json` needs:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "http-proxy-middleware": "^2.0.6",
    "ws": "^8.14.2"
  }
}
```

### 5. Update `Procfile` (if you use one)

```
web: npm run build && npm start
```

Or, if Railway builds for you:

```
web: node server.js
```

### 6. Commit

```bash
git add bloomie-vite/
git commit -m "Add Bloomie Dashboard v11 — Vite build for web UI"
git push origin master
```

Railway will auto-deploy.

---

## Directory Structure (After Integration)

```
your-existing-repo/
├── server.js                    # Your Express server
├── package.json                 # Updated with dashboard build step
├── Procfile                     # Updated to build dashboard
│
├── bloomie-vite/                # Merged from this repo
│   ├── package.json             # Vite + React deps
│   ├── vite.config.js           # Vite build config
│   ├── index.html               # HTML template
│   ├── src/
│   │   ├── App.jsx              # Dashboard component
│   │   └── main.jsx             # React entry
│   └── dist/                    # Built on deploy (gitignored)
│       ├── index.html
│       ├── app-[hash].js
│       └── chunk-[hash].js
│
└── ... (your other files)
```

---

## Build Flow on Railway (b301)

When you push:

1. **Install Phase**
   ```
   npm install
   ```
   Installs root deps (Express, proxy, WebSocket)

2. **Build Phase** (if using `Procfile` with build)
   ```
   npm run build
   ```
   Runs Vite build in `bloomie-vite/` → outputs to `bloomie-vite/dist/`

3. **Start Phase**
   ```
   node server.js
   ```
   Express starts, serves dashboard from `bloomie-vite/dist/`

---

## How It Works at Runtime

```
Browser Request
       ↓
Express Server (port 8080)
├─ GET / → bloomie-vite/dist/index.html
├─ GET /app-abc.js → bloomie-vite/dist/app-abc.js
├─ GET /__openclaw__/ws → PROXY → localhost:18789/ws
├─ POST /__openclaw__/api → PROXY → localhost:18789/api
└─ GET * → fallback to index.html (SPA routing)
       ↓
React Dashboard
├─ Connects to localhost:18789 via /__openclaw__/ws
├─ Sends JSON-RPC requests
└─ Receives streaming responses
```

---

## Verification

After deploying, test:

```bash
# Dashboard loads
curl https://b301.railway.app/ | head -20

# WebSocket proxy works
curl -i -N -H "Upgrade: websocket" \
  -H "Connection: Upgrade" \
  -H "Sec-WebSocket-Key: xyz" \
  -H "Sec-WebSocket-Version: 13" \
  https://b301.railway.app/__openclaw__/ws
```

---

## Rollback (if needed)

```bash
git reset --hard HEAD~1
git push origin master --force
```

Railway will immediately re-deploy the previous version.

---

## Support

If issues arise:

1. **Dashboard loads but Gateway is unreachable:**
   - Check OpenClaw Gateway is running: `openclaw gateway status`
   - Check proxy config has correct port (18789)

2. **Build fails:**
   - Check `bloomie-vite/package.json` is valid
   - Run locally: `cd bloomie-vite && npm install && npm run build`

3. **SPA routing broken:**
   - Ensure `app.get('*', ...)` fallback is after static middleware

4. **WebSocket connection fails:**
   - Ensure `ws: true` is set in proxy config
   - Check Railway logs: `railway logs`
