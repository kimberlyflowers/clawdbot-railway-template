const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const httpProxy = require('http-proxy');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const tar = require('tar');

const app = express();
const server = http.createServer(app);
const proxy = httpProxy.createProxyServer({ ws: true });

// CRITICAL: Handle proxy errors to prevent server crashes
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err.message);
  if (res && !res.headersSent) {
    res.status(502).json({ error: 'Gateway not ready' });
  }
});

// Desktop WebSocket server
const wss = new WebSocket.Server({ noServer: true });

// Store active desktop connections
const desktopConnections = new Map();

const PORT = process.env.OPENCLAW_PUBLIC_PORT || process.env.PORT || 8080;
const OPENCLAW_NODE = process.env.OPENCLAW_NODE || 'node';
const OPENCLAW_ENTRY = process.env.OPENCLAW_ENTRY || '/openclaw/dist/entry.js';
const GATEWAY_TARGET = 'http://127.0.0.1:8000';

let gatewayProcess = null;

// UUID v4 generator for older Node.js versions
const generateUUID = () => {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older Node.js versions
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Middleware
app.use(express.json({ limit: '1mb' }));

// Basic auth middleware
const requireSetupAuth = (req, res, next) => {
  const setupPassword = process.env.SETUP_PASSWORD;
  if (!setupPassword) {
    return res.status(401).json({ error: 'SETUP_PASSWORD not configured' });
  }

  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Setup"');
    return res.status(401).json({ error: 'Authentication required' });
  }

  const credentials = Buffer.from(auth.slice(6), 'base64').toString();
  const [username, password] = credentials.split(':');

  if (password !== setupPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  next();
};

// Ensure directories exist
const ensureDirectories = () => {
  const stateDir = path.join(__dirname, '..', 'data', 'state');
  const workspaceDir = path.join(__dirname, '..', 'data', 'workspace');

  fs.mkdirSync(stateDir, { recursive: true });
  fs.mkdirSync(workspaceDir, { recursive: true });
};

// Ensure gateway is running
const ensureGatewayRunning = async () => {
  if (gatewayProcess && !gatewayProcess.killed) {
    return;
  }

  return new Promise((resolve, reject) => {
    const dataDir = path.join(__dirname, '..', 'data');

    gatewayProcess = spawn(OPENCLAW_NODE, [OPENCLAW_ENTRY], {
      cwd: dataDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        OPENCLAW_DATA_DIR: dataDir
      }
    });

    gatewayProcess.on('error', reject);

    // Give gateway time to start
    setTimeout(resolve, 2000);
  });
};

// Desktop WebSocket endpoint with proper error handling
server.on('upgrade', (request, socket, head) => {
  try {
    const { pathname } = new URL(request.url, 'http://localhost');

    if (pathname === '/desktop') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        handleDesktopConnection(ws, request);
      });
    } else {
      // Proxy other WebSocket connections to gateway with error handling
      ensureGatewayRunning()
        .then(() => {
          proxy.ws(request, socket, head, { target: GATEWAY_TARGET });
        })
        .catch((error) => {
          console.error('Failed to ensure gateway running for WebSocket:', error);
          socket.destroy();
        });
    }
  } catch (error) {
    console.error('WebSocket upgrade error:', error);
    socket.destroy();
  }
});

// Handle desktop WebSocket connections
const handleDesktopConnection = (ws, request) => {
  console.log('Desktop client connected');

  let isAuthenticated = false;
  let customerToken = null;
  let agentName = 'Jaden'; // Default agent name
  let sessionId = generateUUID(); // Use compatible UUID function

  // Store connection
  desktopConnections.set(sessionId, {
    ws,
    isAuthenticated,
    customerToken,
    lastFrame: null,
    hasPermission: false
  });

  ws.on('message', async (data) => {
    try {
      let message;

      // Check if it's binary data (screen frame)
      if (data instanceof Buffer && data.length > 1000) {
        // Handle screen frame
        const connection = desktopConnections.get(sessionId);
        if (connection && connection.isAuthenticated) {
          connection.lastFrame = data;
          console.log(`Received screen frame: ${data.length} bytes`);
          // Process frame with Claude Vision if needed
          await processScreenFrame(data, sessionId);
        }
        return;
      }

      // Parse JSON message
      message = JSON.parse(data.toString());
      console.log('Desktop message:', message.type);

      switch (message.type) {
        case 'auth':
          await handleAuth(ws, message, sessionId);
          break;

        case 'permission_granted':
          await handlePermissionGranted(ws, message, sessionId);
          break;

        case 'permission_denied':
          await handlePermissionDenied(ws, message, sessionId);
          break;

        case 'permission_revoked':
          await handlePermissionRevoked(ws, message, sessionId);
          break;

        case 'heartbeat_response':
          // Keep connection alive
          break;

        default:
          console.log('Unknown desktop message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling desktop message:', error);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'error', error: error.message }));
      }
    }
  });

  ws.on('close', () => {
    console.log('Desktop client disconnected');
    desktopConnections.delete(sessionId);
  });

  ws.on('error', (error) => {
    console.error('Desktop WebSocket error:', error);
    desktopConnections.delete(sessionId);
  });

  // Send heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'heartbeat' }));
    } else {
      clearInterval(heartbeat);
    }
  }, 30000);
};

