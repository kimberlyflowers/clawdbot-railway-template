---
name: desktop-control
description: Control user's desktop through BLOOM Desktop app - screen capture, clicks, typing, keyboard shortcuts
version: 1.0.0
author: BLOOM Ecosystem
---

# Desktop Control Skill

Allows Jaden to control connected desktop clients via BLOOM Desktop app.

## Functions

- use_desktop(task) - Start desktop session, returns connection code if not connected
- see_screen() - Take screenshot
- click(x, y) - Click at coordinates
- type(text) - Type text
- keys(combo) - Press key combination (cmd+c, etc)
- desktop_status() - Check connection status
- release_desktop() - End session, coral glow disappears

## Requirements

- User must have BLOOM Desktop app installed
- User must approve permission request
- Coral glow border shows when Jaden has control
