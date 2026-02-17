const { z } = require('zod');
const crypto = require('crypto');

/**
 * 🌸 BLOOM Desktop Control Skill - THE BRIDGE 🌸
 *
 * This skill connects Jaden's brain to user desktops through BLOOM Desktop app.
 * It handles the COMPLETE chain from "no desktop connected" to "Jaden controlling screen".
 *
 * THE FULL FLOW:
 * 1. User: "Jaden, build me a funnel"
 * 2. Jaden calls: start_desktop_session()
 * 3. If no desktop → return download link + token
 * 4. If desktop connected → request permission
 * 5. User approves → coral glow appears
 * 6. Jaden sees screen + sends commands
 * 7. When done → release control, glow disappears
 */

// Generate secure tokens for users
const generateDesktopToken = () => {
  return `bloom-${crypto.randomBytes(16).toString('hex')}`;
};

const skill = {
  name: 'desktop-control',
  description: 'Complete desktop control system - connects Jaden to user desktops through BLOOM Desktop app',

  functions: {
    // 🎯 THE MAIN ENTRY POINT - Jaden calls this to start desktop work
    start_desktop_session: {
      description: 'Start a desktop control session - handles full flow from no desktop to active control',
      parameters: z.object({
        task: z.string().optional().describe('What task you need desktop access for (helps user understand)')
      }),
      handler: async ({ task = 'desktop automation' }) => {
        try {
          if (!global.desktopAPI) {
            return {
              error: 'Desktop API not available - ensure /desktop WebSocket endpoint is running',
              technical_note: 'Server needs to expose global.desktopAPI functions'
            };
          }

          const sessions = global.desktopAPI.getDesktopSessions();

          // NO DESKTOP CONNECTED - Return setup instructions
          if (sessions.length === 0) {
            const token = generateDesktopToken();

            return {
              status: 'no_desktop_connected',
              message: `I need desktop access for: ${task}`,
              instructions: {
                step1: 'Download BLOOM Desktop app',
                step2: 'Use this connection code in the app',
                step3: 'Grant permission when prompted'
              },
              connection_code: `wss://openclaw-railway-template-production-b301.up.railway.app/desktop:${token}`,
              download_links: {
                mac: 'https://github.com/kimberlyflowers/bloom-desktop/releases/latest',
                windows: 'https://github.com/kimberlyflowers/bloom-desktop/releases/latest',
                direct: 'https://github.com/kimberlyflowers/bloom-desktop'
              },
              next_step: 'User will connect BLOOM Desktop, then call this function again'
            };
          }

          // DESKTOP CONNECTED - Check status
          const session = sessions[0]; // Use first available session

          if (!session.isAuthenticated) {
            return {
              status: 'desktop_connecting',
              message: 'Desktop app is connecting...',
              sessionId: session.sessionId,
              next_step: 'Wait for authentication to complete'
            };
          }

          if (session.hasPermission) {
            return {
              status: 'ready_for_control',
              message: 'Desktop control is active! User should see coral glow border.',
              sessionId: session.sessionId,
              capabilities: ['screenshot', 'click', 'type', 'scroll', 'drag', 'keypress'],
              next_step: 'Use desktop control functions to automate tasks'
            };
          }

          // NEED PERMISSION - Request it
          global.desktopAPI.requestScreenPermission(session.sessionId, `Jaden needs desktop access for: ${task}`);

          return {
            status: 'permission_requested',
            message: 'Permission request sent to user',
            sessionId: session.sessionId,
            task,
            next_step: 'User will see popup to approve. Coral glow will appear when granted.'
          };

        } catch (error) {
          return { error: `Failed to start desktop session: ${error.message}` };
        }
      }
    },

    // 📸 TAKE SCREENSHOT - Jaden's eyes
    see_desktop: {
      description: 'Take a screenshot to see what\'s on the user\'s desktop',
      parameters: z.object({
        sessionId: z.string().optional().describe('Session ID (auto-detected if not provided)')
      }),
      handler: async ({ sessionId }) => {
        try {
          if (!global.desktopAPI) {
            return { error: 'Desktop API not available' };
          }

          // Auto-detect session if not provided
          if (!sessionId) {
            const sessions = global.desktopAPI.getDesktopSessions();
            const activeSession = sessions.find(s => s.hasPermission);
            if (!activeSession) {
              return { error: 'No active desktop session with permission found' };
            }
            sessionId = activeSession.sessionId;
          }

          const commandId = global.desktopAPI.sendDesktopCommand(sessionId, 'screenshot', {});

          return {
            message: 'Taking screenshot of user\'s desktop...',
            commandId,
            sessionId,
            note: 'Screenshot will be processed by Claude Vision for analysis'
          };
        } catch (error) {
          return { error: `Failed to see desktop: ${error.message}` };
        }
      }
    },

    // 🖱️ CLICK - Jaden's finger
    click_at: {
      description: 'Click at specific coordinates on the desktop',
      parameters: z.object({
        x: z.number().describe('X coordinate to click'),
        y: z.number().describe('Y coordinate to click'),
        button: z.enum(['left', 'right', 'middle']).optional().default('left').describe('Mouse button to use'),
        sessionId: z.string().optional().describe('Session ID (auto-detected if not provided)')
      }),
      handler: async ({ x, y, button = 'left', sessionId }) => {
        try {
          if (!global.desktopAPI) {
            return { error: 'Desktop API not available' };
          }

          // Auto-detect session if not provided
          if (!sessionId) {
            const sessions = global.desktopAPI.getDesktopSessions();
            const activeSession = sessions.find(s => s.hasPermission);
            if (!activeSession) {
              return { error: 'No active desktop session found. Call start_desktop_session() first.' };
            }
            sessionId = activeSession.sessionId;
          }

          const commandId = global.desktopAPI.sendDesktopCommand(sessionId, 'click', {
            x, y, button
          });

          return {
            message: `Clicking ${button} button at (${x}, ${y})`,
            commandId,
            sessionId
          };
        } catch (error) {
          return { error: `Failed to click: ${error.message}` };
        }
      }
    },

    // ⌨️ TYPE - Jaden's voice
    type_text: {
      description: 'Type text on the desktop',
      parameters: z.object({
        text: z.string().describe('Text to type'),
        sessionId: z.string().optional().describe('Session ID (auto-detected if not provided)')
      }),
      handler: async ({ text, sessionId }) => {
        try {
          if (!global.desktopAPI) {
            return { error: 'Desktop API not available' };
          }

          // Auto-detect session
          if (!sessionId) {
            const sessions = global.desktopAPI.getDesktopSessions();
            const activeSession = sessions.find(s => s.hasPermission);
            if (!activeSession) {
              return { error: 'No active desktop session found. Call start_desktop_session() first.' };
            }
            sessionId = activeSession.sessionId;
          }

          const commandId = global.desktopAPI.sendDesktopCommand(sessionId, 'type', { text });

          return {
            message: `Typing: "${text}"`,
            commandId,
            sessionId
          };
        } catch (error) {
          return { error: `Failed to type: ${error.message}` };
        }
      }
    },

    // ⌨️ KEYBOARD SHORTCUTS - Jaden's shortcuts
    press_keys: {
      description: 'Press keyboard keys or key combinations (cmd+c, ctrl+v, etc.)',
      parameters: z.object({
        keys: z.string().describe('Key combination (e.g., "cmd+c", "enter", "tab", "cmd+shift+4")'),
        sessionId: z.string().optional().describe('Session ID (auto-detected if not provided)')
      }),
      handler: async ({ keys, sessionId }) => {
        try {
          if (!global.desktopAPI) {
            return { error: 'Desktop API not available' };
          }

          // Auto-detect session
          if (!sessionId) {
            const sessions = global.desktopAPI.getDesktopSessions();
            const activeSession = sessions.find(s => s.hasPermission);
            if (!activeSession) {
              return { error: 'No active desktop session found. Call start_desktop_session() first.' };
            }
            sessionId = activeSession.sessionId;
          }

          const commandId = global.desktopAPI.sendDesktopCommand(sessionId, 'keypress', { keys });

          return {
            message: `Pressing keys: "${keys}"`,
            commandId,
            sessionId
          };
        } catch (error) {
          return { error: `Failed to press keys: ${error.message}` };
        }
      }
    },

    // 🖱️ SCROLL - Jaden's scroll
    scroll_at: {
      description: 'Scroll at specific coordinates',
      parameters: z.object({
        x: z.number().describe('X coordinate to scroll at'),
        y: z.number().describe('Y coordinate to scroll at'),
        direction: z.enum(['up', 'down', 'left', 'right']).describe('Scroll direction'),
        amount: z.number().optional().default(3).describe('Scroll amount (lines)'),
        sessionId: z.string().optional().describe('Session ID (auto-detected if not provided)')
      }),
      handler: async ({ x, y, direction, amount = 3, sessionId }) => {
        try {
          if (!global.desktopAPI) {
            return { error: 'Desktop API not available' };
          }

          // Auto-detect session
          if (!sessionId) {
            const sessions = global.desktopAPI.getDesktopSessions();
            const activeSession = sessions.find(s => s.hasPermission);
            if (!activeSession) {
              return { error: 'No active desktop session found. Call start_desktop_session() first.' };
            }
            sessionId = activeSession.sessionId;
          }

          const commandId = global.desktopAPI.sendDesktopCommand(sessionId, 'scroll', {
            x, y, direction, amount
          });

          return {
            message: `Scrolling ${direction} ${amount} lines at (${x}, ${y})`,
            commandId,
            sessionId
          };
        } catch (error) {
          return { error: `Failed to scroll: ${error.message}` };
        }
      }
    },

    // 🖱️ DRAG - Jaden's drag
    drag_from_to: {
      description: 'Drag from one point to another',
      parameters: z.object({
        fromX: z.number().describe('Starting X coordinate'),
        fromY: z.number().describe('Starting Y coordinate'),
        toX: z.number().describe('Ending X coordinate'),
        toY: z.number().describe('Ending Y coordinate'),
        duration: z.number().optional().default(500).describe('Drag duration in milliseconds'),
        sessionId: z.string().optional().describe('Session ID (auto-detected if not provided)')
      }),
      handler: async ({ fromX, fromY, toX, toY, duration = 500, sessionId }) => {
        try {
          if (!global.desktopAPI) {
            return { error: 'Desktop API not available' };
          }

          // Auto-detect session
          if (!sessionId) {
            const sessions = global.desktopAPI.getDesktopSessions();
            const activeSession = sessions.find(s => s.hasPermission);
            if (!activeSession) {
              return { error: 'No active desktop session found. Call start_desktop_session() first.' };
            }
            sessionId = activeSession.sessionId;
          }

          const commandId = global.desktopAPI.sendDesktopCommand(sessionId, 'drag', {
            from: { x: fromX, y: fromY },
            to: { x: toX, y: toY },
            duration
          });

          return {
            message: `Dragging from (${fromX}, ${fromY}) to (${toX}, ${toY})`,
            commandId,
            sessionId,
            duration
          };
        } catch (error) {
          return { error: `Failed to drag: ${error.message}` };
        }
      }
    },

    // 🔍 CHECK STATUS - What's happening?
    desktop_status: {
      description: 'Check the status of all desktop connections',
      parameters: z.object({}),
      handler: async () => {
        try {
          if (!global.desktopAPI) {
            return {
              error: 'Desktop API not available',
              solution: 'Ensure /desktop WebSocket endpoint is running on server'
            };
          }

          const sessions = global.desktopAPI.getDesktopSessions();

          return {
            total_sessions: sessions.length,
            sessions: sessions.map(session => ({
              sessionId: session.sessionId,
              authenticated: session.isAuthenticated,
              hasPermission: session.hasPermission,
              hasRecentFrame: session.hasRecentFrame,
              status: session.hasPermission ? 'ACTIVE_CONTROL' :
                     session.isAuthenticated ? 'CONNECTED' : 'CONNECTING',
              visual_indicator: session.hasPermission ? 'User sees coral glow border' : 'No glow border'
            })),
            recommendation: sessions.length === 0 ?
              'Call start_desktop_session() to get setup instructions' :
              sessions.find(s => s.hasPermission) ?
                'Ready for desktop control!' :
                'Desktop connected but needs permission'
          };
        } catch (error) {
          return { error: `Failed to check status: ${error.message}` };
        }
      }
    },

    // 🛑 FINISH - Clean up when done
    finish_desktop_session: {
      description: 'Release desktop control and clean up - coral glow will disappear',
      parameters: z.object({
        sessionId: z.string().optional().describe('Session ID (auto-detected if not provided)'),
        message: z.string().optional().describe('Message to show user')
      }),
      handler: async ({ sessionId, message = 'Desktop session completed' }) => {
        try {
          if (!global.desktopAPI) {
            return { error: 'Desktop API not available' };
          }

          // Auto-detect session
          if (!sessionId) {
            const sessions = global.desktopAPI.getDesktopSessions();
            const activeSession = sessions.find(s => s.hasPermission);
            if (activeSession) {
              sessionId = activeSession.sessionId;
            }
          }

          if (sessionId) {
            const commandId = global.desktopAPI.sendDesktopCommand(sessionId, 'release_control', {
              reason: message
            });

            return {
              message: 'Desktop control released',
              user_message: message,
              commandId,
              sessionId,
              visual_effect: 'Coral glow border will disappear',
              status: 'session_ended'
            };
          } else {
            return {
              message: 'No active desktop session to release',
              status: 'no_active_session'
            };
          }
        } catch (error) {
          return { error: `Failed to finish session: ${error.message}` };
        }
      }
    }
  }
};

module.exports = skill;