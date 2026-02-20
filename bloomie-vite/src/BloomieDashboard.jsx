import React, { useState, useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════════
   WEBSOCKET CONNECTION TO JADEN'S OPENCLAW GATEWAY
   ═══════════════════════════════════════════════════════════════ */
class OpenClawConnection {
  constructor(gatewayUrl, token) {
    this.gatewayUrl = gatewayUrl;
    this.token = token;
    this.ws = null;
    this.messageHandlers = new Set();
    this.connectionHandlers = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    try {
      const wsUrl = this.gatewayUrl.replace('https://', 'wss://').replace('http://', 'ws://');
      console.log('[OpenClaw] Connecting to:', wsUrl);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[OpenClaw] Connected to gateway');
        this.reconnectAttempts = 0;
        // Use the same auth format as desktop app
        this.send({
          type: 'auth',
          token: this.token,
          clientType: 'web-dashboard',
          platform: navigator.platform,
          version: '1.0.0'
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[OpenClaw] Received:', data);

          if (data.type === 'challenge') {
            console.log('[OpenClaw] Received connection challenge, responding with auth...');
            this.send({
              type: 'auth',
              token: this.token,
              clientType: 'web-dashboard',
              platform: navigator.platform,
              version: '1.0.0'
            });
          } else {
            this.messageHandlers.forEach(handler => {
              try { handler(data); } catch (e) { console.error(e); }
            });
          }
        } catch (error) {
          console.error('[OpenClaw] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[OpenClaw] WebSocket error:', error);
        this.connectionHandlers.forEach(handler => {
          try { handler({ type: 'error', error }); } catch (e) { console.error(e); }
        });
      };

      this.ws.onclose = (event) => {
        console.log('[OpenClaw] Connection closed:', event.code, event.reason);
        this.connectionHandlers.forEach(handler => {
          try { handler({ type: 'close', code: event.code, reason: event.reason }); } catch (e) { console.error(e); }
        });

        if (this.reconnectAttempts < this.maxReconnectAttempts && event.code !== 1000) {
          setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`[OpenClaw] Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            this.connect();
          }, Math.pow(2, this.reconnectAttempts) * 1000);
        }
      };
    } catch (error) {
      console.error('[OpenClaw] Failed to create WebSocket connection:', error);
    }
  }

  disconnect() {
    if (this.ws) this.ws.close(1000);
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }
    console.warn('[OpenClaw] Cannot send message, not connected');
    return false;
  }

  onMessage(handler) { this.messageHandlers.add(handler); return () => this.messageHandlers.delete(handler); }
  onConnection(handler) { this.connectionHandlers.add(handler); return () => this.connectionHandlers.delete(handler); }
  isConnected() { return this.ws && this.ws.readyState === WebSocket.OPEN; }
}

/* ═══════════════════════════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function BloomieDashboard() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const gatewayUrl = 'https://openclaw-railway-template-production-b301.up.railway.app';
    const token = 'a6521e779dbe6948d7265287d344055223b29addf9f9ded546ab9db8312af961';
    const conn = new OpenClawConnection(gatewayUrl, token);

    const unsubscribeMessages = conn.onMessage((data) => {
      if (data.type === 'chat_response') {
        setMessages(prev => [...prev, {
          id: Date.now(),
          content: data.message,
          isBot: true,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    });

    const unsubscribeConnection = conn.onConnection((event) => {
      if (event.type === 'close') {
        setConnected(false);
      } else if (event.type === 'error') {
        setConnected(false);
      }
    });

    conn.connect();
    setConnected(true);

    return () => {
      unsubscribeMessages();
      unsubscribeConnection();
      conn.disconnect();
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: '#ffffff',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          padding: '20px',
          background: 'rgba(244, 162, 97, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(244, 162, 97, 0.3)'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #F4A261, #E76F8B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 10px 0'
          }}>
            🌸 Bloomie Dashboard
          </h1>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '500',
            color: '#F4A261',
            margin: '0 0 10px 0'
          }}>
            Jaden Agent Control Center
          </h2>
          <p style={{
            fontSize: '16px',
            color: connected ? '#4CAF50' : '#FF6B6B',
            margin: '0'
          }}>
            {connected ? '🟢 Connected to OpenClaw Gateway' : '🔴 Connecting to OpenClaw Gateway...'}
          </p>
        </div>

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {/* Chat Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#F4A261',
              margin: '0 0 15px 0'
            }}>
              💬 Chat with Jaden
            </h3>
            <div style={{
              height: '300px',
              overflowY: 'auto',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '8px',
              padding: '10px',
              marginBottom: '10px'
            }}>
              {messages.length === 0 && (
                <div style={{
                  color: '#999',
                  textAlign: 'center',
                  padding: '50px 0'
                }}>
                  {connected ? 'Start a conversation...' : 'Connecting...'}
                </div>
              )}
              {messages.map(msg => (
                <div key={msg.id} style={{
                  marginBottom: '10px',
                  padding: '8px',
                  background: msg.isBot ? 'rgba(244, 162, 97, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '14px', color: '#999', marginBottom: '4px' }}>
                    {msg.isBot ? 'Jaden' : 'You'} • {msg.timestamp}
                  </div>
                  <div>{msg.content}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#F4A261',
              margin: '0 0 15px 0'
            }}>
              ⚡ System Status
            </h3>
            <div style={{
              display: 'grid',
              gap: '10px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '6px'
              }}>
                <span>Gateway Connection</span>
                <span style={{ color: connected ? '#4CAF50' : '#FF6B6B' }}>
                  {connected ? 'Online' : 'Offline'}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '6px'
              }}>
                <span>Agent Status</span>
                <span style={{ color: '#4CAF50' }}>Active</span>
              </div>
            </div>
          </div>

          {/* Heartbeat Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#F4A261',
              margin: '0 0 15px 0'
            }}>
              💓 Heartbeat Schedule
            </h3>
            <div style={{
              color: '#999',
              textAlign: 'center',
              padding: '20px 0'
            }}>
              Proactive schedule coming soon...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}