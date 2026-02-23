/**
 * BLOOM Message Gating System
 *
 * Core buffering and release logic for Vera verification.
 * Holds outbound messages from Jaden until verification completes.
 * Integrates with proxy to provide hard enforcement without bypass.
 */

const crypto = require('node:crypto');

/**
 * Message types that require verification
 */
const VERIFICATION_PATTERNS = [
  // Completion claims
  /task.*completed?/i,
  /finished.*task/i,
  /done.*with/i,
  /successfully.*sent/i,
  /created.*file/i,
  /email.*sent/i,
  /uploaded.*to/i,

  // Action confirmations
  /i.*sent.*email/i,
  /i.*created.*file/i,
  /i.*updated.*record/i,
  /deployed.*to/i,
  /committed.*changes/i,

  // Status updates
  /✅/,
  /completed/i,
  /success/i,
];

/**
 * Message gate states
 */
const GateState = {
  BUFFERED: 'buffered',
  VERIFYING: 'verifying',
  VERIFIED: 'verified',
  FAILED: 'failed',
  RELEASED: 'released',
  TIMEOUT: 'timeout'
};

/**
 * Central message gating system
 */
class MessageGate {
  constructor(options = {}) {
    this.gates = new Map(); // messageId -> GateInfo
    this.verificationTimeout = options.verificationTimeout || 90000; // 90 seconds
    this.maxBufferSize = options.maxBufferSize || 100; // Prevent memory leaks
    this.cleanupInterval = options.cleanupInterval || 60000; // 1 minute

    // Callbacks for external integration
    this.onVerificationNeeded = options.onVerificationNeeded || (() => {});
    this.onMessageReleased = options.onMessageReleased || (() => {});
    this.onVerificationFailed = options.onVerificationFailed || (() => {});

    // Start cleanup timer
    this.startCleanup();
  }

  /**
   * Check if message content requires verification
   */
  requiresVerification(content) {
    if (!content || typeof content !== 'string') return false;

    return VERIFICATION_PATTERNS.some(pattern => pattern.test(content));
  }

  /**
   * Buffer a message for verification
   * Returns messageId if buffered, null if passed through
   */
  bufferMessage(messageData) {
    const { content, type = 'http', req, res, socket, head } = messageData;

    // Check if verification needed
    if (!this.requiresVerification(content)) {
      return null; // Pass through immediately
    }

    // Generate unique message ID
    const messageId = crypto.randomUUID();

    // Check buffer limits
    if (this.gates.size >= this.maxBufferSize) {
      console.warn('[MessageGate] Buffer full, releasing oldest message');
      this.releaseOldestMessage();
    }

    // Create gate entry
    const gateInfo = {
      messageId,
      content,
      type,
      state: GateState.BUFFERED,
      timestamp: Date.now(),
      req,
      res,
      socket,
      head,
      verificationData: null,
      timeoutTimer: null
    };

    // Store in gates
    this.gates.set(messageId, gateInfo);

    // Start verification timeout
    this.startVerificationTimeout(messageId);

    // Trigger verification request
    this.requestVerification(messageId, content);

    console.log(`[MessageGate] Buffered message ${messageId}: ${content.substring(0, 100)}...`);

    return messageId;
  }

  /**
   * Start verification process for buffered message
   */
  requestVerification(messageId, content) {
    const gateInfo = this.gates.get(messageId);
    if (!gateInfo || gateInfo.state !== GateState.BUFFERED) return;

    // Update state
    gateInfo.state = GateState.VERIFYING;

    // Call external verification handler
    this.onVerificationNeeded(messageId, content)
      .then(result => this.handleVerificationResult(messageId, result))
      .catch(error => this.handleVerificationError(messageId, error));
  }

  /**
   * Handle verification result
   */
  handleVerificationResult(messageId, result) {
    const gateInfo = this.gates.get(messageId);
    if (!gateInfo) return;

    // Clear timeout
    if (gateInfo.timeoutTimer) {
      clearTimeout(gateInfo.timeoutTimer);
      gateInfo.timeoutTimer = null;
    }

    if (result.verified) {
      gateInfo.state = GateState.VERIFIED;
      gateInfo.verificationData = result;
      this.releaseMessage(messageId);
    } else {
      gateInfo.state = GateState.FAILED;
      gateInfo.verificationData = result;
      this.handleVerificationFailure(messageId, result);
    }
  }

