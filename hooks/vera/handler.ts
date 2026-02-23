/**
 * Vera Verification Hook - Native OpenClaw Implementation
 *
 * Intercepts message:sent events to verify Jaden's completion claims
 * before allowing delivery to client. Uses BLOOM verification modules.
 */

const fs = require('fs');
const path = require('path');

// Import BLOOM modules (adjust paths for hook context)
const { VeraVerification } = require('../../../clawdbot-railway-template/src/vera-verification.js');
const { MessageGate } = require('../../../clawdbot-railway-template/src/message-gating.js');

// Initialize verification system
const veraVerification = new VeraVerification({
  verificationTimeout: 60000,
  strictMode: false
});

const messageGate = new MessageGate({
  verificationTimeout: 90000,
  onVerificationNeeded: (messageId, content) => veraVerification.verifyMessage(messageId, content),
  onMessageReleased: (gateInfo) => {
    console.log(`[Vera] Verification complete for ${gateInfo.messageId} - allowing delivery`);
  },
  onVerificationFailed: (messageId, result) => {
    console.warn(`[Vera] Verification failed for ${messageId}:`, result.reason);
  }
});

/**
 * Main hook handler - intercepts message:sent events
 */
const handler = async (event) => {
  // Only handle message:sent events
  if (event.type !== 'message:sent') {
    return;
  }

  const { content, sessionKey, timestamp } = event;

  console.log(`[Vera] Intercepted message:sent - checking for completion claims`);

  // Check if this message needs verification
  const messageId = messageGate.bufferMessage({
    content,
    type: 'openclaw_message',
    event,
    sessionKey,
    timestamp
  });

  if (!messageId) {
    // No verification needed - allow through immediately
    console.log(`[Vera] Message passed through - no verification required`);
    return;
  }

  // Message is now buffered for verification
  console.log(`[Vera] Message ${messageId} buffered for verification`);

  // Wait for verification to complete
  return new Promise((resolve) => {
    const checkVerification = () => {
      const gateInfo = messageGate.getGateInfo(messageId);

      if (!gateInfo) {
        resolve(); // Gate was cleaned up, assume released
        return;
      }

      switch (gateInfo.state) {
        case 'verified':
        case 'released':
          console.log(`[Vera] Message ${messageId} verified and released`);
          resolve();
          break;

        case 'failed':
        case 'timeout':
          console.log(`[Vera] Message ${messageId} verification failed - blocking delivery`);
          // Block message by not resolving or returning error
          sendVerificationFeedbackToJaden(gateInfo);
          resolve({ block: true, reason: 'Verification failed' });
          break;

        default:
          // Still verifying, check again in 1 second
          setTimeout(checkVerification, 1000);
          break;
      }
    };

    checkVerification();
  });
};

/**
 * Send verification feedback to Jaden when claims fail
 */
function sendVerificationFeedbackToJaden(gateInfo) {
  const { messageId, content, verificationData } = gateInfo;

  const feedback = `🚫 Vera Verification Failed for message ${messageId.substring(0, 8)}

**Claim**: ${content.substring(0, 200)}...

**Issue**: ${verificationData?.reason || 'Unknown verification error'}

**Evidence Required**: ${getEvidenceRequirement(verificationData)}

Please provide proper verification evidence and retry.`;

  // Send feedback back to Jaden's session
  // This would need to be implemented based on OpenClaw's messaging API
  console.log(`[Vera] Would send feedback to Jaden:`, feedback);

  // For now, log the feedback - TODO: Implement actual message sending
  logVerificationFailure(messageId, content, verificationData, feedback);
}

/**
 * Get evidence requirement based on verification failure
 */
function getEvidenceRequirement(verificationData) {
  if (!verificationData) return 'Unknown verification method';

  switch (verificationData.method) {
    case 'email_sent':
      return 'Check sent folder and confirm delivery status';
    case 'file_created':
      return 'Verify file exists with correct content and timestamp';
    case 'file_uploaded':
      return 'Confirm file appears in destination with proper metadata';
    case 'deployment_completed':
      return 'Check service health endpoint and deployment logs';
    default:
      return 'Provide specific evidence of task completion';
  }
}

/**
 * Log verification failure for audit trail
 */
function logVerificationFailure(messageId, content, verificationData, feedback) {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    messageId,
    content: content.substring(0, 500),
    verificationData,
    feedback,
    action: 'blocked'
  };

  try {
    const auditPath = path.join(__dirname, '../../../clawdbot-railway-template/bloom/vera-audit.jsonl');
    fs.appendFileSync(auditPath, JSON.stringify(auditEntry) + '\n');
  } catch (error) {
    console.error('[Vera] Failed to write audit log:', error);
  }
}

/**
 * Get verification statistics for monitoring
 */
function getVerificationStats() {
  return {
    totalGates: messageGate.getStats().totalGates,
    verificationConfig: veraVerification.getStats(),
    timestamp: new Date().toISOString()
  };
}

// Export handler for OpenClaw
module.exports = handler;