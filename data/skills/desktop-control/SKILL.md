---
name: desktop-control
description: 🌸 BLOOM Desktop Control - User-friendly desktop automation. Just say "use my desktop" and Jaden handles everything automatically. Provides 1-click connection, auto-generated tokens, smart session management, and coral glow visual feedback. Simple functions for screenshot, click, type, keyboard shortcuts, and desktop control with automatic session detection.
---

# 🌸 BLOOM Desktop Control

**User-friendly desktop automation for Jaden**

## Simple Flow for Users

1. **User**: "Jaden, use my desktop"
2. **Jaden**: Auto-generates secure token & provides 1-click connection
3. **User**: Just clicks "Allow"
4. **Coral glow appears** - DONE! ✨

## Functions Available

### Main Entry Point
- `use_desktop(task)` - **MAIN FUNCTION** - User says "use my desktop" and Jaden handles everything

### Smart Controls (Auto-detect sessions)
- `see_screen()` - Take screenshot of user's desktop
- `click(x, y, button)` - Click at coordinates
- `type(text)` - Type text on desktop
- `keys(combination)` - Press keyboard shortcuts (cmd+c, enter, etc.)

### Management
- `desktop_status()` - Check connection status
- `release_desktop(message)` - End session, coral glow disappears

## Key Features

✅ **No manual tokens** - Auto-generated secure tokens
✅ **1-click connection** - Smart URLs and connection codes
✅ **Auto-detection** - Finds active sessions automatically
✅ **Coral glow feedback** - Visual indicator when Jaden has control
✅ **User-friendly errors** - Clear messages, no technical jargon
✅ **Smart session management** - Handles reconnections gracefully

## Visual Feedback

- **Coral/pink glow border** appears around user's entire screen when Jaden has control
- **Status indicator** shows "Jaden is controlling your desktop"
- **Automatic cleanup** - Glow disappears when session ends

## Security

- Secure token generation per user
- Auto-expiring tokens (1 hour)
- Session-based authentication
- Permission-based access control

## Usage Examples

```javascript
// Main entry point - handles everything
await use_desktop("help you with computer tasks");

// Simple controls (auto-detect session)
await see_screen();
await click(100, 200);
await type("Hello World");
await keys("cmd+c");

// Management
await desktop_status();
await release_desktop("Task completed");
```

**Perfect for regular users - just say "use my desktop" and it works!** 🚀