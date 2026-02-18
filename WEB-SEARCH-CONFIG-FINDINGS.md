# OpenClaw Web Search Configuration — Findings

**Date:** 2026-02-16  
**Issue:** Brave API key configuration — failed crash approach, correct approach found  
**Status:** RESOLVED

---

## What I Did Wrong

I attempted to add Brave API key to `openclaw.json` under a new section:

```json
{
  "web": {
    "braveApiKey": "BSAbmeo3VKaDA5gbBZkbjSkcnL4QN2M"
  }
}
```

**Result:** Gateway crashed into infinite restart loop for 15 minutes. "braveApiKey" is NOT a valid OpenClaw config key.

---

## What OpenClaw Actually Expects

### Option 1: Environment Variable (CORRECT + SIMPLEST)

Set `BRAVE_API_KEY` as a Railway environment variable. The Gateway automatically reads it:

```bash
export BRAVE_API_KEY="BSAbmeo3VKaDA5gbBZkbjSkcnL4QN2M"
```

Or in `.env`:
```
BRAVE_API_KEY=BSAbmeo3VKaDA5gbBZkbjSkcnL4QN2M
```

**Status:** ✅ Already working (set as Railway env var during gateway restart)

### Option 2: openclaw.json Configuration (if you must use config file)

The ONLY valid config path is `tools.web.search.apiKey` (not `web.braveApiKey`):

```json
{
  "tools": {
    "web": {
      "search": {
        "provider": "brave",
        "apiKey": "BSAbmeo3VKaDA5gbBZkbjSkcnL4QN2M"
      }
    }
  }
}
```

**Important:** This is NOT recommended. Environment variables are safer.

---

## Correct Web Search Config Structure

According to OpenClaw docs, the proper config is:

```json
{
  "tools": {
    "web": {
      "search": {
        "enabled": true,
        "provider": "brave",
        // Config file path (NOT RECOMMENDED):
        "apiKey": "BSAbmeo3VKaDA5gbBZkbjSkcnL4QN2M"
        // OR via environment: BRAVE_API_KEY (RECOMMENDED)
      }
    }
  }
}
```

---

## What Works (Verified)

✅ **Environment variable:** `BRAVE_API_KEY` in Railway env → web_search works  
✅ **Config file path:** `tools.web.search.apiKey` if you edit openclaw.json  
❌ **What doesn't work:** Inventing new keys like `web.braveApiKey`

---

## Current Status

- ✅ BRAVE_API_KEY set as Railway environment variable
- ✅ openclaw.json is clean (no invalid sections)
- ✅ Gateway running stably
- ✅ web_search tool ready to use

---

## How to Use web_search Now

```javascript
const result = await web_search({
  query: "OpenClaw documentation",
  count: 5
});

// Returns: [{ title, url, snippet }, ...]
```

The tool automatically reads `BRAVE_API_KEY` from environment.

---

## Prevention for Future

**Never modify openclaw.json without:**
1. Checking valid keys in `/openclaw/docs/` or OpenClaw source
2. Testing the change in isolation first
3. Having a backup/rollback plan ready

**Prefer environment variables for:**
- API keys
- Secrets
- Configuration that changes per deployment
- Any value that shouldn't be in git

---

## Key Lesson

**The crash happened because:**
1. I invented a config key instead of checking docs
2. OpenClaw's config validation failed hard (good security, bad UX)
3. Invalid config → gateway restart loop → downtime

**The fix:**
- Use documented config paths
- Prefer environment variables for secrets
- Always validate before editing system config

---

**Sources:**
- https://docs.openclaw.ai/tools/web
- OpenClaw gateway logs
- Live testing

**Updated:** 2026-02-16 09:10 UTC
