# Phase 1: System Audit Report
**Date:** 2026-02-12 23:02 UTC  
**Task:** Understand OpenClaw Control UI CSS architecture & persistence mechanism

---

## 1. CSS CUSTOM PROPERTIES (--variable-name)

**Total: 87 unique custom properties** (across all stylesheets)

### COMPLETE LIST (Alphabetical)

1. `--accent`
2. `--accent-2`
3. `--accent-2-muted`
4. `--accent-2-subtle`
5. `--accent-foreground`
6. `--accent-glow`
7. `--accent-hover`
8. `--accent-muted`
9. `--accent-subtle`
10. `--bg`
11. `--bg-accent`
12. `--bg-content`
13. `--bg-elevated`
14. `--bg-hover`
15. `--bg-muted`
16. `--border`
17. `--border-hover`
18. `--border-strong`
19. `--card`
20. `--card-foreground`
21. `--card-highlight`
22. `--chat-text`
23. `--chrome`
24. `--chrome-strong`
25. `--danger`
26. `--danger-muted`
27. `--danger-subtle`
28. `--destructive`
29. `--destructive-foreground`
30. `--duration-fast`
31. `--duration-normal`
32. `--duration-slow`
33. `--ease-in-out`
34. `--ease-out`
35. `--ease-spring`
36. `--focus`
37. `--focus-glow`
38. `--focus-ring`
39. `--font-body`
40. `--font-display`
41. `--grid-line`
42. `--info`
43. `--input`
44. `--mono`
45. `--muted`
46. `--muted-foreground`
47. `--muted-strong`
48. `--ok`
49. `--ok-muted`
50. `--ok-subtle`
51. `--panel`
52. `--panel-hover`
53. `--panel-strong`
54. `--popover`
55. `--popover-foreground`
56. `--primary`
57. `--primary-foreground`
58. `--radius`
59. `--radius-full`
60. `--radius-lg`
61. `--radius-md`
62. `--radius-sm`
63. `--radius-xl`
64. `--ring`
65. `--secondary`
66. `--secondary-foreground`
67. `--shadow-glow`
68. `--shadow-lg`
69. `--shadow-md`
70. `--shadow-sm`
71. `--shadow-xl`
72. `--shell-focus-duration`
73. `--shell-focus-ease`
74. `--shell-gap`
75. `--shell-nav-width`
76. `--shell-pad`
77. `--shell-topbar-height`
78. `--text`
79. `--text-strong`
80. `--theme-gap`
81. `--theme-item`
82. `--theme-pad`
83. `--theme-switch-x`
84. `--theme-switch-y`
85. `--warn`
86. `--warn-muted`
87. `--warn-subtle`

### Grouped by Category

**Colors (Background & Surface):** `--bg`, `--bg-accent`, `--bg-content`, `--bg-elevated`, `--bg-hover`, `--bg-muted`

**Colors (Cards & Panels):** `--card`, `--card-foreground`, `--card-highlight`, `--panel`, `--panel-strong`, `--panel-hover`, `--chrome`, `--chrome-strong`

**Colors (Text):** `--text`, `--text-strong`, `--chat-text`, `--muted`, `--muted-strong`, `--muted-foreground`

**Colors (Borders & Input):** `--border`, `--border-strong`, `--border-hover`, `--input`, `--ring`

**Colors (Accent/Brand):** `--accent`, `--accent-hover`, `--accent-muted`, `--accent-subtle`, `--accent-foreground`, `--accent-glow`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`

**Colors (Accent 2 - Teal):** `--accent-2`, `--accent-2-muted`, `--accent-2-subtle`

**Colors (Semantic):** `--ok`, `--ok-muted`, `--ok-subtle`, `--warn`, `--warn-muted`, `--warn-subtle`, `--danger`, `--danger-muted`, `--danger-subtle`, `--destructive`, `--destructive-foreground`, `--info`

**Colors (Focus & Popover):** `--focus`, `--focus-ring`, `--focus-glow`, `--popover`, `--popover-foreground`

**Typography:** `--font-body`, `--font-display`, `--mono`

**Spacing & Layout:** `--shell-nav-width`, `--shell-topbar-height`, `--shell-pad`, `--shell-gap`, `--shell-focus-duration`, `--shell-focus-ease`

**Borders & Radii:** `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-full`, `--radius`

**Shadows:** `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`, `--shadow-glow`

**Animations & Timing:** `--ease-out`, `--ease-in-out`, `--ease-spring`, `--duration-fast`, `--duration-normal`, `--duration-slow`

**Theme & Misc:** `--theme-item`, `--theme-gap`, `--theme-pad`, `--theme-switch-x`, `--theme-switch-y`, `--grid-line`

---

## 2. THEME TOGGLE MECHANISM

**System: `data-theme` attribute on `<html>` element**

### How it Works
1. **Theme values**: `"dark"` (default) or `"light"`
2. **Applied to**: `:root[data-theme="light"]` CSS rule
3. **JavaScript setter**: `/openclaw/ui/src/ui/app-settings.ts:275`
   ```typescript
   root.dataset.theme = resolved;
   ```
4. **View Transition**: Uses CSS View Transitions API with circular reveal animation
   - Source: `/openclaw/ui/src/ui/theme-transition.ts`
   - Animates from user's click point via `--theme-switch-x` and `--theme-switch-y`
   - Fallback for older browsers without View Transitions

### CSS Implementation
- **Dark theme (default)**: `:root { ... }` with dark colors
- **Light theme override**: `:root[data-theme="light"] { ... }` with light colors
- All 67 CSS variables are redefined for light mode
- Smooth transition using `@keyframes theme-circle-transition`

---

## 3. CURRENT /data/start.sh

```bash
#!/bin/bash

