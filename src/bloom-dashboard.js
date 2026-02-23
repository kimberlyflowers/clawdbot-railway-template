/**
 * BLOOM Dashboard System
 *
 * Web interface for monitoring Vera verification activities.
 * Serves dashboard UI from the Express proxy server.
 * Provides real-time visibility into message gating and verification.
 */

const fs = require('node:fs');
const path = require('node:path');

/**
 * BLOOM Dashboard serving and API logic
 */
class BloomDashboard {
  constructor(messageGate, veraVerification) {
    this.messageGate = messageGate;
    this.veraVerification = veraVerification;
    this.stats = {
      startTime: Date.now(),
      totalMessages: 0,
      totalVerifications: 0,
      verificationSuccesses: 0,
      verificationFailures: 0
    };
  }

  /**
   * Setup Express routes for dashboard
   */
  setupRoutes(app) {
    // Main dashboard route
    app.get('/bloom', (req, res) => {
      res.type('html').send(this.getDashboardHTML());
    });

    // API endpoints
    app.get('/bloom/api/stats', (req, res) => {
      res.json(this.getSystemStats());
    });

    app.get('/bloom/api/gates', (req, res) => {
      res.json(this.getGateStatus());
    });

    app.get('/bloom/api/audit', (req, res) => {
      this.getAuditLog(req, res);
    });

    app.post('/bloom/api/verify/:messageId', (req, res) => {
      this.manualVerify(req, res);
    });

    app.post('/bloom/api/release/:messageId', (req, res) => {
      this.manualRelease(req, res);
    });

    // Static assets for dashboard
    app.get('/bloom/dashboard.js', (req, res) => {
      res.type('application/javascript').send(this.getDashboardJS());
    });

    app.get('/bloom/dashboard.css', (req, res) => {
      res.type('text/css').send(this.getDashboardCSS());
    });
  }

