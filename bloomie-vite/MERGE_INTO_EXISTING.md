# Merge into b301 — Quick Start

**Copy-paste this into your existing service.**

## Step 1: Copy the Dashboard Folder

```bash
cp -r bloomie-vite/ /path/to/b301-repo/
```

This adds `bloomie-vite/` with:
- `package.json` (Vite + React deps, self-contained)
- `vite.config.js` (outputs to `dist/`)
- `src/App.jsx` (1,524-line dashboard component)

## Step 2: Update Your `server.js`

Replace your Express server setup with this (or merge if you have custom logic):

```javascript
const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8080;

// ════════════════════════════════════════════════════════════
// Serve Bloomie Dashboard (built by Vite)
// ════════════════════════════════════════════════════════════
const dashboardPath = path.join(__dirname, 'bloomie-vite', 'dist');
app.use(express.static(dashboardPath));

// ════════════════════════════════════════════════════════════
// Proxy OpenClaw Gateway (localhost:18789)
// ════════════════════════════════════════════════════════════
app.use('/__openclaw__', createProxyMiddleware({
  target: 'http://127.0.0.1:18789',
  changeOrigin: true,
  pathRewrite: {
    '^/__openclaw__': ''
  },
  ws: true,  // Critical: enable WebSocket proxying
  onProxyReq: (proxyReq, req, res) => {
    // Optional: log requests
    if (req.url !== '/__openclaw__/ws') {
      console.log(`[Dashboard Proxy] ${req.method} ${req.url}`);
    }
  },
  onError: (err, req, res) => {
    console.error(`[Dashboard Proxy Error] ${err.message}`);
    res.status(503).json({ error: 'Gateway unavailable', details: err.message });
  }
}));

// ════════════════════════════════════════════════════════════
// SPA Fallback (client-side routing)
// ════════════════════════════════════════════════════════════
app.get('*', (req, res) => {
  res.sendFile(path.join(dashboardPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).json({ error: 'Dashboard index not found' });
    }
  });
});

// ════════════════════════════════════════════════════════════
// Start Server
// ════════════════════════════════════════════════════════════
app.listen(PORT, () => {
  console.log(`\n[Dashboard] ✅ Running on port ${PORT}`);
  console.log(`[Dashboard] 🌐 URL: http://localhost:${PORT}`);
  console.log(`[Dashboard] 🔗 Gateway proxy: http://localhost:${PORT}/__openclaw__/*\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n[Dashboard] Shutting down gracefully...');
  process.exit(0);
});
```

## Step 3: Update Your Root `package.json`

Add dependencies (if missing):

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

If you already have `build` scripts, merge:

```json
{
  "scripts": {
    "build": "npm run build:dashboard && <your-other-builds>",
    "build:dashboard": "cd bloomie-vite && npm install && npm run build",
    "start": "node server.js"
  }
}
```

## Step 4: Update `Procfile` (if you use one)

```
web: npm run build && npm start
```

Or if Railway handles builds automatically:

```
web: node server.js
```

## Step 5: Commit & Push

```bash
git add bloomie-vite/ server.js package.json
git commit -m "Integrate Bloomie Dashboard v11"
git push origin master
```

Railway auto-deploys. ✅

---

## What Happens on Deploy

1. **Checkout:** Git pulls your repo with `bloomie-vite/` folder
2. **Install:** `npm install` installs root deps
3. **Build:** `npm run build` executes:
   ```bash
   cd bloomie-vite && npm install && npm run build
   ```
   Produces: `bloomie-vite/dist/index.html`, `app-[hash].js`, etc.
4. **Start:** `npm start` runs `node server.js`
5. **Express** serves:
   - `/` → `bloomie-vite/dist/index.html`
   - `/app-*.js` → `bloomie-vite/dist/app-*.js`
   - `/__openclaw__/ws` → proxies to localhost:18789/ws

---

## Verify It Works

Once deployed:

```bash
# Visit your b301 dashboard
https://b301.railway.app/

# Should see Bloomie welcome screen
```

Open browser DevTools → Network tab:
- ✅ `index.html` loads from Express
- ✅ `app-[hash].js` loads (Vite bundle)
- ✅ WebSocket connects to `/__openclaw__/ws`

Send a message:
- ✅ JSON-RPC request goes to Gateway
- ✅ Response streams back

---

## Troubleshooting

**Q: "Cannot find module 'express'"**
- Run: `npm install`

**Q: "dist/ folder is empty"**
- Run: `npm run build` manually
- Check `bloomie-vite/package.json` exists
- Check `bloomie-vite/vite.config.js` exists

**Q: "Gateway unavailable"**
- Check OpenClaw is running: `openclaw gateway status`
- Check port is 18789: `lsof -i :18789`
- Check Express console for proxy errors

**Q: "WebSocket connection failed"**
- Ensure `ws: true` is set in proxy config
- Check firewall allows localhost:18789
- Check Railway logs: `railway logs`

---

## File Locations

```
your-b301-repo/
├── server.js                    # ← Updated
├── package.json                 # ← Updated
├── Procfile                     # ← Updated
└── bloomie-vite/                # ← NEW (copy entire folder)
    ├── package.json
    ├── vite.config.js
    ├── src/App.jsx
    ├── index.html
    └── dist/                    # Generated on build
```

---

That's it! 🚀 Commit and push to b301.