echo "[start.sh] Restoring original OpenClaw Control UI..."

# Restore original Control UI from backup if it exists
if [ -d "/openclaw/dist/control-ui.backup" ]; then
    rm -rf /openclaw/dist/control-ui
    cp -r /openclaw/dist/control-ui.backup /openclaw/dist/control-ui
    echo "[start.sh] Original Control UI restored from backup"
else
    echo "[start.sh] No backup found, keeping current Control UI"
fi

echo "[start.sh] Starting OpenClaw wrapper..."

# Start the wrapper normally
exec node /app/src/server.js
```

**Status:** Already set up to restore from backup (but NO backup currently exists)

---

## 4. CONTROL UI REBUILD TIMING

**The UI is REBUILT from source on every restart**

### Build Process
1. **Source**: `/openclaw/ui/src/` (Lit TypeScript components + Vite build)
2. **Build command**: `vite build` (defined in `/openclaw/ui/package.json`)
3. **Output**: Pre-built to `/openclaw/dist/control-ui/` before Gateway starts
4. **Trigger**: `ensureControlUiAssetsBuilt()` called in Gateway startup sequence
   - Source: `/openclaw/src/gateway/server.impl.ts:289`
   - Called as part of Gateway initialization

### What Gets Built
- **HTML**: `/openclaw/dist/control-ui/index.html` (single entry point, loads assets)
- **JS Bundle**: `/openclaw/dist/control-ui/assets/index-[HASH].js` (Lit app compiled)
- **CSS Bundle**: `/openclaw/dist/control-ui/assets/index-[HASH].css` (all styles)
- **Assets**: `/openclaw/dist/control-ui/assets/` (fonts, icons, etc.)
- **Icons**: favicon.svg, favicon-32.png, apple-touch-icon.png

### Implication
✅ **CSS modifications WILL BE WIPED on restart** → need persistence mechanism

---

## 5. "OpenClaw" BRAND NAME IN TS FILES (85 occurrences)

**Key Files:**

### Core App Class (`OpenClawApp`)
- `/openclaw/ui/src/ui/app.ts:106` — Main Lit class definition
- `/openclaw/ui/src/ui/app-channels.ts:1` — Imported throughout
- `/openclaw/ui/src/ui/app-gateway.ts` — Gateway event handling (22 uses)
- `/openclaw/ui/src/ui/app-settings.ts` — Settings management (25 uses)
- `/openclaw/ui/src/ui/app-chat.ts` — Chat functions (5 uses)
- `/openclaw/ui/src/ui/app-render.ts` — Rendering helpers
- `/openclaw/ui/src/ui/app-polling.ts` — Polling handlers (3 uses)

### Tests
- `/openclaw/ui/src/ui/chat-markdown.browser.test.ts:2` — `OpenClawApp.prototype.connect`
- `/openclaw/ui/src/ui/navigation.browser.test.ts` — App setup
- `/openclaw/ui/src/ui/focus-mode.browser.test.ts` — Focus mode tests

### Branding
- `/openclaw/ui/src/ui/app-render.ts:137` — HTML alt text: `<img alt="OpenClaw" />`
- `/openclaw/ui/src/ui/views/chat.test.ts:39` — Test fixture: `assistantName: "OpenClaw"`

### Function Signatures
All loader functions accept `host: OpenClawApp` parameter:
- `loadAssistantIdentity()`, `loadAgents()`, `loadNodes()`, `loadSessions()`, etc.
- Type casting throughout: `(host as unknown as OpenClawApp)`

**Pattern**: `OpenClawApp` is the **main class name** for the web component; not easily "rebranded" without refactoring the entire class name in TS codebase.

---

## KEY FINDINGS FOR BLOOMIE RESKIN

| Item | Current State | Impact |
|------|---------------|--------|
| **CSS vars** | 67 properties defined, fully themeable | ✅ Can override all colors via custom properties |
| **Theme system** | `data-theme` attribute on `<html>` | ✅ Can inject custom theme toggle |
| **UI rebuild** | Every restart via `vite build` | ❌ Custom CSS will be wiped |
| **start.sh** | Backup restore logic exists | ⚠️ Backup doesn't exist yet; need to create one |
| **Brand name** | "OpenClaw" is class name throughout | ⚠️ Visual rebranding only; leave TS unchanged |

---

## NEXT PHASE 2 TASKS

1. **Create backup of original UI** → `/openclaw/dist/control-ui.backup/`
2. **Build Bloomie CSS override file** → `/data/workspace/bloomie-overrides.css` (replaces CSS vars)
3. **Update start.sh** → Copy overrides AFTER backup restore
4. **Persist Lit template changes** (if needed for layout tweaks)
5. **Test persistence** → Verify CSS survives Gateway restart

