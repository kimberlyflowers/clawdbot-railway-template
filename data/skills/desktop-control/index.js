const crypto = require('crypto');
const http = require('http');
const https = require('https');
const { URL } = require('url');

/**
 * 🌸 BLOOM Desktop Control - Simplified Flow
 *
 * When user says "use my desktop":
 * 1. Check if session exists
 * 2. Send permission request
 * Done. Wait for user to click "Allow"
 */

// Session tracking
const userSessions = new Map();

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
 * Simple HTTP request helper with 120s timeout
 */
const apiRequest = async (method, url, body = null) => {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const timeout = setTimeout(() => {
      reject(new Error('API request timeout (120s)'));
    }, 120000);
    
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 120000
    };
    
    const req = client.request(parsedUrl, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        clearTimeout(timeout);
        try {
          const result = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(result);
          } else {
            reject(new Error(result.error || `HTTP ${res.statusCode}`));
          }
        } catch (err) {
          reject(new Error(`Parse error: ${err.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    
    req.on('timeout', () => {
      clearTimeout(timeout);
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
};

/**
 * Get first available BLOOM Desktop session
 */
const getAvailableSession = async () => {
  try {
    const result = await apiRequest('GET', 'http://127.0.0.1:8080/api/desktop/sessions');
    if (result.sessions && result.sessions.length > 0) {
      return result.sessions[0].id;
    }
    return null;
  } catch (error) {
    console.error('Session lookup failed:', error.message);
    return null;
  }
};

/**
 * 🎯 MAIN: User says "use my desktop"
 */
const use_desktop = async (task = 'help you with your computer') => {
  try {
    // Step 1: Check if connection exists
    const sessionId = await getAvailableSession();
    
    if (!sessionId) {
      return {
        status: 'no_connection',
        user_message: `I need BLOOM Desktop to ${task}. Please make sure the app is running and connected.`,
        next_action: 'Start BLOOM Desktop app and try again',
        download_url: 'https://github.com/kimberlyflowers/bloom-desktop/releases/latest'
      };
    }
    
    // Step 2: Request permission
    try {
      await apiRequest('POST', 'http://127.0.0.1:8080/api/desktop/permission', {
        sessionId,
        reason: `Jaden wants to ${task}`
      });
    } catch (error) {
      // Permission request may have failed but continue anyway
      console.error('Permission request error:', error.message);
    }
    
    // Done. User will see permission popup
    return {
      status: 'permission_requested',
      message: `Permission request sent to BLOOM Desktop`,
      user_message: `I've asked permission to ${task}. Please click "Allow" in the BLOOM Desktop popup to let me help.`,
      visual_confirmation: 'Look for the permission popup on your screen',
      sessionId
    };
  } catch (error) {
    return {
      error: error.message,
      user_message: `Failed to access desktop: ${error.message}`
    };
  }
};

/**
 * 📸 Take screenshot
 */
const see_screen = async () => {
  try {
    const sessionId = await getAvailableSession();
    if (!sessionId) throw new Error('No desktop session');
    
    const result = await apiRequest('POST', 'http://127.0.0.1:8080/api/desktop/command', {
      sessionId,
      action: 'screenshot'
    });
    
    return {
      user_message: 'I can see your screen.',
      screenshot: result.data?.image || null,
      commandId: result.commandId
    };
  } catch (error) {
    return { error: error.message, user_message: error.message };
  }
};

/**
 * 🖱️ Click at coordinates
 */
const click = async (x, y, button = 'left') => {
  try {
    const sessionId = await getAvailableSession();
    if (!sessionId) throw new Error('No desktop session');
    
    await apiRequest('POST', 'http://127.0.0.1:8080/api/desktop/command', {
      sessionId,
      action: 'click',
      data: { x, y, button }
    });
    
    return {
      user_message: `I clicked at position (${x}, ${y}) on your screen.`
    };
  } catch (error) {
    return { error: error.message, user_message: error.message };
  }
};

/**
 * ⌨️ Type text
 */
const type = async (text) => {
  try {
    const sessionId = await getAvailableSession();
    if (!sessionId) throw new Error('No desktop session');
    
    await apiRequest('POST', 'http://127.0.0.1:8080/api/desktop/command', {
      sessionId,
      action: 'type',
      data: { text }
    });
    
    return {
      user_message: `I typed: "${text}"`
    };
  } catch (error) {
    return { error: error.message, user_message: error.message };
  }
};

/**
 * ⌨️ Press key combo
 */
const keys = async (combination) => {
  try {
    const sessionId = await getAvailableSession();
    if (!sessionId) throw new Error('No desktop session');
    
    await apiRequest('POST', 'http://127.0.0.1:8080/api/desktop/command', {
      sessionId,
      action: 'keys',
      data: { keys: combination }
    });
    
    return {
      user_message: `I pressed: ${combination}`
    };
  } catch (error) {
    return { error: error.message, user_message: error.message };
  }
};

/**
 * 📋 Check status
 */
const desktop_status = async () => {
  try {
    const sessionId = await getAvailableSession();
    
    if (!sessionId) {
      return {
        status: 'disconnected',
        user_message: 'BLOOM Desktop is not connected. Start the app to connect.'
      };
    }
    
    return {
      status: 'connected',
      user_message: 'BLOOM Desktop is connected and ready.',
      sessionId
    };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * 🛑 Release control
 */
const release_desktop = async (message = 'Desktop session ended') => {
  try {
    const sessionId = await getAvailableSession();
    if (!sessionId) throw new Error('No active session');
    
    await apiRequest('POST', 'http://127.0.0.1:8080/api/desktop/command', {
      sessionId,
      action: 'release_control',
      data: { reason: message }
    });
    
    return {
      status: 'released',
      user_message: `${message} - The coral glow should disappear from your screen.`
    };
  } catch (error) {
    return { error: error.message };
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
