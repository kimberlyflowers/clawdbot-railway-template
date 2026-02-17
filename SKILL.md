---
name: desktop-control
description: Control customer's desktop computer through BLOOM Desktop app - click, type, take screenshots, and navigate applications with vision AI assistance.
metadata:
  openclaw:
    requires:
      env: []
      bins: []
    primaryEnv: null
    version: "1.0.0"
    author: "BLOOM Desktop Integration"
    tags: ["desktop", "automation", "vision", "ui", "control"]
---

# Desktop Control Skill

Control a customer's desktop computer through the BLOOM Desktop app with AI vision assistance.

## Overview

This skill enables you to:
- Request permission to control customer's desktop
- Take screenshots and analyze screen content
- Click on UI elements found through vision AI
- Type text into applications
- Press keyboard shortcuts
- Navigate desktop applications
- Scroll and interact with windows

## Prerequisites

- Customer must have BLOOM Desktop app installed and running
- Customer must provide connection code and grant permission
- Active WebSocket connection to desktop client

## Available Functions

### Desktop Connection Management

**`getDesktopStatus()`**
- Returns current desktop connection status
- Shows active sessions and permissions

**`requestDesktopPermission(reason)`**
- Request permission to control customer's desktop
- `reason`: Explanation of what you want to do (e.g., "Build your landing page in Canva")
- Returns permission status

### Vision and Screenshot Functions

**`takeScreenshot()`**
- Capture current desktop screenshot
- Returns base64 image data for analysis
- Use this before taking actions to see current state

**`analyzeScreen(prompt)`**
- Use Claude Vision to analyze current screenshot
- `prompt`: What to look for (e.g., "Find the login button")
- Returns analysis and UI element locations

**`findElement(description)`**
- Find UI element using vision AI
- `description`: What to find (e.g., "blue login button", "search box", "close icon")
- Returns coordinates if found

### Mouse Actions

**`click(x, y)`**
- Click at specific coordinates
- `x, y`: Pixel coordinates on screen

**`clickElement(description)`**
- Find and click on UI element using vision
- `description`: Element to click (e.g., "submit button", "file menu")

**`doubleClick(x, y)`**
- Double-click at coordinates

**`rightClick(x, y)`**
- Right-click to open context menu

**`drag(fromX, fromY, toX, toY)`**
- Drag from one location to another
- Useful for moving files, resizing windows, etc.

**`scroll(direction, amount)`**
- Scroll up/down on current window
- `direction`: "up" or "down"
- `amount`: Number of scroll steps (default 3)

### Keyboard Actions

**`type(text)`**
- Type text at current cursor position
- `text`: String to type

**`press(key)`**
- Press single key or key combination
- `key`: Examples: "enter", "tab", "ctrl+c", "cmd+v", "alt+f4"

**`pressKeys(keys)`**
- Press multiple keys in sequence
- `keys`: Array of keys to press

### Application Navigation

**`openApplication(appName)`**
- Attempt to open application by name
- `appName`: Application name (e.g., "Chrome", "Calculator")

**`switchWindow()`**
- Switch between open windows (Alt+Tab / Cmd+Tab)

**`minimizeWindow()`**
- Minimize current window

**`closeWindow()`**
- Close current window (Alt+F4 / Cmd+W)

## Example Usage

```javascript
// Check if desktop is connected
const status = await getDesktopStatus();
if (status.sessions.length === 0) {
  return "Please connect your BLOOM Desktop app first";
}

// Request permission
await requestDesktopPermission("I'll help you create a presentation in PowerPoint");

// Take screenshot to see current state
const screenshot = await takeScreenshot();

// Find and click PowerPoint in taskbar or start menu
await clickElement("PowerPoint icon");

// Wait a moment for app to open
await new Promise(resolve => setTimeout(resolve, 2000));

// Click on "New Presentation" button
await clickElement("New Presentation button");

// Type presentation title
await clickElement("Click to add title");
await type("My Amazing Presentation");

// Add content to first slide
await clickElement("Click to add content");
await type("Welcome to our product demo!");
```

## Error Handling

Always wrap desktop actions in try-catch blocks:

```javascript
try {
  await clickElement("login button");
} catch (error) {
  if (error.message.includes("permission")) {
    return "I need permission to control your desktop. Please grant access in the BLOOM Desktop app.";
  } else if (error.message.includes("not found")) {
    return "I couldn't find that element on your screen. Let me take a screenshot to see what's available.";
  } else {
    return `Desktop control error: ${error.message}`;
  }
}
```

## Best Practices

1. **Always explain what you're doing**: Tell the customer each step
2. **Take screenshots first**: See the current state before acting
3. **Use vision to find elements**: Don't guess coordinates
4. **Handle errors gracefully**: Provide helpful error messages
5. **Respect user control**: Stop if user revokes permission
6. **Be patient**: Add delays between actions for apps to respond

## Safety Notes

- Only perform actions the customer has explicitly requested
- Never access sensitive information without permission
- Stop immediately if the user presses the emergency stop shortcut
- Always confirm before making system-level changes
- Respect customer privacy and data

---

*This skill requires the BLOOM Desktop app to be installed and connected. The customer maintains full control and can stop the session at any time.*