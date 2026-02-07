# Bloomie Dashboard v11 → Integrate into b301

**Ready to merge into your existing OpenClaw service on Railway.**

---

## What You Have

```
bloomie-vite/
├── src/App.jsx              # 1,524-line dashboard component (unchanged)
├── vite.config.js           # Vite build config → dist/
├── index.html               # React HTML template
├── package.json             # Vite + React deps (self-contained)
├── MERGE_INTO_EXISTING.md   # Step-by-step integration guide
├── INTEGRATION.md           # Detailed reference
├── server.js.example        # Drop-in Express server
├── package.json.example     # Root package.json reference
└── .npmrc                   # npm config (legacy peer deps)
```

---

## 3-Step Integration

### Step 1: Copy Folder into b301 Repo

```bash
cp -r /data/workspace/bloomie-vite/ /your/b301/repo/
```

### Step 2: Update Server

Copy `bloomie-vite/server.js.example` → your `server.js`:

```bash
cp bloomie-vite/server.js.example server.js
```

Or merge into your existing server:

```javascript
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

### Step 3: Update `package.json`

Add to root dependencies:

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

---

## Deploy

```bash
git add bloomie-vite/ server.js package.json
git commit -m "Integrate Bloomie Dashboard v11"
git push origin master
```

Railway auto-deploys to b301. ✅

---

## What Happens

**On deploy:**
1. `npm install` → installs Express deps
2. `npm run build` → Vite builds dashboard → `bloomie-vite/dist/`
3. `npm start` → Express serves dashboard + proxies Gateway

**At runtime:**
```
Browser → Express (port 8080)
  ├─ GET / → bloomie-vite/dist/index.html
  ├─ GET /app-*.js → bloomie-vite/dist/app-*.js
  ├─ WebSocket /__openclaw__/ws → PROXY → localhost:18789/ws
  └─ API calls → PROXY → localhost:18789
```

---

## Files in This Package

| File | Purpose |
|------|---------|
| `src/App.jsx` | Dashboard component (exact, unchanged) |
| `vite.config.js` | Vite build config |
| `index.html` | React entry template |
| `package.json` | Vite + React deps |
| `MERGE_INTO_EXISTING.md` | **→ READ THIS FIRST** |
| `INTEGRATION.md` | Detailed reference |
| `server.js.example` | Copy to your `server.js` |
| `package.json.example` | Reference for root `package.json` |
| `.npmrc` | npm config |

---

## Next Steps

1. **Read:** `bloomie-vite/MERGE_INTO_EXISTING.md`
2. **Copy:** `bloomie-vite/` folder into b301 repo
3. **Update:** `server.js` and `package.json`
4. **Test locally:** `npm run build && npm start`
5. **Deploy:** `git push origin master`

---

## Support

- **Questions?** See `bloomie-vite/INTEGRATION.md` (detailed guide)
- **Build issues?** Run `npm run build` locally to debug
- **Gateway proxy issues?** Check `localhost:18789` is reachable

All files are ready to merge. Good luck! 🚀
