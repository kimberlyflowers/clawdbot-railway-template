/**
 * BLOOM Vera Integration
 * Integrates message-gating.js and vera-verification.js into the proxy response stream.
 * Buffers SSE responses, detects completion claims, verifies them, and either releases
 * or injects feedback back into the agent session.
 */

import { MessageGate, GateState } from './message-gating.js';
import { VeraVerification } from './vera-verification.js';
import { PassThrough } from 'stream';

/**
 * SSE Response buffer and parser
 */
class SSEBuffer {
  constructor() {
    this.chunks = [];
    this.fullContent = '';
    this.isComplete = false;
  }

  append(chunk) {
    this.chunks.push(chunk);
    this.fullContent += chunk.toString();
  }

  getFullContent() {
    return this.fullContent;
  }

  toBuffer() {
    return Buffer.concat(this.chunks);
  }
}

/**
 * Main Vera Integration Manager
 */
class VeraIntegration {
  constructor(options = {}) {
    this.gate = new MessageGate(options.gateOptions || {});
    this.vera = new VeraVerification(options.veraOptions || {});
    this.gatewayTarget = options.gatewayTarget || 'http://localhost:27182';
    this.gatewayToken = options.gatewayToken || process.env.OPENCLAW_GATEWAY_TOKEN;

    // Store reference to integration for callbacks
    const self = this;

    // Callbacks
    this.gate.onVerificationNeeded = (messageId, content) =>
      this.vera.verifyMessage(messageId, content);

    this.gate.onMessageReleased = (gateInfo) =>
      this.handleMessageReleased(gateInfo);

    this.gate.onVerificationFailed = (messageId, result, sessionKey) =>
      this.handleVerificationFailed(messageId, result, sessionKey);

    // Stats
    this.stats = {
      messagesIntercepted: 0,
      messagesVerified: 0,
      messagesFailed: 0,
      messagesReleased: 0,
      verificationErrors: 0,
      feedbacksInjected: 0
    };

    console.log('[VeraIntegration] Initialized with gateway target:', this.gatewayTarget);
  }

  /**
   * Process response stream from gateway
   * This is called from the onProxyRes hook in server.js
   */
  async processResponse(proxyRes, req, res) {
    // Don't intercept non-streaming responses
    const contentType = proxyRes.headers['content-type'] || '';
    const isStreaming = contentType.includes('text/event-stream') || contentType.includes('stream');

    if (!isStreaming) {
      // Pass through non-streaming responses
      return null; // Signal to proxy: use default behavior
    }

    console.log(`[VeraIntegration] Intercepting SSE response from ${req.path}`);

    if (!res.headersSent) {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
    }

    // Create buffers
    const sseBuffer = new SSEBuffer();
    let isResponseStarted = false;

    return new Promise((resolve) => {
      // Pipe response through our interception logic
      proxyRes.on('data', (chunk) => {
        sseBuffer.append(chunk);
      });

      proxyRes.on('end', async () => {
        try {
          const fullContent = sseBuffer.getFullContent();
          console.log(`[VeraIntegration] SSE stream complete, size: ${fullContent.length} bytes`);

          // Check if this response contains a completion claim
          const requiresGating = this.gate.requiresVerification(fullContent);

          if (!requiresGating) {
            // No gating needed - release immediately
            console.log('[VeraIntegration] No gating required, releasing response');
            res.write(sseBuffer.toBuffer());
            res.end();
            resolve();
            return;
          }

          // This message requires verification
          this.stats.messagesIntercepted++;
          console.log(`[VeraIntegration] Completion claim detected, gating response`);

          // Send "verifying" message to client
          this.sendVerifyingPlaceholder(res, fullContent);

          // Extract session key for callback use
          const sessionKey = this.extractSessionKey(req);

          // Buffer the message and start verification
          const messageId = this.gate.bufferMessage({
            content: fullContent,
            type: 'sse',
            originalProxyRes: proxyRes,
            originalRes: res,
            sessionKey,
            req  // Store original request for later use
          });

          if (messageId) {
            console.log(`[VeraIntegration] Message buffered: ${messageId} (session: ${sessionKey})`);
          }

          resolve();
        } catch (error) {
          console.error('[VeraIntegration] Error processing response:', error);
          this.stats.verificationErrors++;
          // On error, release response as-is
          res.write(sseBuffer.toBuffer());
          res.end();
          resolve();
        }
      });

      proxyRes.on('error', (error) => {
        console.error('[VeraIntegration] Proxy response error:', error);
        res.end();
        resolve();
      });
    });
  }

  /**
   * Send "verifying..." placeholder to client while verification happens
   */
  sendVerifyingPlaceholder(res, originalContent) {
    // Send SSE event indicating verification in progress
    const placeholder = `data: {"status":"verifying","message":"Almost there, finalizing...","original":"${originalContent.substring(0, 200)}"}\n\n`;
    res.write(placeholder);
    // Don't end the response yet - more events may come
  }

  /**
   * Handle verified message - release to client
   */
  async handleMessageReleased(gateInfo) {
    console.log(`[VeraIntegration] Releasing verified message: ${gateInfo.messageId}`);
    this.stats.messagesReleased++;

    if (gateInfo.type === 'sse' && gateInfo.res) {
      // Send release event
      const releaseEvent = `data: {"status":"verified","verified":true,"messageId":"${gateInfo.messageId}"}\n\n`;
      gateInfo.res.write(releaseEvent);

      // Send original content
      gateInfo.res.write(gateInfo.content);
      gateInfo.res.end();
    }
  }

