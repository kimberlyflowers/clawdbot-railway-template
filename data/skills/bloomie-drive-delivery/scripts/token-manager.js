/**
 * Token Manager - Handles Google Drive OAuth2 token refresh with auto-detection of expiration
 * Detects invalid_grant errors and provides clear re-auth instructions
 */

const fs = require('fs');
const path = require('path');

class TokenManager {
  constructor(tokenPath) {
    this.tokenPath = tokenPath;
  }

  /**
   * Load token data with metadata
   */
  loadToken() {
    if (!fs.existsSync(this.tokenPath)) {
      throw new Error(`Token file not found: ${this.tokenPath}`);
    }

    const data = JSON.parse(fs.readFileSync(this.tokenPath, 'utf8'));
    return {
      refresh_token: data.refresh_token,
      saved_at: data.saved_at,
      last_checked: data.last_checked || null,
      last_error: data.last_error || null,
    };
  }

  /**
   * Update token metadata
   */
  updateTokenMetadata(metadata) {
    const data = JSON.parse(fs.readFileSync(this.tokenPath, 'utf8'));
    
    fs.writeFileSync(
      this.tokenPath,
      JSON.stringify({
        ...data,
        ...metadata,
        updated_at: new Date().toISOString(),
      }, null, 2)
    );
  }

  /**
   * Check if token is valid and can refresh
   * Returns { isValid: boolean, error: string | null }
   */
  async checkTokenValidity(clientId, clientSecret) {
    try {
      const token = this.loadToken();
      
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: token.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        
        // Check for expired token
        if (error.includes('invalid_grant')) {
          this.updateTokenMetadata({
            last_checked: new Date().toISOString(),
            last_error: 'Token expired or revoked - requires re-authorization',
            status: 'EXPIRED',
          });
          
          return {
            isValid: false,
            error: 'EXPIRED',
            message: 'Token has expired or been revoked',
            action: 'Run: node scripts/oauth-setup.js to re-authorize',
          };
        }

        return {
          isValid: false,
          error: error,
          message: 'Token refresh failed',
        };
      }

      // Token is valid
      this.updateTokenMetadata({
        last_checked: new Date().toISOString(),
        last_error: null,
        status: 'VALID',
      });

      const data = await response.json();
      return {
        isValid: true,
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      };
    } catch (err) {
      return {
        isValid: false,
        error: err.message,
      };
    }
  }

  /**
   * Get token health status for monitoring
   */
  getStatus() {
    const token = this.loadToken();
    
    const savedDate = new Date(token.saved_at);
    const daysSinceSave = Math.floor((Date.now() - savedDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      saved_at: token.saved_at,
      days_since_save: daysSinceSave,
      last_checked: token.last_checked,
      last_error: token.last_error,
      needs_reauth: daysSinceSave > 180, // Google tokens expire after ~6 months
      status: token.last_error ? 'ERROR' : 'OK',
    };
  }
}

module.exports = { TokenManager };