  /**
   * Handle verification error
   */
  handleVerificationError(messageId, error) {
    console.error(`[MessageGate] Verification error for ${messageId}:`, error);

    const gateInfo = this.gates.get(messageId);
    if (!gateInfo) return;

    gateInfo.state = GateState.FAILED;
    gateInfo.verificationData = { error: error.message };

    this.handleVerificationFailure(messageId, { error: error.message });
  }

  /**
   * Handle verification failure - block message and inject feedback
   */
  handleVerificationFailure(messageId, result) {
    const gateInfo = this.gates.get(messageId);
    if (!gateInfo) return;

    // DO NOT release the message - block it completely
    console.warn(`[MessageGate] Verification failed for ${messageId}, blocking message and injecting feedback`);

    gateInfo.state = GateState.FAILED;

    // Notify external handler to inject feedback (into agent session)
    // Don't release original message to client
    this.onVerificationFailed(messageId, result, gateInfo.sessionKey);

    // Clean up the gate
    setTimeout(() => {
      this.gates.delete(messageId);
    }, 1000);
  }

  /**
   * Release a verified message to client
   */
  releaseMessage(messageId) {
    const gateInfo = this.gates.get(messageId);
    if (!gateInfo || gateInfo.state === GateState.RELEASED) return;

    console.log(`[MessageGate] Releasing message ${messageId}`);

    gateInfo.state = GateState.RELEASED;

    // Call external release handler
    this.onMessageReleased(gateInfo);

    // Clean up after brief delay (allow handler to complete)
    setTimeout(() => {
      this.gates.delete(messageId);
    }, 1000);
  }

  /**
   * Start verification timeout for message
   */
  startVerificationTimeout(messageId) {
    const gateInfo = this.gates.get(messageId);
    if (!gateInfo) return;

    gateInfo.timeoutTimer = setTimeout(() => {
      console.warn(`[MessageGate] Verification timeout for ${messageId}`);

      gateInfo.state = GateState.TIMEOUT;
      this.releaseMessage(messageId); // Release on timeout
    }, this.verificationTimeout);
  }

  /**
   * Force release oldest message when buffer is full
   */
  releaseOldestMessage() {
    let oldestTime = Infinity;
    let oldestId = null;

    for (const [id, info] of this.gates) {
      if (info.timestamp < oldestTime) {
        oldestTime = info.timestamp;
        oldestId = id;
      }
    }

    if (oldestId) {
      console.warn(`[MessageGate] Force releasing oldest message ${oldestId}`);
      this.releaseMessage(oldestId);
    }
  }

  /**
   * Get current gate statistics
   */
  getStats() {
    const states = {};
    for (const info of this.gates.values()) {
      states[info.state] = (states[info.state] || 0) + 1;
    }

    return {
      totalGates: this.gates.size,
      states,
      oldestMessage: this.gates.size > 0 ?
        Math.min(...Array.from(this.gates.values()).map(i => i.timestamp)) : null
    };
  }

  /**
   * Start periodic cleanup of old gates
   */
  startCleanup() {
    setInterval(() => {
      const cutoff = Date.now() - (this.cleanupInterval * 2); // 2x cleanup interval
      const toDelete = [];

      for (const [id, info] of this.gates) {
        if (info.timestamp < cutoff && info.state === GateState.RELEASED) {
          toDelete.push(id);
        }
      }

      for (const id of toDelete) {
        this.gates.delete(id);
      }

      if (toDelete.length > 0) {
        console.log(`[MessageGate] Cleaned up ${toDelete.length} old gates`);
      }
    }, this.cleanupInterval);
  }

  /**
   * Manually verify a message (for testing/admin)
   */
  manualVerify(messageId, verified = true) {
    return this.handleVerificationResult(messageId, {
      verified,
      source: 'manual',
      timestamp: Date.now()
    });
  }

  /**
   * Get gate info for debugging
   */
  getGateInfo(messageId) {
    return this.gates.get(messageId);
  }

  /**
   * Shutdown and cleanup
   */
  shutdown() {
    // Clear all timeouts
    for (const info of this.gates.values()) {
      if (info.timeoutTimer) {
        clearTimeout(info.timeoutTimer);
      }
    }

    // Clear gates
    this.gates.clear();

    console.log('[MessageGate] Shutdown complete');
  }
}

export { MessageGate, GateState, VERIFICATION_PATTERNS };