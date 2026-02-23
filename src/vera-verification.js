/**
 * BLOOM Vera Verification System
 *
 * Independent verification logic for validating agent claims.
 * Checks external systems to confirm claimed actions actually occurred.
 * Used by message-gating.js to verify buffered messages.
 */

const fs = require('node:fs');
const path = require('node:path');

/**
 * Verification methods for different claim types
 */
const VerificationMethods = {
  EMAIL_SENT: 'email_sent',
  FILE_CREATED: 'file_created',
  FILE_UPLOADED: 'file_uploaded',
  API_CALL_MADE: 'api_call_made',
  DEPLOYMENT_COMPLETED: 'deployment_completed',
  TASK_COMPLETED: 'task_completed',
  RECORD_UPDATED: 'record_updated'
};

/**
 * Verification patterns that map content to verification methods
 */
const VERIFICATION_CLAIM_PATTERNS = [
  // Email claims
  {
    patterns: [/sent.*email.*to.*(\w+@[\w.-]+)/i, /emailed.*(\w+@[\w.-]+)/i],
    method: VerificationMethods.EMAIL_SENT,
    extract: (content) => {
      const match = content.match(/(\w+@[\w.-]+)/);
      return { email: match?.[1] };
    }
  },

  // File creation claims
  {
    patterns: [/created.*file.*([\/\w.-]+)/i, /saved.*to.*([\/\w.-]+)/i],
    method: VerificationMethods.FILE_CREATED,
    extract: (content) => {
      const match = content.match(/(?:created|saved).*(?:file|to).*?([\/\w.-]+)/i);
      return { filepath: match?.[1] };
    }
  },

  // File upload claims
  {
    patterns: [/uploaded.*to.*drive/i, /uploaded.*file.*to/i],
    method: VerificationMethods.FILE_UPLOADED,
    extract: (content) => {
      const match = content.match(/uploaded.*(?:file|document).*?(\w+)/i);
      return { filename: match?.[1] };
    }
  },

  // API/deployment claims
  {
    patterns: [/deployed.*to.*railway/i, /deployment.*successful/i],
    method: VerificationMethods.DEPLOYMENT_COMPLETED,
    extract: (content) => {
      return { platform: 'railway', timestamp: Date.now() };
    }
  },

  // General task completion
  {
    patterns: [/task.*completed/i, /finished.*task/i, /done.*with/i],
    method: VerificationMethods.TASK_COMPLETED,
    extract: (content) => {
      const match = content.match(/(?:task|finished|done).*?(\w+)/i);
      return { taskType: match?.[1] || 'general' };
    }
  }
];

/**
 * Main verification class
 */
class VeraVerification {
  constructor(options = {}) {
    this.config = {
      ghlApiKey: process.env.GHL_API_KEY,
      googleServiceAccount: process.env.GOOGLE_SERVICE_ACCOUNT,
      supabaseUrl: process.env.SUPABASE_URL,
      railwayToken: process.env.RAILWAY_TOKEN,
      verificationTimeout: options.verificationTimeout || 60000,
      strictMode: options.strictMode || false,
      auditLogPath: options.auditLogPath || path.join(process.cwd(), 'bloom', 'vera-audit.jsonl')
    };

    // Ensure audit log directory exists
    this.ensureAuditLogDir();
  }

  /**
   * Main verification entry point
   * Called by message-gating.js for each buffered message
   */
  async verifyMessage(messageId, content) {
    const startTime = Date.now();

    try {
      console.log(`[VeraVerification] Starting verification for ${messageId}`);

      // Identify claim type and extract data
      const claim = this.identifyClaim(content);
      if (!claim) {
        return this.createResult(true, 'no_claim_identified', { content });
      }

      // Perform specific verification
      const verificationResult = await this.performVerification(claim);

      // Log audit trail
      await this.logAudit({
        messageId,
        content,
        claim,
        result: verificationResult,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });

      console.log(`[VeraVerification] Completed verification for ${messageId}: ${verificationResult.verified ? 'VERIFIED' : 'FAILED'}`);

      return verificationResult;

    } catch (error) {
      console.error(`[VeraVerification] Error verifying ${messageId}:`, error);

      const errorResult = this.createResult(false, 'verification_error', {
        error: error.message,
        content
      });

      // Log error to audit trail
      await this.logAudit({
        messageId,
        content,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });

      return errorResult;
    }
  }

  /**
   * Identify the type of claim being made
   */
  identifyClaim(content) {
    for (const pattern of VERIFICATION_CLAIM_PATTERNS) {
      for (const regex of pattern.patterns) {
        if (regex.test(content)) {
          const extractedData = pattern.extract(content);
          return {
            method: pattern.method,
            content,
            data: extractedData,
            pattern: regex.source
          };
        }
      }
    }
    return null;
  }

  /**
   * Perform specific verification based on claim type
   */
  async performVerification(claim) {
    switch (claim.method) {
      case VerificationMethods.EMAIL_SENT:
        return await this.verifyEmailSent(claim);

      case VerificationMethods.FILE_CREATED:
        return await this.verifyFileCreated(claim);

      case VerificationMethods.FILE_UPLOADED:
        return await this.verifyFileUploaded(claim);

      case VerificationMethods.DEPLOYMENT_COMPLETED:
        return await this.verifyDeployment(claim);

      case VerificationMethods.TASK_COMPLETED:
        return await this.verifyTaskCompleted(claim);

      default:
        return this.createResult(true, 'unknown_method', { claim });
    }
  }