// Authentication handler
const handleAuth = async (ws, message, sessionId) => {
  const { token, clientType, platform, version } = message;

  // TODO: Validate token against customer database
  // For now, accept any token that looks valid
  if (!token || token.length < 10) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'auth_failed',
        reason: 'Invalid token'
      }));
    }
    return;
  }

  const connection = desktopConnections.get(sessionId);
  if (connection) {
    connection.isAuthenticated = true;
    connection.customerToken = token;
  }

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'auth_success',
      agentName: 'Jaden',
      permissions: ['desktop_control']
    }));
  }

  console.log(`Desktop client authenticated with token: ${token.substring(0, 10)}...`);
};

// Permission handlers
const handlePermissionGranted = async (ws, message, sessionId) => {
  const connection = desktopConnections.get(sessionId);
  if (connection) {
    connection.hasPermission = true;
  }

  // Start session
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'session_start',
      sessionId,
      task: 'Desktop control session started'
    }));
  }

  console.log(`Permission granted for session ${sessionId}, watchLive: ${message.watchLive}`);
};

const handlePermissionDenied = async (ws, message, sessionId) => {
  console.log(`Permission denied for session ${sessionId}`);
};

const handlePermissionRevoked = async (ws, message, sessionId) => {
  const connection = desktopConnections.get(sessionId);
  if (connection) {
    connection.hasPermission = false;
  }

  console.log(`Permission revoked for session ${sessionId}: ${message.reason}`);
};

// Process screen frame with Claude Vision
const processScreenFrame = async (frameData, sessionId) => {
  // This would integrate with Claude Vision API
  // For now, just log the frame size
  console.log(`Processing screen frame for session ${sessionId}: ${frameData.length} bytes`);

  // TODO: Send to Claude Vision API for analysis
  // TODO: Store frame for UI element detection
};

// API Functions for skills to use

// Request screen permission
const requestScreenPermission = (sessionId, reason) => {
  const connection = desktopConnections.get(sessionId);
  if (!connection || !connection.isAuthenticated) {
    throw new Error('Desktop not connected or authenticated');
  }

  if (connection.ws.readyState === WebSocket.OPEN) {
    connection.ws.send(JSON.stringify({
      type: 'permission_request',
      reason,
      sessionId
    }));
  }
};

// Send command to desktop
const sendDesktopCommand = (sessionId, action, data) => {
  const connection = desktopConnections.get(sessionId);
  if (!connection || !connection.isAuthenticated || !connection.hasPermission) {
    throw new Error('Desktop not ready or permission not granted');
  }

  const commandId = generateUUID();
  if (connection.ws.readyState === WebSocket.OPEN) {
    connection.ws.send(JSON.stringify({
      type: 'command',
      action,
      data,
      commandId
    }));
  }

  return commandId;
};

// Get active desktop sessions
const getDesktopSessions = () => {
  return Array.from(desktopConnections.entries()).map(([sessionId, connection]) => ({
    sessionId,
    isAuthenticated: connection.isAuthenticated,
    hasPermission: connection.hasPermission,
    hasRecentFrame: !!connection.lastFrame
  }));
};

// Export functions for skills
global.desktopAPI = {
  requestScreenPermission,
  sendDesktopCommand,
  getDesktopSessions
};

// Health check endpoints FIRST - before any auth or gateway requirements
app.get('/health', (req, res) => {
  console.log('Healthcheck hit:', req.path);
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'openclaw-wrapper',
    desktop_endpoint: '/desktop'
  });
});

app.get('/healthz', (req, res) => {
  console.log('Healthcheck hit:', req.path);
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'openclaw-wrapper',
    desktop_endpoint: '/desktop'
  });
});

app.get('/setup/healthz', (req, res) => {
  console.log('Healthcheck hit:', req.path);
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'openclaw-wrapper',
    desktop_endpoint: '/desktop'
  });
});

// Root path handler for basic checks
app.get('/', (req, res) => {
  console.log('Root path hit');
  res.status(200).json({
    status: 'ok',
    message: 'OpenClaw Railway Wrapper',
    endpoints: {
      setup: '/setup/',
      desktop: '/desktop',
      health: '/healthz'
    }
  });
});

// Setup routes (existing routes...)
app.get('/setup/', requireSetupAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'setup-app.html'));
});

app.get('/setup/api/status', requireSetupAuth, (req, res) => {
  // Return current status
  res.json({
    configured: fs.existsSync(path.join(__dirname, '..', 'data', 'state', 'gateway.token')),
    desktopSessions: getDesktopSessions().length
  });
});

// Export/Import routes (abbreviated for space)
app.get('/setup/export', requireSetupAuth, (req, res) => {
  const dataDir = path.join(__dirname, '..', 'data');
  res.attachment('openclaw-backup.tar.gz');
  tar.c({ gzip: true, C: dataDir }, ['.'])
    .pipe(res);
});

// Proxy all other requests to gateway with error handling
app.use(async (req, res) => {
  try {
    await ensureGatewayRunning();
    proxy.web(req, res, { target: GATEWAY_TARGET });
  } catch (error) {
    console.error('Failed to ensure gateway running:', error);
    res.status(500).json({ error: 'Gateway not available' });
  }
});

// Initialize and start server
ensureDirectories();
server.listen(PORT, () => {
  console.log(`OpenClaw Railway wrapper listening on port ${PORT}`);
  console.log(`Desktop WebSocket endpoint available at /desktop`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  if (gatewayProcess) {
    gatewayProcess.kill();
  }
  server.close();
});