  /**
   * Get system statistics for dashboard
   */
  getSystemStats() {
    const gateStats = this.messageGate.getStats();
    const veraStats = this.veraVerification.getStats();

    return {
      uptime: Date.now() - this.stats.startTime,
      totalMessages: this.stats.totalMessages,
      totalVerifications: this.stats.totalVerifications,
      successRate: this.stats.totalVerifications > 0 ?
        (this.stats.verificationSuccesses / this.stats.totalVerifications * 100).toFixed(1) : 0,
      gates: gateStats,
      verification: veraStats,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get current gate status
   */
  getGateStatus() {
    const gates = [];
    for (const [id, info] of this.messageGate.gates) {
      gates.push({
        messageId: id,
        state: info.state,
        content: info.content.substring(0, 200) + (info.content.length > 200 ? '...' : ''),
        timestamp: info.timestamp,
        age: Date.now() - info.timestamp
      });
    }

    return {
      gates: gates.sort((a, b) => b.timestamp - a.timestamp),
      total: gates.length
    };
  }

  /**
   * Get audit log entries
   */
  async getAuditLog(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const auditPath = this.veraVerification.config.auditLogPath;

      if (!fs.existsSync(auditPath)) {
        return res.json({ entries: [], total: 0 });
      }

      const content = await fs.promises.readFile(auditPath, 'utf8');
      const lines = content.trim().split('\n').filter(line => line);
      const entries = lines.slice(-limit).map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(entry => entry).reverse();

      res.json({
        entries,
        total: lines.length,
        showing: entries.length
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Manual verification endpoint
   */
  async manualVerify(req, res) {
    try {
      const { messageId } = req.params;
      const { verified = true } = req.body;

      this.messageGate.manualVerify(messageId, verified);

      res.json({
        success: true,
        messageId,
        verified,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Manual release endpoint
   */
  async manualRelease(req, res) {
    try {
      const { messageId } = req.params;

      this.messageGate.releaseMessage(messageId);

      res.json({
        success: true,
        messageId,
        action: 'released',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update statistics (called by message gate events)
   */
  updateStats(event) {
    switch (event.type) {
      case 'message_buffered':
        this.stats.totalMessages++;
        break;
      case 'verification_started':
        this.stats.totalVerifications++;
        break;
      case 'verification_success':
        this.stats.verificationSuccesses++;
        break;
      case 'verification_failure':
        this.stats.verificationFailures++;
        break;
    }
  }

  /**
   * Generate dashboard HTML
   */
  getDashboardHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BLOOM Verification Dashboard</title>
  <link rel="stylesheet" href="/bloom/dashboard.css">
</head>
<body>
  <header>
    <h1>🌸 BLOOM Verification Dashboard</h1>
    <p>Real-time monitoring of Vera's verification activities</p>
  </header>

  <main>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>System Status</h3>
        <div id="system-status">
          <div class="status-item">
            <span class="label">Uptime:</span>
            <span id="uptime">Loading...</span>
          </div>
          <div class="status-item">
            <span class="label">Total Messages:</span>
            <span id="total-messages">0</span>
          </div>
          <div class="status-item">
            <span class="label">Success Rate:</span>
            <span id="success-rate">0%</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <h3>Verification Config</h3>
        <div id="verification-config">
          <div class="config-item">
            <span class="label">GHL API:</span>
            <span id="ghl-status" class="status-badge">Checking...</span>
          </div>
          <div class="config-item">
            <span class="label">Google Drive:</span>
            <span id="google-status" class="status-badge">Checking...</span>
          </div>
          <div class="config-item">
            <span class="label">Railway:</span>
            <span id="railway-status" class="status-badge">Checking...</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <h3>Message Gates</h3>
        <div id="gates-summary">
          <div class="gates-count">
            <span id="active-gates">0</span> active gates
          </div>
          <div class="gates-breakdown" id="gates-breakdown">
            Loading...
          </div>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <section class="gates-section">
        <h2>Active Message Gates</h2>
        <div id="gates-list">
          <div class="loading">Loading gates...</div>
        </div>
      </section>

      <section class="audit-section">
        <h2>Verification Audit Log</h2>
        <div class="audit-controls">
          <button id="refresh-audit">Refresh</button>
          <button id="download-audit">Download Full Log</button>
        </div>
        <div id="audit-list">
          <div class="loading">Loading audit entries...</div>
        </div>
      </section>
    </div>
  </main>

  <script src="/bloom/dashboard.js"></script>
</body>
</html>`;
  }

  /**
   * Generate dashboard JavaScript
   */
  getDashboardJS() {
    return `
// BLOOM Dashboard Client-Side Logic

class BloomDashboardClient {
  constructor() {
    this.refreshInterval = 5000; // 5 seconds
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.startAutoRefresh();
    this.loadInitialData();
  }

  setupEventListeners() {
    document.getElementById('refresh-audit').addEventListener('click', () => {
      this.loadAuditLog();
    });

    document.getElementById('download-audit').addEventListener('click', () => {
      window.open('/bloom/api/audit?limit=1000', '_blank');
    });
  }

  startAutoRefresh() {
    setInterval(() => {
      this.loadStats();
      this.loadGates();
    }, this.refreshInterval);
  }

  loadInitialData() {
    this.loadStats();
    this.loadGates();
    this.loadAuditLog();
  }

  async loadStats() {
    try {
      const response = await fetch('/bloom/api/stats');
      const stats = await response.json();

      document.getElementById('uptime').textContent = this.formatUptime(stats.uptime);
      document.getElementById('total-messages').textContent = stats.totalMessages;
      document.getElementById('success-rate').textContent = stats.successRate + '%';

      // Update verification config status
      document.getElementById('ghl-status').textContent = stats.verification.configured.ghl ? 'Connected' : 'Not Configured';
      document.getElementById('ghl-status').className = 'status-badge ' + (stats.verification.configured.ghl ? 'connected' : 'disconnected');

      document.getElementById('google-status').textContent = stats.verification.configured.google ? 'Connected' : 'Not Configured';
      document.getElementById('google-status').className = 'status-badge ' + (stats.verification.configured.google ? 'connected' : 'disconnected');

      document.getElementById('railway-status').textContent = stats.verification.configured.railway ? 'Connected' : 'Not Configured';
      document.getElementById('railway-status').className = 'status-badge ' + (stats.verification.configured.railway ? 'connected' : 'disconnected');

    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  async loadGates() {
    try {
      const response = await fetch('/bloom/api/gates');
      const data = await response.json();

      document.getElementById('active-gates').textContent = data.total;

      // Update gates breakdown
      const breakdown = document.getElementById('gates-breakdown');
      const states = {};
      data.gates.forEach(gate => {
        states[gate.state] = (states[gate.state] || 0) + 1;
      });

      breakdown.innerHTML = Object.entries(states)
        .map(([state, count]) => \`<span class="state-\${state}">\${state}: \${count}</span>\`)
        .join(' | ');

      // Update gates list
      this.updateGatesList(data.gates);

    } catch (error) {
      console.error('Failed to load gates:', error);
    }
  }

  updateGatesList(gates) {
    const container = document.getElementById('gates-list');

    if (gates.length === 0) {
      container.innerHTML = '<div class="empty">No active message gates</div>';
      return;
    }

    container.innerHTML = gates.map(gate => \`
      <div class="gate-item state-\${gate.state}">
        <div class="gate-header">
          <span class="gate-id">\${gate.messageId.substring(0, 8)}...</span>
          <span class="gate-state">\${gate.state}</span>
          <span class="gate-age">\${this.formatAge(gate.age)}</span>
        </div>
        <div class="gate-content">\${gate.content}</div>
        <div class="gate-actions">
          <button onclick="dashboard.manualVerify('\${gate.messageId}', true)">✓ Verify</button>
          <button onclick="dashboard.manualVerify('\${gate.messageId}', false)">✗ Reject</button>
          <button onclick="dashboard.manualRelease('\${gate.messageId}')">⚡ Release</button>
        </div>
      </div>
    \`).join('');
  }

  async loadAuditLog() {
    try {
      const response = await fetch('/bloom/api/audit?limit=20');
      const data = await response.json();

      const container = document.getElementById('audit-list');

      if (data.entries.length === 0) {
        container.innerHTML = '<div class="empty">No audit entries yet</div>';
        return;
      }

      container.innerHTML = data.entries.map(entry => \`
        <div class="audit-item \${entry.result ? (entry.result.verified ? 'verified' : 'failed') : 'error'}">
          <div class="audit-header">
            <span class="audit-time">\${new Date(entry.timestamp).toLocaleTimeString()}</span>
            <span class="audit-duration">\${entry.duration}ms</span>
            \${entry.result ? \`<span class="audit-result \${entry.result.verified ? 'verified' : 'failed'}">\${entry.result.verified ? 'VERIFIED' : 'FAILED'}</span>\` : '<span class="audit-result error">ERROR</span>'}
          </div>
          <div class="audit-content">\${entry.content ? entry.content.substring(0, 150) + (entry.content.length > 150 ? '...' : '') : 'No content'}</div>
          \${entry.result ? \`<div class="audit-reason">\${entry.result.reason || 'No reason provided'}</div>\` : ''}
        </div>
      \`).join('');

    } catch (error) {
      console.error('Failed to load audit log:', error);
    }
  }

  async manualVerify(messageId, verified) {
    try {
      const response = await fetch(\`/bloom/api/verify/\${messageId}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified })
      });

      if (response.ok) {
        this.loadGates(); // Refresh gates
        this.loadAuditLog(); // Refresh audit
      } else {
        alert('Failed to verify message');
      }

    } catch (error) {
      console.error('Manual verification failed:', error);
      alert('Verification request failed');
    }
  }

  async manualRelease(messageId) {
    try {
      const response = await fetch(\`/bloom/api/release/\${messageId}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        this.loadGates(); // Refresh gates
      } else {
        alert('Failed to release message');
      }

    } catch (error) {
      console.error('Manual release failed:', error);
      alert('Release request failed');
    }
  }

  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return \`\${days}d \${hours % 24}h\`;
    if (hours > 0) return \`\${hours}h \${minutes % 60}m\`;
    if (minutes > 0) return \`\${minutes}m \${seconds % 60}s\`;
    return \`\${seconds}s\`;
  }

  formatAge(ms) {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return \`\${seconds}s\`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return \`\${minutes}m\`;
    const hours = Math.floor(minutes / 60);
    return \`\${hours}h\`;
  }
}

// Initialize dashboard
const dashboard = new BloomDashboardClient();
`;
  }

  /**
   * Generate dashboard CSS
   */
  getDashboardCSS() {
    return `
/* BLOOM Dashboard Styles */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f7fa;
  color: #333;
  line-height: 1.6;
}

header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

header p {
  opacity: 0.9;
  font-size: 1.1rem;
}

main {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border: 1px solid #e1e8ed;
}

.stat-card h3 {
  color: #666;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-item, .config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.status-item:last-child, .config-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #666;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.connected {
  background: #d4edda;
  color: #155724;
}

.status-badge.disconnected {
  background: #f8d7da;
  color: #721c24;
}

.gates-count {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.gates-breakdown {
  font-size: 0.9rem;
  color: #666;
}

.gates-breakdown span {
  margin-right: 0.5rem;
}

.gates-section, .audit-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border: 1px solid #e1e8ed;
}

.gates-section h2, .audit-section h2 {
  margin-bottom: 1rem;
  color: #333;
}

.audit-controls {
  margin-bottom: 1rem;
}

.audit-controls button {
  margin-right: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
}

.audit-controls button:hover {
  background: #f8f9fa;
}

.gate-item {
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: white;
}

.gate-item.state-verifying {
  border-left: 4px solid #ffc107;
}

.gate-item.state-verified {
  border-left: 4px solid #28a745;
}

.gate-item.state-failed {
  border-left: 4px solid #dc3545;
}

.gate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.gate-id {
  font-family: monospace;
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.gate-state {
  text-transform: uppercase;
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.gate-content {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  line-height: 1.4;
}

.gate-actions {
  display: flex;
  gap: 0.5rem;
}

.gate-actions button {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
}

.gate-actions button:nth-child(1) {
  background: #28a745;
  color: white;
}

.gate-actions button:nth-child(2) {
  background: #dc3545;
  color: white;
}

.gate-actions button:nth-child(3) {
  background: #6c757d;
  color: white;
}

.audit-item {
  border-left: 4px solid #e1e8ed;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8f9fa;
  border-radius: 0 6px 6px 0;
}

.audit-item.verified {
  border-left-color: #28a745;
}

.audit-item.failed {
  border-left-color: #dc3545;
}

.audit-item.error {
  border-left-color: #fd7e14;
}

.audit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.audit-result {
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.audit-result.verified {
  background: #d4edda;
  color: #155724;
}

.audit-result.failed {
  background: #f8d7da;
  color: #721c24;
}

.audit-result.error {
  background: #fff3cd;
  color: #856404;
}

.audit-content {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.audit-reason {
  font-size: 0.8rem;
  color: #666;
  font-style: italic;
}

.loading, .empty {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 2rem;
}
`;
  }
}

module.exports = { BloomDashboard };