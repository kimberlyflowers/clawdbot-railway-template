/**
 * GHL Session Manager
 * 
 * Handles:
 * - Saving authenticated sessions
 * - Loading saved sessions
 * - Checking session validity
 * - Fallback to full login
 */

const fs = require('fs');
const path = require('path');

const SESSION_PATH = '/data/secrets/ghl-session.json';

class SessionManager {
  /**
   * Check if saved session exists and is valid
   */
  static hasSavedSession() {
    try {
      if (!fs.existsSync(SESSION_PATH)) {
        return false;
      }

      const session = JSON.parse(fs.readFileSync(SESSION_PATH, 'utf8'));

      // Check if session has cookies
      if (!session.cookies || session.cookies.length === 0) {
        return false;
      }

      // Check if session was created recently (within 30 days)
      if (session.timestamp) {
        const ageMs = Date.now() - new Date(session.timestamp).getTime();
        const ageDays = ageMs / (1000 * 60 * 60 * 24);

        if (ageDays > 30) {
          console.log(`⚠️  Session is ${Math.floor(ageDays)} days old, may need refresh`);
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Load saved session
   */
  static loadSession() {
    try {
      if (!this.hasSavedSession()) {
        return null;
      }

      const session = JSON.parse(fs.readFileSync(SESSION_PATH, 'utf8'));
      console.log(`✓ Loaded saved session (${session.cookies.length} cookies)`);

      return session;
    } catch (error) {
      console.error(`Error loading session: ${error.message}`);
      return null;
    }
  }

  /**
   * Save authenticated session
   */
  static async saveSession(context) {
    try {
      const state = await context.storageState();

      // Add metadata
      const sessionData = {
        ...state,
        timestamp: new Date().toISOString(),
        savedAt: new Date().toLocaleString(),
      };

      // Ensure directory exists
      const dir = path.dirname(SESSION_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Save with restrictive permissions
      fs.writeFileSync(SESSION_PATH, JSON.stringify(sessionData, null, 2), {
        mode: 0o600, // Only user can read/write
      });

      console.log(`✓ Session saved to ${SESSION_PATH}`);
      console.log(`  Cookies: ${sessionData.cookies.length}`);
      console.log(`  Saved: ${sessionData.savedAt}`);

      return true;
    } catch (error) {
      console.error(`Error saving session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clear saved session (for logout)
   */
  static clearSession() {
    try {
      if (fs.existsSync(SESSION_PATH)) {
        fs.unlinkSync(SESSION_PATH);
        console.log(`✓ Session cleared`);
      }
    } catch (error) {
      console.error(`Error clearing session: ${error.message}`);
    }
  }

  /**
   * Get session info for debugging
   */
  static getSessionInfo() {
    try {
      if (!fs.existsSync(SESSION_PATH)) {
        return { exists: false };
      }

      const session = JSON.parse(fs.readFileSync(SESSION_PATH, 'utf8'));
      const stat = fs.statSync(SESSION_PATH);

      return {
        exists: true,
        path: SESSION_PATH,
        size: stat.size,
        cookies: session.cookies.length,
        savedAt: session.savedAt,
        timestamp: session.timestamp,
        modifiedAgo: Math.floor((Date.now() - stat.mtimeMs) / 1000) + 's',
      };
    } catch (error) {
      return { exists: false, error: error.message };
    }
  }
}

module.exports = SessionManager;
