#!/usr/bin/env node
/**
 * Bloomie Dashboard Express Server
 * Serves Vite-built dashboard + proxies OpenClaw Gateway
 */

const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 8080;
const gatewayHost = process.env.GATEWAY_HOST || '127.0.0.1';
const gatewayPort = process.env.GATEWAY_PORT || 18789;

console.log(`[Bloomie] Starting dashboard server on port ${port}`);
console.log(`[Bloomie] Gateway target: ${gatewayHost}:${gatewayPort}`);

// Serve Vite-built dashboard
const distPath = path.join(__dirname, 'bloomie-vite', 'dist');
app.use(express.static(distPath));

// Proxy OpenClaw WebSocket and HTTP APIs to gateway
app.use('/__openclaw__', createProxyMiddleware({
  target: `http://${gatewayHost}:${gatewayPort}`,
  changeOrigin: true,
  pathRewrite: {
    '^/__openclaw__': ''
  },
  ws: true,  // Enable WebSocket proxying
  onError: (err, req, res) => {
    console.error(`[Bloomie] Proxy error:`, err.message);
    res.status(503).json({ error: 'Gateway unavailable' });
  }
}));

// SPA fallback: serve index.html for all unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start server
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`[Bloomie] ✅ Dashboard running at http://localhost:${port}`);
  console.log(`[Bloomie] 🔗 Gateway proxy: http://localhost:${port}/__openclaw__/*`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Bloomie] SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('[Bloomie] Server closed');
    process.exit(0);
  });
});
