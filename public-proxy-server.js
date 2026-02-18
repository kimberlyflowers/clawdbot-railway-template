#!/usr/bin/env node

/**
 * 🌸 Public Proxy Server
 * 
 * Runs on port 8080 (publicly exposed by Railway)
 * Routes /desktop WebSocket traffic to local bridge server
 * Routes everything else to main gateway
 */

const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const BRIDGE_PORT = 9000;
const GATEWAY_PORT = process.env.GATEWAY_PORT || 3000;

// Create HTTP server
const server = http.createServer((req, res) => {
  // Route health checks
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'proxy' }));
    return;
  }
  
  // Forward API calls to bridge
  if (req.url.startsWith('/api/')) {
    forwardToBridge(req, res);
    return;
  }
  
  // For now, just return 404 for everything else
  res.writeHead(404);
  res.end('Not found');
});

// WebSocket server for /desktop
const wss = new WebSocket.Server({ server, path: '/desktop' });

wss.on('connection', (socket, req) => {
  console.log(`[proxy] New WebSocket connection for /desktop from ${req.socket.remoteAddress}`);
  
  // Create connection to local bridge server
  const bridgeWsUrl = `ws://127.0.0.1:${BRIDGE_PORT}/desktop?${req.url.split('?')[1] || ''}`;
  
  const bridgeSocket = new WebSocket(bridgeWsUrl);
  
  bridgeSocket.on('open', () => {
    console.log(`[proxy] Connected to bridge server`);
    
    // Forward messages from client to bridge
    socket.on('message', (msg) => {
      if (bridgeSocket.readyState === WebSocket.OPEN) {
        bridgeSocket.send(msg);
      }
    });
    
    // Forward messages from bridge to client
    bridgeSocket.on('message', (msg) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(msg);
      }
    });
    
    socket.on('close', () => {
      if (bridgeSocket.readyState === WebSocket.OPEN) {
        bridgeSocket.close();
      }
    });
    
    bridgeSocket.on('close', () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    });
  });
  
  bridgeSocket.on('error', (error) => {
    console.error(`[proxy] Bridge connection error:`, error.message);
    socket.close();
  });
  
  socket.on('error', (error) => {
    console.error(`[proxy] Client connection error:`, error.message);
    if (bridgeSocket.readyState === WebSocket.OPEN) {
      bridgeSocket.close();
    }
  });
});

/**
 * Forward HTTP requests to bridge server
 */
function forwardToBridge(req, res) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk;
  });
  
  req.on('end', () => {
    const options = {
      hostname: '127.0.0.1',
      port: BRIDGE_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (error) => {
      console.error(`[proxy] Bridge request error:`, error.message);
      res.writeHead(502);
      res.end('Bad Gateway');
    });
    
    if (body) {
      proxyReq.write(body);
    }
    proxyReq.end();
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌸 Public Proxy Server running on port ${PORT}`);
  console.log(`   Public WebSocket: wss://openclaw-railway-template-production-b301.up.railway.app/desktop`);
  console.log(`   Public API: https://openclaw-railway-template-production-b301.up.railway.app/api/`);
  console.log(`   Routing /desktop → bridge:${BRIDGE_PORT}`);
});

process.on('SIGINT', () => {
  console.log('Shutting down proxy...');
  server.close(() => {
    process.exit(0);
  });
});
