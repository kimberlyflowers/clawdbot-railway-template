const { z } = require('zod');

/**
 * Desktop Control Skill for Jaden
 * Allows Jaden to control connected desktop clients via BLOOM Desktop
 */

const skill = {
  name: 'desktop-control',
  description: 'Control desktop clients through BLOOM Desktop connections',

  functions: {
    list_sessions: {
      description: 'List all connected desktop sessions',
      parameters: z.object({}),
      handler: async () => {
        try {
          if (!global.desktopAPI) {
            return { error: 'Desktop API not available - ensure /desktop WebSocket endpoint is running' };
          }

          const sessions = global.desktopAPI.getDesktopSessions();

          if (sessions.length === 0) {
            return {
              message: 'No desktop sessions connected. User needs to connect BLOOM Desktop app first.',
              sessions: []
            };
          }

          return {
            message: `Found ${sessions.length} desktop session(s)`,
            sessions: sessions.map(session => ({
              sessionId: session.sessionId,
              authenticated: session.isAuthenticated,
              hasPermission: session.hasPermission,
              hasRecentFrame: session.hasRecentFrame,
              status: session.hasPermission ? 'READY' : session.isAuthenticated ? 'AUTHENTICATED' : 'CONNECTING'
            }))
          };
        } catch (error) {
          return { error: `Failed to list sessions: ${error.message}` };
        }
      }
    },

    request_permission: {
      description: 'Request screen control permission from a desktop session',
      parameters: z.object({
        sessionId: z.string().describe('Session ID to request permission from'),
        reason: z.string().optional().describe('Reason for requesting access (optional)')
      }),
      handler: async ({ sessionId, reason = 'Desktop control requested by Jaden' }) => {
        try {
          if (!global.desktopAPI) {
            return { error: 'Desktop API not available' };
          }

          global.desktopAPI.requestScreenPermission(sessionId, reason);

          return {
            message: `Permission request sent to session ${sessionId}`,
            reason,
            next_steps: 'Wait for user to grant permission in BLOOM Desktop app'
          };
        } catch (error) {
          return { error: `Failed to request permission: ${error.message}` };
        }
      }
    },

    take_screenshot: {
      description: 'Request a screenshot from the desktop session',
      parameters: z.object({
        sessionId: z.string().describe('Session ID to screenshot')
      }),
      handler: async ({ sessionId }) => {
        try {
          if (!global.desktopAPI) {
            return { error: 'Desktop API not available' };
          }

          const commandId = global.desktopAPI.sendDesktopCommand(sessionId, 'screenshot', {});

          return {
            message: `Screenshot requested from session ${sessionId}`,
            commandId,
            note: 'Screenshot will be processed by Claude Vision for analysis'
          };
        } catch (error) {
          return { error: `Failed to take screenshot: ${error.message}` };
        }
      }
    },

    click: {
      description: 'Click at specific coordinates on the desktop',
      parameters: z.object({
        sessionId: z.string().describe('Session ID to control'),
        x: z.number().describe('X coordinate to click'),
        y: z.number().describe('Y coordinate to click'),
        button: z.enum(['left', 'right', 'middle']).optional().default('left').describe('Mouse button to use')
      }),
      handler: async ({ sessionId, x, y, button = 'left' }) => {
        try {
          if (!global.desktopAPI) {
            return { error: 'Desktop API not available' };
          }

          const commandId = global.desktopAPI.sendDesktopCommand(sessionId, 'click', {
            x,
            y,
            button
          });

          return {
            message: `${button} click sent to (${x}, ${y}) on session ${sessionId}`,
            commandId
          };
        } catch (error) {
          return { error: `Failed to click: ${error.message}` };
        }
      }
    },

    type_text: {
      description: 'Type text on the desktop',
      parameters: z.object({
        sessionId: z.string().describe('Session ID to control'),
        text: z.string().describe('Text to type')
      }),
      handler: async ({ sessionId, text }) => {
        try {
          if (!global.desktopAPI) {
            return { error: 'Desktop API not available' };
          }

          const commandId = global.desktopAPI.sendDesktopCommand(sessionId, 'type', {
            text
          });

          return {
            message: `Typing "${text}" on session ${sessionId}`,
            commandId
          };
        } catch (error) {
          return { error: `Failed to type text: ${error.message}` };
        }
      }
    },

    key_press: {
      description: 'Press keyboard keys (supports modifiers and special keys)',
      parameters: z.object({
        sessionId: z.string().describe('Session ID to control'),
        keys: z.string().describe('Key combination (e.g., "cmd+c", "enter", "tab", "cmd+shift+4")')
      }),
      handler: async ({ sessionId, keys }) => {
        try {
          if (!global.desktopAPI) {
            return { error: 'Desktop API not available' };
          }

          const commandId = global.desktopAPI.sendDesktopCommand(sessionId, 'keypress', {
            keys
          });

          return {
            message: `Key press "${keys}" sent to session ${sessionId}`,
            commandId
          };
        } catch (error) {
          return { error: `Failed to press keys: ${error.message}` };
        }
      }
    },

    scroll: {
      description: 'Scroll at specific coordinates',
      parameters: z.object({
        sessionId: z.string().describe('Session ID to control'),
        x: z.number().describe('X coordinate to scroll at'),
        y: z.number().describe('Y coordinate to scroll at'),
        direction: z.enum(['up', 'down', 'left', 'right']).describe('Scroll direction'),
        amount: z.number().optional().default(3).describe('Scroll amount (lines)')
      }),
      handler: async ({ sessionId, x, y, direction, amount = 3 }) => {
        try {
          if (!global.desktopAPI) {
            return { error: 'Desktop API not available' };
          }

          const commandId = global.desktopAPI.sendDesktopCommand(sessionId, 'scroll', {
            x,
            y,
            direction,
            amount
          });

          return {
            message: `Scrolling ${direction} ${amount} lines at (${x}, ${y}) on session ${sessionId}`,
            commandId
          };
        } catch (error) {
          return { error: `Failed to scroll: ${error.message}` };
        }
      }
    },

    drag: {
      description: 'Drag from one point to another',
      parameters: z.object({
        sessionId: z.string().describe('Session ID to control'),
        fromX: z.number().describe('Starting X coordinate'),
        fromY: z.number().describe('Starting Y coordinate'),
        toX: z.number().describe('Ending X coordinate'),
        toY: z.number().describe('Ending Y coordinate'),
        duration: z.number().optional().default(500).describe('Drag duration in milliseconds')
      }),
      handler: async ({ sessionId, fromX, fromY, toX, toY, duration = 500 }) => {
        try {
          if (!global.desktopAPI) {
            return { error: 'Desktop API not available' };
          }

          const commandId = global.desktopAPI.sendDesktopCommand(sessionId, 'drag', {
            from: { x: fromX, y: fromY },
            to: { x: toX, y: toY },
            duration
          });

          return {
            message: `Dragging from (${fromX}, ${fromY}) to (${toX}, ${toY}) on session ${sessionId}`,
            commandId
          };
        } catch (error) {
          return { error: `Failed to drag: ${error.message}` };
        }
      }
    },

    release_control: {
      description: 'Release control and revoke desktop permissions',
      parameters: z.object({
        sessionId: z.string().describe('Session ID to release')
      }),
      handler: async ({ sessionId }) => {
        try {
          if (!global.desktopAPI) {
            return { error: 'Desktop API not available' };
          }

          const commandId = global.desktopAPI.sendDesktopCommand(sessionId, 'release_control', {
            reason: 'Control released by Jaden'
          });

          return {
            message: `Released control of session ${sessionId}`,
            commandId,
            note: 'User will see the coral glow border disappear'
          };
        } catch (error) {
          return { error: `Failed to release control: ${error.message}` };
        }
      }
    }
  }
};

module.exports = skill;