# OpenClaw Control UI — Layout Architecture

## Overview

The OpenClaw Control UI is a Lit-based SPA built with Vite, located at `/openclaw/ui/src/`.

## Layout: Three-Column Grid

The shell uses a CSS Grid with three columns:

```
┌─────────────────────────────────────────────────────┐
│                     Topbar                          │
├──────────┬────────────────────────┬─────────────────┤
│          │                        │  Screen Panel   │
│   Nav    │       Content          │  (persistent)   │
│  220px   │     (flex: 1fr)        │    ~420px       │
│          │                        │                 │
└──────────┴────────────────────────┴─────────────────┘
```

### Grid Definition

```css
.shell {
  grid-template-columns: var(--shell-nav-width) minmax(0, 1fr) var(--shell-screen-width, 420px);
  grid-template-areas:
    "topbar topbar topbar"
    "nav content screen";
}
```

### Key Modifiers

| Class | Effect |
|---|---|
| `.shell--nav-collapsed` | Nav column → 0px |
| `.shell--screen-collapsed` | Screen column → 0px |
| `.shell--chat-focus` | Nav hidden, screen stays |
| `.shell--onboarding` | Topbar hidden |

## Screen Panel

The screen panel (`<aside class="screen-panel">`) is a **persistent right-side panel** visible on every tab. It is NOT a separate tab.

### Structure
- **Toolbar**: Profile dropdown, Start/Stop buttons, status indicator
- **URL bar**: Navigate the browser
- **Viewport**: Auto-refreshing browser screenshot (click-through)
- **Actions**: Screenshot, auto-refresh toggle, snapshot
- **Snapshot area**: Collapsible accessibility snapshot at bottom

### Collapse/Expand
Toggle via the monitor icon button in the topbar. State persisted in `UiSettings.screenPanelCollapsed`.

### Mobile/Tablet
Screen panel is hidden on screens ≤ 1100px.

## Theme System

**Light is the default theme** (`:root` styles). Dark mode is activated via `:root[data-theme="dark"]`.

The JS always sets `document.documentElement.dataset.theme` to `"light"` or `"dark"`.

### Design Language
- **Light**: White (#FFFFFF) backgrounds, gray sidebar (#F7F7F8), subtle shadows
- **Dark**: True dark (#0F0F0F, #1A1A1A), clean borders (#333)
- **Typography**: Inter font, 24px titles, 14px body, 12px captions
- **Accent**: Orange (#EA580C) used sparingly for CTAs
- **No glows, no neon effects**

## Navigation

The "Screen" tab has been removed from `TAB_GROUPS` in `navigation.ts`. The screen functionality lives entirely in the persistent right panel.

### Tab Groups
1. **Chat**: `chat`
2. **Control**: `overview`, `channels`, `instances`, `sessions`, `usage`, `cron`
3. **Agent**: `agents`, `skills`, `nodes`
4. **Settings**: `config`, `debug`, `logs`

## Files Modified

| File | Changes |
|---|---|
| `styles/base.css` | Light-first theme, Inter font, refined dark mode |
| `styles/layout.css` | Three-column grid, screen panel area, clean topbar |
| `styles/layout.mobile.css` | Hide screen panel on mobile/tablet |
| `styles/components.css` | Subtle shadows, no glows, clean buttons |
| `styles/screen.css` | Panel-format styles for persistent screen |
| `ui/navigation.ts` | Removed "screen" from tab groups |
| `ui/app-render.ts` | Added screen panel aside, updated topbar |
| `ui/storage.ts` | Added `screenPanelCollapsed` to UiSettings |

## Build

```bash
cd /openclaw/ui && node_modules/.bin/vite build
```
