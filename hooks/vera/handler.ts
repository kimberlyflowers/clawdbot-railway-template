/**
 * Vera Verification Hook - Simple Self-Contained Version
 * Intercepts completion claims and verifies via external service
 * No local dependencies - pure verification gateway
 */

const https = require('https');
const http = require('http');

const COMPLETION_PATTERNS = [
  /\b(done|completed|finished|sent|scheduled|created|updated|posted|replied)\b/i,
  /\b(email sent|message sent|call made|meeting scheduled|file uploaded)\b/i,
  /\b(task complete|all set|ready to go)\b/i
];

async function verifyWithService(content) {
  return new Promise((resolve) => {
    const serviceUrl = process.env.VERA_SERVICE_URL;
    if (!serviceUrl) {
      console.log('[Vera] VERA_SERVICE_URL not configured - allowing through');
      resolve({ verified: true });
      return;
    }
    const url = new URL(serviceUrl);
    const client = url.protocol === 'https:' ? https : http;
    const postData = JSON.stringify({ content, type: 'completion_claim' });
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': postData.length }
    };
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { resolve({ verified: false, reason: 'Service response error' }); }
      });
    });
    req.on('error', () => resolve({ verified: false, reason: 'Service unavailable' }));
    req.setTimeout(5000, () => resolve({ verified: false, reason: 'Verification timeout' }));
    req.write(postData);
    req.end();
  });
}

module.exports = async (event) => {
  if (event.type !== 'message:sent') return;
  const { content } = event.context;
  const hasCompletionClaim = COMPLETION_PATTERNS.some(p => p.test(content));
  if (!hasCompletionClaim) return;
  const result = await verifyWithService(content);
  if (result.verified) {
    console.log('[Vera] Claim verified - allowing delivery');
    return;
  }
  console.log(`[Vera] Claim failed: ${result.reason}`);
  return { block: true, reason: `Verification required: ${result.reason || 'Unable to verify completion claim'}` };
};