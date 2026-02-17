const { z } = require('zod');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * 🌸 BLOOM Desktop Control - USER-FRIENDLY VERSION 🌸
 *
 * SIMPLE FLOW FOR USERS:
 * 1. User: "Jaden, use my desktop"
 * 2. Jaden: Auto-launches desktop app with secure token
 * 3. User: Clicks "Allow"
 * 4. Coral glow appears - DONE!
 *
 * NO MORE: Manual tokens, connection codes, debugging, complex setup
 */

// Smart session management
const userSessions = new Map();

const generateSecureUserToken = (userId) => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `bloom_${userId}_${timestamp}_${random}`;
};

const getUserId = () => {
  // In production, get from OpenClaw session context
  // For now, use system username as identifier
  try {
    return require('os').userInfo().username || 'user';
  } catch {
    return 'user';
  }
};

const skill = {
  name: 'desktop-control',
  description: 'User-friendly desktop control - just say "use my desktop" and Jaden handles everything!',

  functions: {
    // 🎯 MAIN FUNCTION - User just says "Jaden, use my desktop"
    use_desktop: {
      description: 'MAIN ENTRY POINT - User says "use my desktop" and Jaden handles everything automatically',
      parameters: z.object({
        task: z.string().optional().describe('What you need desktop for (optional context for user)')
      }),
      handler: async ({ task = 'help you with computer tasks' }) => {
        try {
          if (!global.desktopAPI) {
            return {
              error: 'Desktop system not available',
              user_message: 'Sorry, desktop control is not set up on this server yet.'
            };
          }

          const userId = getUserId();
          const sessions = global.desktopAPI.getDesktopSessions();

          // Check if user already has desktop connected
          const userSession = sessions.find(s => s.isAuthenticated && s.customerToken?.includes(userId));

          if (userSession && userSession.hasPermission) {
            return {
              status: 'ready',
              message: `Perfect! I can see your desktop. The coral glow border should be visible around your screen.`,
              user_message: `I'm ready to ${task}. You should see the coral glow indicating I have access.`,
              sessionId: userSession.sessionId,
              visual_confirmation: 'Look for coral/pink glow border around your entire screen'
            };
          }

          if (userSession && !userSession.hasPermission) {
            // Desktop connected but no permission - auto-request it
            global.desktopAPI.requestScreenPermission(userSession.sessionId, `Jaden wants to ${task}`);

            return {
              status: 'requesting_permission',
              message: `I can see your BLOOM Desktop is connected! I just sent a permission request.`,
              user_message: `Please click "Allow" in the popup to let me ${task}. The coral glow will appear once you approve.`,
              sessionId: userSession.sessionId,
              next_action: 'User will see permission popup - just click Allow'
            };
          }

          // No desktop connected - provide 1-click solution
          const secureToken = generateSecureUserToken(userId);
          userSessions.set(userId, {
            token: secureToken,
            task,
            timestamp: Date.now()
          });

          const oneClickUrl = `bloom://connect?token=${secureToken}`;
          const webUrl = `https://bloom.ai/desktop/connect?token=${secureToken}`;
          const directConnection = `wss://openclaw-railway-template-production-b301.up.railway.app/desktop:${secureToken}`;

          return {
            status: 'need_desktop_app',
            message: `I need desktop access to ${task}. I've prepared a secure connection for you.`,
            user_message: `To let me ${task}, please:\n\n1️⃣ **If you have BLOOM Desktop installed:**\nClick this link: ${oneClickUrl}\n\n2️⃣ **If you need to download it:**\nGo to: https://bloom.ai/desktop\n\n3️⃣ **Manual connection (backup):**\nUse this code: ${directConnection}`,

            // Different options for user convenience
            options: {
              one_click: oneClickUrl,
              web_download: 'https://bloom.ai/desktop',
              manual_connection: directConnection,
              backup_github: 'https://github.com/kimberlyflowers/bloom-desktop/releases/latest'
            },

            secure_token: secureToken,
            auto_expires: '1 hour for security',
            next_action: 'Once connected, I\'ll automatically request permission and you just click Allow'
          };

        } catch (error) {
          return {
            error: `Desktop setup failed: ${error.message}`,
            user_message: 'Sorry, something went wrong setting up desktop access. Please try again.'
          };
        }
      }
    },

    // 📸 SMART SCREENSHOT - Auto-detects session
    see_screen: {
      description: 'Take a screenshot of the user\'s desktop (auto-detects active session)',
      parameters: z.object({}),
      handler: async () => {
        try {
          if (!global.desktopAPI) {
            return { error: 'Desktop API not available' };
          }

          const sessions = global.desktopAPI.getDesktopSessions();
          const activeSession = sessions.find(s => s.hasPermission);

          if (!activeSession) {
            return {
              error: 'No desktop access',
              user_message: 'I need desktop access first. Say "Jaden, use my desktop" to get started.'
            };
          }

          const commandId = global.desktopAPI.sendDesktopCommand(activeSession.sessionId, 'screenshot', {});

          return {
            message: 'Taking screenshot of your desktop...',
            user_message: 'I\'m capturing what\'s on your screen now.',
            commandId,
            sessionId: activeSession.sessionId
          };
        } catch (error) {
          return { error: `Failed to take screenshot: ${error.message}` };
        }
      }
    },

    // 🖱️ SMART CLICK - Auto-detects session
    click: {
      description: 'Click at coordinates on the user\'s desktop',
      parameters: z.object({
        x: z.number().describe('X coordinate to click'),
        y: z.number().describe('Y coordinate to click'),
        button: z.enum(['left', 'right', 'middle']).optional().default('left')
      }),
      handler: async ({ x, y, button = 'left' }) => {
        try {
          if (!global.desktopAPI) {
            return { error: 'Desktop API not available' };
          }

          const sessions = global.desktopAPI.getDesktopSessions();
          const activeSession = sessions.find(s => s.hasPermission);

          if (!activeSession) {
            return {
              error: 'No desktop access',
              user_message: 'I need desktop access first. Say "Jaden, use my desktop" to get started.'
            };
          }

          const commandId = global.desktopAPI.sendDesktopCommand(activeSession.sessionId, 'click', {
            x, y, button
          });

          return {
            message: `Clicking at (${x}, ${y})`,
            user_message: `I'm clicking at position ${x}, ${y} on your screen.`,
            commandId
          };
        } catch (error) {
          return { error: `Failed to click: ${error.message}` };
        }
      }
    },

    // ⌨️ SMART TYPE - Auto-detects session
    type: {
      description: 'Type text on the user\'s desktop',
      parameters: z.object({
        text: z.string().describe('Text to type')
      }),
      handler: async ({ text }) => {
        try {
          if (!global.desktopAPI) {
            return { error: 'Desktop API not available' };
          }

          const sessions = global.desktopAPI.getDesktopSessions();
          const activeSession = sessions.find(s => s.hasPermission);

          if (!activeSession) {
            return {
              error: 'No desktop access',
              user_message: 'I need desktop access first. Say "Jaden, use my desktop" to get started.'
            };
          }

          const commandId = global.desktopAPI.sendDesktopCommand(activeSession.sessionId, 'type', { text });

          return {
            message: `Typing: "${text}"`,
            user_message: `I'm typing "${text}" on your computer.`,
            commandId
          };
        } catch (error) {
          return { error: `Failed to type: ${error.message}` };
        }
      }
    },

    // ⌨️ SMART KEY PRESS - Auto-detects session
    keys: {
      description: 'Press keyboard keys or shortcuts (cmd+c, enter, etc.)',
      parameters: z.object({
        combination: z.string().describe('Key combination like "cmd+c", "enter", "tab"')
      }),
      handler: async ({ combination }) => {
        try {
          if (!global.desktopAPI) {
            return { error: 'Desktop API not available' };
          }

          const sessions = global.desktopAPI.getDesktopSessions();
          const activeSession = sessions.find(s => s.hasPermission);

          if (!activeSession) {
            return {
              error: 'No desktop access',
              user_message: 'I need desktop access first. Say "Jaden, use my desktop" to get started.'
            };
          }

          const commandId = global.desktopAPI.sendDesktopCommand(activeSession.sessionId, 'keypress', {
            keys: combination
          });

          return {
            message: `Pressing keys: ${combination}`,
            user_message: `I'm pressing ${combination} on your keyboard.`,
            commandId
          };
        } catch (error) {
          return { error: `Failed to press keys: ${error.message}` };
        }
      }
    },

    // 📋 SIMPLE STATUS CHECK
    desktop_status: {
      description: 'Check if desktop access is working',
      parameters: z.object({}),
      handler: async () => {
        try {
          if (!global.desktopAPI) {
            return {
              status: 'unavailable',
              user_message: 'Desktop control is not available on this server.'
            };
          }

          const sessions = global.desktopAPI.getDesktopSessions();
          const activeSession = sessions.find(s => s.hasPermission);

          if (activeSession) {
            return {
              status: 'active',
              user_message: 'Desktop access is active! You should see the coral glow border around your screen.',
              visual_confirmation: 'Look for coral/pink border around your screen',
              session_info: {
                authenticated: activeSession.isAuthenticated,
                has_permission: activeSession.hasPermission,
                recent_activity: activeSession.hasRecentFrame
              }
            };
          }

          const connectedSession = sessions.find(s => s.isAuthenticated);
          if (connectedSession) {
            return {
              status: 'connected_no_permission',
              user_message: 'BLOOM Desktop is connected but I don\'t have permission yet. Say "use my desktop" to request access.',
              next_action: 'Request permission'
            };
          }

          return {
            status: 'no_connection',
            user_message: 'No desktop connection found. Say "Jaden, use my desktop" to get started.',
            next_action: 'Set up desktop connection'
          };

        } catch (error) {
          return { error: `Status check failed: ${error.message}` };
        }
      }
    },

    // 🛑 RELEASE CONTROL - Simple cleanup
    release_desktop: {
      description: 'Release desktop control - coral glow disappears',
      parameters: z.object({
        message: z.string().optional().describe('Message to show user')
      }),
      handler: async ({ message = 'Desktop session completed' }) => {
        try {
          if (!global.desktopAPI) {
            return { error: 'Desktop API not available' };
          }

          const sessions = global.desktopAPI.getDesktopSessions();
          const activeSession = sessions.find(s => s.hasPermission);

          if (activeSession) {
            const commandId = global.desktopAPI.sendDesktopCommand(activeSession.sessionId, 'release_control', {
              reason: message
            });

            return {
              status: 'released',
              message: 'Desktop control released',
              user_message: `${message} - The coral glow should disappear from your screen.`,
              visual_effect: 'Coral glow border will disappear',
              commandId
            };
          } else {
            return {
              status: 'no_active_session',
              user_message: 'No active desktop session to release.'
            };
          }
        } catch (error) {
          return { error: `Failed to release desktop: ${error.message}` };
        }
      }
    }
  }
};

module.exports = skill;