const crypto = require('crypto');
const WebSocket = require('ws');

/**
 * 🌸 BLOOM Desktop Control - WebSocket Direct Implementation
 *
 * Communicates directly with BLOOM Desktop via WebSocket
 * No HTTP bridge needed — uses the same connection as the app
 */

// Session management
const userSessions = new Map();
let wsConnection = null;

const generateSecureUserToken = (userId) => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `bloom_${userId}_${timestamp}_${random}`;
};

const getUserId = () => {
  try {
    return require('os').userInfo().username || 'user';
  } catch {
    return 'user';
  }
};

/**
 * Connect to OpenClaw gateway's desktop WebSocket
 */
const connectToDesktop = async () => {
  return new Promise((resolve, reject) => {
    try {
      const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN || '';
      const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || 'ws://127.0.0.1:18789';
      const userId = process.env.OPENCLAW_USER_ID || 'root';
      
      // Connect to gateway's /desktop endpoint with auth
      const authParam = gatewayToken ? `?auth.token=${gatewayToken}` : '';
      const wsUrl = `${gatewayUrl}/desktop${authParam}`;
      
      wsConnection = new WebSocket(wsUrl);
      
      wsConnection.on('open', () => {
        // Send initialization message
        const init = {
          action: 'init',
          userId,
          timestamp: Date.now()
        };
        wsConnection.send(JSON.stringify(init));
        resolve(wsConnection);
      });
      
      wsConnection.on('error', (error) => {
        reject(new Error(`WebSocket connection failed: ${error.message}`));
      });
      
      wsConnection.on('close', () => {
        wsConnection = null;
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Send command to desktop via WebSocket
 */
const sendDesktopCommand = async (action, data = {}) => {
  try {
    // Ensure connection exists
    if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
      wsConnection = await connectToDesktop();
    }

    return new Promise((resolve, reject) => {
      const commandId = crypto.randomBytes(8).toString('hex');
      const timeout = setTimeout(() => {
        reject(new Error('Desktop command timeout'));
      }, 30000); // 30 second timeout

      const messageHandler = (event) => {
        try {
          const message = JSON.parse(event.data || event);
          if (message.commandId === commandId) {
            clearTimeout(timeout);
            wsConnection.off('message', messageHandler);
            resolve(message);
          }
        } catch (e) {
          // Not a JSON message for this command, ignore
        }
      };

      wsConnection.on('message', messageHandler);

      const command = {
        commandId,
        action,
        data,
        timestamp: Date.now()
      };

      wsConnection.send(JSON.stringify(command));
    });
  } catch (error) {
    throw new Error(`Failed to send desktop command: ${error.message}`);
  }
};

/**
 * 🎯 MAIN ENTRY POINT - User says "use my desktop"
 */
const use_desktop = async (task = 'help you with computer tasks') => {
  try {
    const userId = getUserId();

    // Try to get session list
    try {
      const result = await sendDesktopCommand('list_sessions', {});
      
      // Check if user already has permission
      if (result.sessions && result.sessions.length > 0) {
        const userSession = result.sessions.find(s => s.isAuthenticated && s.hasPermission);
        
        if (userSession) {
          return {
            status: 'ready',
            message: `Perfect! I can see your desktop. The coral glow border should be visible.`,
            user_message: `I'm ready to ${task}. You should see the coral glow indicating I have access.`,
            sessionId: userSession.sessionId,
            visual_confirmation: 'Look for coral/pink glow border around your entire screen'
          };
        }
      }

      // Request permission
      const permResult = await sendDesktopCommand('request_permission', {
        reason: `Jaden wants to ${task}`
      });

      return {
        status: 'requesting_permission',
        message: `I can see your BLOOM Desktop is connected! I just sent a permission request.`,
        user_message: `Please click "Allow" in the popup to let me ${task}. The coral glow will appear once you approve.`,
        next_action: 'User will see permission popup - click Allow'
      };
    } catch (apiError) {
      // WebSocket not ready yet, provide setup instructions
      const secureToken = generateSecureUserToken(userId);
      userSessions.set(userId, {
        token: secureToken,
        task,
        timestamp: Date.now()
      });

      const directConnection = `wss://openclaw-railway-template-production-b301.up.railway.app/desktop:${secureToken}`;

      return {
        status: 'need_desktop_app',
        message: `I need desktop access to ${task}. I've prepared a secure connection for you.`,
        user_message: `To let me ${task}, please:\n\n1️⃣ **Download BLOOM Desktop:**\nhttps://github.com/kimberlyflowers/bloom-desktop/releases/latest\n\n2️⃣ **Use this connection code:**\n${directConnection}\n\n3️⃣ **Click "Allow" when I request permission**`,
        connection_code: directConnection,
        download_url: 'https://github.com/kimberlyflowers/bloom-desktop/releases/latest'
      };
    }
  } catch (error) {
    return {
      error: `Desktop setup failed: ${error.message}`,
      user_message: error.message
    };
  }
};

/**
 * 📸 Take screenshot of user's desktop
 */
const see_screen = async () => {
  try {
    const result = await sendDesktopCommand('screenshot', {});
    
    return {
      message: 'Taking screenshot of your desktop...',
      user_message: 'I\'m capturing what\'s on your screen now.',
      commandId: result.commandId,
      screenshot: result.data?.image || null
    };
  } catch (error) {
    return {
      error: error.message,
      user_message: error.message
    };
  }
};

/**
 * 🖱️ Click at coordinates on desktop
 */
const click = async (x, y, button = 'left') => {
  try {
    const result = await sendDesktopCommand('click', {
      x,
      y,
      button
    });

    return {
      message: `Clicking at (${x}, ${y})`,
      user_message: `I'm clicking at position ${x}, ${y} on your screen.`,
      commandId: result.commandId
    };
  } catch (error) {
    return {
      error: error.message,
      user_message: error.message
    };
  }
};

/**
 * ⌨️ Type text on desktop
 */
const type = async (text) => {
  try {
    const result = await sendDesktopCommand('type', {
      text
    });

    return {
      message: `Typing: "${text}"`,
      user_message: `I'm typing "${text}" on your computer.`,
      commandId: result.commandId
    };
  } catch (error) {
    return {
      error: error.message,
      user_message: error.message
    };
  }
};

/**
 * ⌨️ Press keyboard keys or shortcuts
 */
const keys = async (combination) => {
  try {
    const result = await sendDesktopCommand('keypress', {
      keys: combination
    });

    return {
      message: `Pressing keys: ${combination}`,
      user_message: `I'm pressing ${combination} on your keyboard.`,
      commandId: result.commandId
    };
  } catch (error) {
    return {
      error: error.message,
      user_message: error.message
    };
  }
};

/**
 * 📋 Check desktop connection status
 */
const desktop_status = async () => {
  try {
    const result = await sendDesktopCommand('status', {});
    
    if (result.ok) {
      return {
        status: 'active',
        user_message: 'Desktop access is active! You should see the coral glow border around your screen.',
        visual_confirmation: 'Look for coral/pink border around your screen',
        session_info: result.data || {}
      };
    }
    
    return {
      status: 'connected_no_permission',
      user_message: 'BLOOM Desktop is connected but I don\'t have permission yet. Say "use my desktop" to request access.',
      next_action: 'Request permission'
    };
  } catch (error) {
    return {
      status: 'no_connection',
      user_message: 'BLOOM Desktop is not connected. Make sure the app is running and connected to the gateway.',
      next_action: 'Start BLOOM Desktop app'
    };
  }
};

/**
 * 🛑 Release desktop control
 */
const release_desktop = async (message = 'Desktop session completed') => {
  try {
    const result = await sendDesktopCommand('release_control', {
      reason: message
    });

    return {
      status: 'released',
      message: 'Desktop control released',
      user_message: `${message} - The coral glow should disappear from your screen.`,
      visual_effect: 'Coral glow border will disappear',
      commandId: result.commandId
    };
  } catch (error) {
    return {
      error: `Failed to release desktop: ${error.message}`
    };
  }
};

module.exports = {
  use_desktop,
  see_screen,
  click,
  type,
  keys,
  desktop_status,
  release_desktop
};
