#!/usr/bin/env node

/**
 * Credential Health Monitor
 * Runs periodically to check status of all critical credentials
 * Reports alerts when credentials are expiring or invalid
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

class CredentialHealthMonitor {
  constructor() {
    this.checksDir = '/data/workspace/credentials-health';
    this.reportPath = path.join(this.checksDir, 'report.json');
    this.ensureDir();
  }

  ensureDir() {
    if (!fs.existsSync(this.checksDir)) {
      fs.mkdirSync(this.checksDir, { recursive: true });
    }
  }

  /**
   * Check Drive token status
   */
  async checkDriveToken() {
    try {
      const tokenPath = '/data/workspace/data/skills/bloomie-drive-delivery/.drive-tokens.json';
      
      if (!fs.existsSync(tokenPath)) {
        return { name: 'drive', status: 'MISSING', message: 'Token file not found' };
      }

      const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
      const savedDate = new Date(token.saved_at);
      const daysSinceSave = Math.floor((Date.now() - savedDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceSave > 180) {
        return {
          name: 'drive',
          status: 'EXPIRING_SOON',
          days_since_save: daysSinceSave,
          message: 'Token older than 180 days - will expire soon',
          action: 'Run: node /data/workspace/data/skills/bloomie-drive-delivery/scripts/oauth-setup.js',
        };
      }

      return {
        name: 'drive',
        status: 'OK',
        days_since_save: daysSinceSave,
        message: 'Drive token valid',
      };
    } catch (err) {
      return {
        name: 'drive',
        status: 'ERROR',
        error: err.message,
      };
    }
  }

  /**
   * Check GHL token status
   */
  async checkGHLToken() {
    try {
      const tokenPath = '/data/secrets/ghl-token.txt';
      
      if (!fs.existsSync(tokenPath)) {
        return { name: 'ghl', status: 'MISSING', message: 'Token file not found' };
      }

      const token = fs.readFileSync(tokenPath, 'utf8').trim();
      
      if (!token || token.length === 0) {
        return { name: 'ghl', status: 'EMPTY', message: 'Token file is empty' };
      }

      // GHL tokens don't expire easily, just check it exists
      return {
        name: 'ghl',
        status: 'OK',
        message: 'GHL token present',
      };
    } catch (err) {
      return {
        name: 'ghl',
        status: 'ERROR',
        error: err.message,
      };
    }
  }

  /**
   * Check Supabase connection
   */
  async checkSupabaseConnection() {
    try {
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_KEY;
      
      if (!url || !key) {
        return {
          name: 'supabase',
          status: 'MISSING_ENV',
          message: 'Environment variables not set',
        };
      }

      const client = new Client({
        connectionString: process.env.SUPABASE_DB_URL,
        ssl: { rejectUnauthorized: false },
      });

      await client.connect();
      
      // Quick test query
      const result = await client.query('SELECT NOW()');
      await client.end();

      return {
        name: 'supabase',
        status: 'OK',
        message: 'Database connection OK',
        connected_at: new Date().toISOString(),
      };
    } catch (err) {
      return {
        name: 'supabase',
        status: 'ERROR',
        error: err.message,
      };
    }
  }

  /**
   * Run all health checks
   */
  async runChecks() {
    console.log('🏥 Credential Health Monitor - Starting checks\n');

    const checks = await Promise.all([
      this.checkDriveToken(),
      this.checkGHLToken(),
      this.checkSupabaseConnection(),
    ]);

    // Analyze results
    const report = {
      timestamp: new Date().toISOString(),
      checks: checks,
      summary: {
        total: checks.length,
        ok: checks.filter(c => c.status === 'OK').length,
        warnings: checks.filter(c => c.status === 'EXPIRING_SOON').length,
        errors: checks.filter(c => c.status === 'ERROR' || c.status === 'MISSING').length,
      },
    };

    // Save report
    fs.writeFileSync(this.reportPath, JSON.stringify(report, null, 2));

    // Display results
    console.log('📊 CREDENTIAL HEALTH REPORT\n');
    checks.forEach(check => {
      const icon = check.status === 'OK' ? '✅' : check.status === 'EXPIRING_SOON' ? '⚠️' : '❌';
      console.log(`${icon} ${check.name.toUpperCase()}: ${check.status}`);
      console.log(`   ${check.message}`);
      if (check.action) {
        console.log(`   Action: ${check.action}`);
      }
      console.log();
    });

    console.log(`📈 SUMMARY: ${report.summary.ok}/${report.summary.total} healthy`);
    if (report.summary.warnings > 0) {
      console.log(`⚠️  ${report.summary.warnings} warning(s)`);
    }
    if (report.summary.errors > 0) {
      console.log(`❌ ${report.summary.errors} error(s)`);
    }

    return report;
  }

  /**
   * Get last report
   */
  getLastReport() {
    if (fs.existsSync(this.reportPath)) {
      return JSON.parse(fs.readFileSync(this.reportPath, 'utf8'));
    }
    return null;
  }
}

// Run if executed directly
if (require.main === module) {
  const monitor = new CredentialHealthMonitor();
  monitor.runChecks()
    .then(report => {
      const hasErrors = report.summary.errors > 0 || report.summary.warnings > 0;
      process.exit(hasErrors ? 1 : 0);
    })
    .catch(err => {
      console.error('Monitor failed:', err.message);
      process.exit(1);
    });
}

module.exports = { CredentialHealthMonitor };
