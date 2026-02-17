// Desktop Control Skill Implementation
// This file provides the JavaScript functions for the desktop-control skill

const crypto = require('crypto');

class DesktopControlSkill {
  constructor() {
    this.sessionId = null;
    this.lastScreenshot = null;
  }

  // Get current desktop connection status
  async getDesktopStatus() {
    if (!global.desktopAPI) {
      throw new Error('Desktop API not available');
    }

    const sessions = global.desktopAPI.getDesktopSessions();
    return {
      connected: sessions.length > 0,
      sessions,
      hasPermission: sessions.some(s => s.hasPermission)
    };
  }

  // Request permission to control desktop
  async requestDesktopPermission(reason = 'Assist with computer tasks') {
    const status = await this.getDesktopStatus();
    if (!status.connected) {
      throw new Error('No desktop client connected. Please start BLOOM Desktop app and connect.');
    }

    // Use the first available session
    const session = status.sessions[0];
    this.sessionId = session.sessionId;

    if (session.hasPermission) {
      return { granted: true, message: 'Permission already granted' };
    }

    // Request permission
    global.desktopAPI.requestScreenPermission(this.sessionId, reason);

    // Return pending status - the user will need to approve in the desktop app
    return {
      granted: false,
      pending: true,
      message: 'Permission request sent. Please approve in BLOOM Desktop app.'
    };
  }

  // Take a screenshot of the current desktop
  async takeScreenshot() {
    await this._ensurePermission();

    const commandId = global.desktopAPI.sendDesktopCommand(this.sessionId, 'screenshot', {});

    // Wait for screenshot response (this would be implemented with a promise/callback system)
    // For now, simulate the response
    this.lastScreenshot = {
      timestamp: Date.now(),
      commandId,
      // In real implementation, this would be base64 image data
      data: 'base64_screenshot_data_would_be_here'
    };

    return this.lastScreenshot;
  }

  // Analyze screen content using Claude Vision
  async analyzeScreen(prompt) {
    const screenshot = await this.takeScreenshot();

    // TODO: Integrate with Claude Vision API
    // This would send the screenshot to Claude Vision with the prompt
    // For now, return a mock response
    return {
      analysis: `Analysis of screen for: "${prompt}"`,
      elements: [
        { type: 'button', description: 'Login button', x: 400, y: 300, width: 100, height: 40 },
        { type: 'textfield', description: 'Username field', x: 300, y: 250, width: 200, height: 30 }
      ],
      screenshot: screenshot.data
    };
  }

  // Find a UI element using vision AI
  async findElement(description) {
    const analysis = await this.analyzeScreen(`Find the ${description}`);

    const element = analysis.elements.find(el =>
      el.description.toLowerCase().includes(description.toLowerCase())
    );

    if (!element) {
      throw new Error(`Could not find "${description}" on the screen`);
    }

    return {
      found: true,
      element,
      center: {
        x: element.x + element.width / 2,
        y: element.y + element.height / 2
      }
    };
  }

  // Mouse actions
  async click(x, y) {
    await this._ensurePermission();
    return global.desktopAPI.sendDesktopCommand(this.sessionId, 'click', { x, y });
  }

  async clickElement(description) {
    const element = await this.findElement(description);
    return await this.click(element.center.x, element.center.y);
  }

  async doubleClick(x, y) {
    await this._ensurePermission();
    return global.desktopAPI.sendDesktopCommand(this.sessionId, 'double_click', { x, y });
  }

  async rightClick(x, y) {
    await this._ensurePermission();
    return global.desktopAPI.sendDesktopCommand(this.sessionId, 'right_click', { x, y });
  }

  async drag(fromX, fromY, toX, toY) {
    await this._ensurePermission();
    return global.desktopAPI.sendDesktopCommand(this.sessionId, 'drag', {
      fromX, fromY, toX, toY
    });
  }

  async scroll(direction = 'down', amount = 3) {
    await this._ensurePermission();
    return global.desktopAPI.sendDesktopCommand(this.sessionId, 'scroll', {
      direction, amount
    });
  }

  // Keyboard actions
  async type(text) {
    await this._ensurePermission();
    return global.desktopAPI.sendDesktopCommand(this.sessionId, 'type', { text });
  }

  async press(key) {
    await this._ensurePermission();
    return global.desktopAPI.sendDesktopCommand(this.sessionId, 'key_press', { key });
  }

  async pressKeys(keys) {
    await this._ensurePermission();
    for (const key of keys) {
      await this.press(key);
      await this._delay(100); // Small delay between key presses
    }
  }

  // Application navigation
  async openApplication(appName) {
    await this._ensurePermission();

    // First try to find the app in the taskbar/dock
    try {
      await this.clickElement(`${appName} icon`);
      return { opened: true, method: 'taskbar' };
    } catch (error) {
      // If not found, try spotlight/start menu
      if (process.platform === 'darwin') {
        await this.press('cmd+space');
        await this._delay(500);
        await this.type(appName);
        await this._delay(500);
        await this.press('enter');
      } else {
        await this.press('win');
        await this._delay(500);
        await this.type(appName);
        await this._delay(500);
        await this.press('enter');
      }
      return { opened: true, method: 'search' };
    }
  }

  async switchWindow() {
    await this._ensurePermission();
    const key = process.platform === 'darwin' ? 'cmd+tab' : 'alt+tab';
    return await this.press(key);
  }

  async minimizeWindow() {
    await this._ensurePermission();
    const key = process.platform === 'darwin' ? 'cmd+m' : 'win+down';
    return await this.press(key);
  }

  async closeWindow() {
    await this._ensurePermission();
    const key = process.platform === 'darwin' ? 'cmd+w' : 'alt+f4';
    return await this.press(key);
  }

  // Helper methods
  async _ensurePermission() {
    const status = await this.getDesktopStatus();
    if (!status.connected) {
      throw new Error('Desktop not connected');
    }
    if (!status.hasPermission) {
      throw new Error('Desktop permission not granted');
    }
  }

  async _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create and export skill instance
const desktopControl = new DesktopControlSkill();

// Export individual functions for the OpenClaw skill system
module.exports = {
  // Connection management
  getDesktopStatus: () => desktopControl.getDesktopStatus(),
  requestDesktopPermission: (reason) => desktopControl.requestDesktopPermission(reason),

  // Vision and screenshots
  takeScreenshot: () => desktopControl.takeScreenshot(),
  analyzeScreen: (prompt) => desktopControl.analyzeScreen(prompt),
  findElement: (description) => desktopControl.findElement(description),

  // Mouse actions
  click: (x, y) => desktopControl.click(x, y),
  clickElement: (description) => desktopControl.clickElement(description),
  doubleClick: (x, y) => desktopControl.doubleClick(x, y),
  rightClick: (x, y) => desktopControl.rightClick(x, y),
  drag: (fromX, fromY, toX, toY) => desktopControl.drag(fromX, fromY, toX, toY),
  scroll: (direction, amount) => desktopControl.scroll(direction, amount),

  // Keyboard actions
  type: (text) => desktopControl.type(text),
  press: (key) => desktopControl.press(key),
  pressKeys: (keys) => desktopControl.pressKeys(keys),

  // Application navigation
  openApplication: (appName) => desktopControl.openApplication(appName),
  switchWindow: () => desktopControl.switchWindow(),
  minimizeWindow: () => desktopControl.minimizeWindow(),
  closeWindow: () => desktopControl.closeWindow()
};