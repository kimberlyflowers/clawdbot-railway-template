#!/usr/bin/env node

/**
 * 🌸 BLOOM Desktop Bridge Server
 * 
 * Runs alongside OpenClaw gateway to handle /desktop WebSocket route
 * Bridges BLOOM Desktop sessions with skill requests
 */

const WebSocket = require('ws');
const http = require('http');
const crypto = require('crypto');

// Desktop session management
const sessions = new Map();
const userSessions = new Map();

const PORT = process.env.DESKTOP_BRIDGE_PORT || 18790;

// Create HTTP server
const server = http.createServer((req, res) => {
  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      sessions: sessions.size,
      sessionIds: Array.from(sessions.keys())
    }));
    return;
  }
  
  // List sessions endpoint
  if (req.url === '/api/sessions' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const sessionList = Array.from(sessions.values()).map(s => ({
      id: s.id,
      userId: s.userId,
      hasPermission: s.hasPermission,
      connectedAt: s.connectedAt
    }));
    res.end(JSON.stringify({ ok: true, sessions: sessionList }));
    return;
  }
  
  // API endpoint to send commands to sessions
  if (req.method === 'POST' && req.url.startsWith('/api/command')) {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { sessionId, action, payload } = data;
        
        if (!sessionId || !action) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Missing sessionId or action' }));
          return;
        }
        
        const session = sessions.get(sessionId);
        if (!session || session.socket.readyState !== WebSocket.OPEN) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Session not found or closed' }));
          return;
        }
        
        // Send command to desktop
        const commandId = crypto.randomBytes(8).toString('hex');
        const timeout = setTimeout(() => {
          res.writeHead(408);
          res.end(JSON.stringify({ error: 'Command timeout' }));
        }, 30000);
        
        const responseHandler = (msg) => {
          try {
            const response = JSON.parse(msg);
            if (response.commandId === commandId) {
              clearTimeout(timeout);
              session.socket.off('message', responseHandler);
              res.writeHead(200);
              res.end(JSON.stringify(response));
            }
          } catch (e) {
            // Not a JSON response for this command
          }
        };
        
        session.socket.on('message', responseHandler);
        
        session.socket.send(JSON.stringify({
          commandId,
          action,
          data: payload || {},
          timestamp: Date.now()
        }));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }
  
  res.writeHead(404);
  res.end('Not found');
});

// Create WebSocket server for /desktop
const wss = new WebSocket.Server({ server, path: '/desktop' });

wss.on('connection', (socket, req) => {
  const sessionId = `desktop_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const urlParams = new URLSearchParams(req.url.split('?')[1] || '');
  const userId = urlParams.get('userId') || undefined;
  
  const session = {
    id: sessionId,
    socket,
    userId,
    hasPermission: false,
    connectedAt: Date.now(),
    lastActivity: Date.now()
  };
  
  sessions.set(sessionId, session);
  if (userId) {
    userSessions.set(userId, session);
  }
  
  console.log(`[${sessionId}] Desktop connected (user: ${userId || 'unknown'})`);
  
  socket.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      session.lastActivity = Date.now();
      
      // Handle permission requests
      if (data.action === 'request_permission') {
        session.hasPermission = true;
        socket.send(JSON.stringify({
          commandId: data.commandId,
          ok: true,
          action: 'permission_granted',
          timestamp: Date.now()
        }));
        console.log(`[${sessionId}] Permission granted`);
      }
    } catch (error) {
      console.error(`[${sessionId}] Failed to parse message:`, error.message);
    }
  });
  
  socket.on('close', () => {
    sessions.delete(sessionId);
    if (session.userId) {
      userSessions.delete(session.userId);
    }
    console.log(`[${sessionId}] Desktop disconnected`);
  });
  
  socket.on('error', (error) => {
    console.error(`[${sessionId}] Socket error:`, error.message);
    sessions.delete(sessionId);
    if (session.userId) {
      userSessions.delete(session.userId);
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🌸 BLOOM Desktop Bridge Server running on ws://127.0.0.1:${PORT}/desktop`);
  console.log(`API endpoint: http://127.0.0.1:${PORT}/api/command`);
  console.log(`Health check: http://127.0.0.1:${PORT}/health`);
});

process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.close(() => {
    process.exit(0);
  });
});