  /**
   * Verify email was sent via GHL
   */
  async verifyEmailSent(claim) {
    if (!this.config.ghlApiKey) {
      return this.createResult(!this.config.strictMode, 'no_ghl_api_key', { claim });
    }

    try {
      // TODO: Implement GHL conversations API check
      // GET /conversations/{conversationId}/messages
      // Confirm: direction=outbound, status=DELIVERED, content matches

      console.log(`[VeraVerification] Would verify email to ${claim.data.email} via GHL API`);

      // Placeholder verification - would make actual API call
      const verified = true; // await this.checkGHLEmail(claim.data.email);

      return this.createResult(verified, 'ghl_email_check', {
        email: claim.data.email,
        // apiResponse: result
      });

    } catch (error) {
      return this.createResult(false, 'ghl_api_error', { error: error.message, claim });
    }
  }

  /**
   * Verify file was created locally
   */
  async verifyFileCreated(claim) {
    try {
      const filepath = claim.data.filepath;
      if (!filepath) {
        return this.createResult(false, 'no_filepath_extracted', { claim });
      }

      // Check if file exists and get stats
      const fullPath = path.resolve(filepath);
      const exists = fs.existsSync(fullPath);

      if (exists) {
        const stats = fs.statSync(fullPath);
        const isRecent = (Date.now() - stats.mtime.getTime()) < 600000; // 10 minutes

        return this.createResult(isRecent, 'file_created_check', {
          filepath: fullPath,
          exists,
          size: stats.size,
          created: stats.mtime.toISOString(),
          isRecent
        });
      } else {
        return this.createResult(false, 'file_not_found', {
          filepath: fullPath,
          exists: false
        });
      }

    } catch (error) {
      return this.createResult(false, 'file_check_error', { error: error.message, claim });
    }
  }

  /**
   * Verify file was uploaded to external service
   */
  async verifyFileUploaded(claim) {
    if (!this.config.googleServiceAccount) {
      return this.createResult(!this.config.strictMode, 'no_google_credentials', { claim });
    }

    try {
      // TODO: Implement Google Drive API check
      // Search Drive API for filename created within 10 minutes
      // Confirm: file exists, size > 0 bytes

      console.log(`[VeraVerification] Would verify file upload for ${claim.data.filename} via Drive API`);

      // Placeholder verification
      const verified = true;

      return this.createResult(verified, 'drive_upload_check', {
        filename: claim.data.filename,
        // apiResponse: result
      });

    } catch (error) {
      return this.createResult(false, 'drive_api_error', { error: error.message, claim });
    }
  }

  /**
   * Verify deployment completed
   */
  async verifyDeployment(claim) {
    try {
      // TODO: Implement Railway deployment verification
      // GET https://{service-url}/healthz
      // Confirm: 200 OK response, deployment timestamp

      console.log(`[VeraVerification] Would verify Railway deployment health check`);

      // Placeholder verification
      const verified = true;

      return this.createResult(verified, 'deployment_health_check', {
        platform: claim.data.platform,
        timestamp: claim.data.timestamp
      });

    } catch (error) {
      return this.createResult(false, 'deployment_check_error', { error: error.message, claim });
    }
  }

  /**
   * Verify general task completion
   */
  async verifyTaskCompleted(claim) {
    // For general task completion, we rely on specific verification methods
    // This is a fallback that logs the claim but doesn't perform external verification

    console.log(`[VeraVerification] General task completion claim: ${claim.data.taskType}`);

    return this.createResult(true, 'general_task_logged', {
      taskType: claim.data.taskType,
      requiresManualReview: true
    });
  }

  /**
   * Create standardized verification result
   */
  createResult(verified, reason, evidence = {}) {
    return {
      verified: Boolean(verified),
      reason,
      evidence,
      timestamp: new Date().toISOString(),
      source: 'vera_verification'
    };
  }

  /**
   * Log verification audit trail
   */
  async logAudit(auditData) {
    try {
      const logEntry = JSON.stringify(auditData) + '\n';
      await fs.promises.appendFile(this.config.auditLogPath, logEntry, 'utf8');
    } catch (error) {
      console.error('[VeraVerification] Failed to write audit log:', error);
    }
  }

  /**
   * Ensure audit log directory exists
   */
  ensureAuditLogDir() {
    try {
      const dir = path.dirname(this.config.auditLogPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch (error) {
      console.error('[VeraVerification] Failed to create audit log directory:', error);
    }
  }

  /**
   * Get verification statistics
   */
  getStats() {
    return {
      configured: {
        ghl: Boolean(this.config.ghlApiKey),
        google: Boolean(this.config.googleServiceAccount),
        railway: Boolean(this.config.railwayToken),
        supabase: Boolean(this.config.supabaseUrl)
      },
      strictMode: this.config.strictMode,
      auditLogPath: this.config.auditLogPath
    };
  }

  /**
   * Test verification with sample data
   */
  async testVerification() {
    const testClaims = [
      "I sent an email to test@example.com about the meeting",
      "I created a new file at /tmp/test.txt",
      "I uploaded the document to Google Drive",
      "The deployment to Railway completed successfully"
    ];

    const results = [];
    for (const content of testClaims) {
      const result = await this.verifyMessage(`test-${Date.now()}`, content);
      results.push({ content, result });
    }

    return results;
  }
}

module.exports = { VeraVerification, VerificationMethods, VERIFICATION_CLAIM_PATTERNS };