  /**
   * Handle verification failure - inject feedback into session and close response
   */
  async handleVerificationFailed(messageId, result, sessionKey) {
    console.log(`[VeraIntegration] Verification failed for ${messageId}:`, result.reason);
    this.stats.messagesFailed++;

    // Inject feedback message back into the agent session
    const feedbackText = `Vera verification failed: ${result.reason}. Reason: ${result.evidence?.error || 'Unknown'}. Please retry.`;
    const injected = await this.injectFeedbackMessage(messageId, feedbackText, sessionKey);

    // Find the buffered gateInfo to close the client response
    const gateInfo = this.gate.gates?.get(messageId);
    if (gateInfo && gateInfo.res && !gateInfo.res.headersSent) {
      // Send verification_failed event to client (internal status, user never sees this)
      const reviewEvent = `data: {"status":"verification_failed","reason":"${result.reason}","messageId":"${messageId}"}\n\n`;
      gateInfo.res.write(reviewEvent);
      gateInfo.res.end();
    }

    if (injected) {
      this.stats.feedbacksInjected++;
    }
  }

  /**
   * Inject a feedback message back into the agent session
   *
   * This makes an API call back to the gateway to send the agent a message
   */
  async injectFeedbackMessage(messageId, feedbackText, sessionKey) {
    try {
      // Use provided session key, warn if not available
      if (!sessionKey) {
        console.warn(`[VeraIntegration] No session key provided for feedback injection (messageId: ${messageId})`);
        sessionKey = 'agent:main:main'; // Fallback only after warning
      }

      console.log(`[VeraIntegration] Injecting feedback to session ${sessionKey}: ${feedbackText}`);

      // Make API call to gateway to send message to agent via /hooks/agent endpoint
      const response = await fetch(`${this.gatewayTarget}/hooks/agent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.gatewayToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `⚠️ VERA: ${feedbackText}`,
          sessionKey,
          wakeMode: 'now',
          deliver: true
        })
      });

      if (response.ok) {
        console.log(`[VeraIntegration] Feedback injected successfully for ${sessionKey}`);
        return true;
      } else {
        const errorText = await response.text().catch(() => 'unknown error');
        console.error(`[VeraIntegration] Failed to inject feedback: ${response.status} ${errorText}`);
        return false;
      }
    } catch (error) {
      console.error('[VeraIntegration] Error injecting feedback:', error);
      return false;
    }
  }

  /**
   * Extract session key from request
   * Checks multiple sources: headers, query params, URL path
   */
  extractSessionKey(req) {
    // 1. Check x-session-key header
    const fromHeader = req.headers['x-session-key'];
    if (fromHeader) {
      console.log(`[VeraIntegration] Extracted session key from header: ${fromHeader}`);
      return fromHeader;
    }

    // 2. Check query parameter
    if (req.query && req.query.sessionKey) {
      console.log(`[VeraIntegration] Extracted session key from query: ${req.query.sessionKey}`);
      return req.query.sessionKey;
    }

    // 3. Parse from URL path patterns
    // Pattern 1: /sessions/{sessionKey}/...
    let match = req.path.match(/\/sessions\/([^/?]+)/);
    if (match) {
      console.log(`[VeraIntegration] Extracted session key from path /sessions/: ${match[1]}`);
      return match[1];
    }

    // Pattern 2: /agent/{agentId}/sessions/{sessionKey}/...
    match = req.path.match(/\/agent\/[^/]+\/sessions\/([^/?]+)/);
    if (match) {
      console.log(`[VeraIntegration] Extracted session key from path /agent/.../sessions/: ${match[1]}`);
      return match[1];
    }

    // No session key found - warn and use fallback
    console.warn(`[VeraIntegration] Could not extract session key from request:
  - Path: ${req.path}
  - Headers: ${JSON.stringify(req.headers)}
  - Query: ${JSON.stringify(req.query)}
  Using fallback: agent:main:main`);

    return 'agent:main:main';
  }

  /**
   * Middleware to verify gateway token for admin endpoints
   */
  requireGatewayToken() {
    return (req, res, next) => {
      const authHeader = req.headers.authorization || '';
      const tokenMatch = authHeader.match(/Bearer\s+(.+)/);
      const token = tokenMatch?.[1] || req.headers['x-openclaw-token'];

      if (!token || token !== this.gatewayToken) {
        return res.status(401).json({ error: 'Unauthorized: invalid or missing token' });
      }

      next();
    };
  }

  /**
   * Admin endpoint: /vera/stats
   */
  getStats() {
    return {
      integration: this.stats,
      gate: this.gate.getStats(),
      vera: this.vera.getStats(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Admin endpoint: /vera/status
   */
  getStatus() {
    const gateStats = this.gate.getStats();
    const healthy = gateStats.totalGates < 50 && gateStats.states.failed === 0;

    return {
      healthy,
      status: healthy ? 'operational' : 'degraded',
      bufferedMessages: gateStats.totalGates,
      states: gateStats.states,
      stats: this.stats,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Shutdown
   */
  shutdown() {
    this.gate.shutdown();
    console.log('[VeraIntegration] Shutdown complete');
  }
}

export { VeraIntegration, SSEBuffer };