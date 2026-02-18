const crypto = require('crypto');

// Polyfill fetch for Node.js compatibility
const fetch = globalThis.fetch || (() => {
  try {
    return require('node-fetch');
  } catch (err) {
    // If node-fetch not available, try using built-in http module
    const http = require('http');
    const https = require('https');
    const { URL } = require('url');

    return (url, options = {}) => {
      return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const lib = parsedUrl.protocol === 'https:' ? https : http;

        const reqOptions = {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port,
          path: parsedUrl.pathname + parsedUrl.search,
          method: options.method || 'GET',
          headers: options.headers || {}
        };

        const req = lib.request(reqOptions, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              json: () => Promise.resolve(JSON.parse(data)),
              text: () => Promise.resolve(data)
            });
          });
        });

        req.on('error', reject);

        if (options.body) {
          req.write(options.body);
        }

        req.end();
      });
    };
  }
})();

/**
 * 🌸 BLOOM Desktop Control - User-Friendly Implementation
 *
 * Provides simple desktop control functions that auto-detect sessions
 * and handle all the technical complexity behind the scenes.
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

const callDesktopAPI = async (method, path, body = null) => {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`http://127.0.0.1:8080${path}`, options);
    const result = await response.json();

    if (!result.ok) {
      throw new Error(result.error || 'API call failed');
    }

    return result;
  } catch (error) {
    throw new Error(`Desktop API call failed: ${error.message}`);
  }
};

const getActiveSession = async () => {
  const result = await callDesktopAPI('GET', '/api/desktop/sessions');
  const sessions = result.sessions || [];
  const activeSession = sessions.find(s => s.hasPermission);

  if (!activeSession) {
    throw new Error('No desktop access. Say "Jaden, use my desktop" to get started.');
  }

  return activeSession;
};

/**
 * 🎯 MAIN ENTRY POINT - User says "use my desktop"
 */
const use_desktop = async (task = 'help you with computer tasks') => {
  try {
    const userId = getUserId();

    let sessions;
    try {
      const result = await callDesktopAPI('GET', '/api/desktop/sessions');
      sessions = result.sessions || [];
    } catch (error) {
      return {
        error: 'Desktop system not available',
        user_message: 'Sorry, desktop control is not set up on this server yet.'
      };
    }

    // Check if user already has desktop connected with permission
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
      await callDesktopAPI('POST', '/api/desktop/permission', {
        sessionId: userSession.sessionId,
        reason: `Jaden wants to ${task}`
      });

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

    const directConnection = `wss://openclaw-railway-template-production-b301.up.railway.app/desktop:${secureToken}`;

    return {
      status: 'need_desktop_app',
      message: `I need desktop access to ${task}. I've prepared a secure connection for you.`,
      user_message: `To let me ${task}, please:\n\n1️⃣ **Download BLOOM Desktop:**\nhttps://github.com/kimberlyflowers/bloom-desktop/releases/latest\n\n2️⃣ **Use this connection code:**\n${directConnection}\n\n3️⃣ **Click "Allow" when I request permission**`,
      connection_code: directConnection,
      download_url: 'https://github.com/kimberlyflowers/bloom-desktop/releases/latest',
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
};

/**
 * 📸 Take screenshot of user's desktop
 */
const see_screen = async () => {
  try {
    const activeSession = await getActiveSession();

    const result = await callDesktopAPI('POST', '/api/desktop/command', {
      sessionId: activeSession.sessionId,
      action: 'screenshot',
      data: {}
    });

    return {
      message: 'Taking screenshot of your desktop...',
      user_message: 'I\'m capturing what\'s on your screen now.',
      commandId: result.commandId,
      sessionId: activeSession.sessionId
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
    const activeSession = await getActiveSession();

    const result = await callDesktopAPI('POST', '/api/desktop/command', {
      sessionId: activeSession.sessionId,
      action: 'click',
      data: { x, y, button }
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
    const activeSession = await getActiveSession();

    const result = await callDesktopAPI('POST', '/api/desktop/command', {
      sessionId: activeSession.sessionId,
      action: 'type',
      data: { text }
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
    const activeSession = await getActiveSession();

    const result = await callDesktopAPI('POST', '/api/desktop/command', {
      sessionId: activeSession.sessionId,
      action: 'keypress',
      data: { keys: combination }
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
    let sessions;

    try {
      const result = await callDesktopAPI('GET', '/api/desktop/sessions');
      sessions = result.sessions || [];
    } catch (error) {
      return {
        status: 'unavailable',
        user_message: 'Desktop control is not available on this server.'
      };
    }

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
    return {
      error: `Status check failed: ${error.message}`
    };
  }
};

/**
 * 🛑 Release desktop control
 */
const release_desktop = async (message = 'Desktop session completed') => {
  try {
    let sessions;

    try {
      const result = await callDesktopAPI('GET', '/api/desktop/sessions');
      sessions = result.sessions || [];
    } catch (error) {
      return {
        error: 'Desktop API not available'
      };
    }

    const activeSession = sessions.find(s => s.hasPermission);

    if (activeSession) {
      const result = await callDesktopAPI('POST', '/api/desktop/command', {
        sessionId: activeSession.sessionId,
        action: 'release_control',
        data: { reason: message }
      });

      return {
        status: 'released',
        message: 'Desktop control released',
        user_message: `${message} - The coral glow should disappear from your screen.`,
        visual_effect: 'Coral glow border will disappear',
        commandId: result.commandId
      };
    } else {
      return {
        status: 'no_active_session',
        user_message: 'No active desktop session to release.'
      };
    }
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
