import { useState, useEffect, useRef } from "react";

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
    this.reconnectDelay = 1000;
  }

  connect() {
    try {
      const wsUrl = this.gatewayUrl.replace('https://', 'wss://').replace('http://', 'ws://');
      console.log('[OpenClaw] Connecting to:', wsUrl);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[OpenClaw] Connected to gateway');
        this.reconnectAttempts = 0;
        const connectedAt = Date.now();
        this.send({
          type: 'req',
          id: 'connect-' + connectedAt,
          method: 'connect',
          params: {
            minProtocol: 3,
            maxProtocol: 3,
            client: {
              id: 'openclaw-control-ui',
              version: '1.0.0',
              platform: 'web',
              mode: 'webchat'
            },
            role: 'operator',
            scopes: ['operator.read', 'operator.write'],
            caps: [],
            commands: [],
            permissions: {},
            auth: { token: this.token }
          }
        });
        this.connectionHandlers.forEach(handler => {
          try { handler({ type: 'connected' }); } catch (e) { console.error(e); }
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[OpenClaw] Received:', data);

          // Handle connect.challenge events
          if (data.type === 'event' && data.event === 'connect.challenge') {
            const nonce = data.payload?.nonce || '';
            const signedAt = Date.now();
            this.send({
              type: 'req',
              id: 'connect-' + signedAt,
              method: 'connect',
              params: {
                minProtocol: 3,
                maxProtocol: 3,
                client: {
                  id: 'openclaw-control-ui',
                  version: '1.0.0',
                  platform: 'web',
                  mode: 'webchat'
                },
                role: 'operator',
                scopes: ['operator.read', 'operator.write'],
                caps: [],
                commands: [],
                permissions: {},
                auth: { token: this.token }
              }
            });
            return;
          }

          this.messageHandlers.forEach(handler => {
            try { handler(data); } catch (e) { console.error(e); }
          });
        } catch (e) { console.error('[OpenClaw] Parse error:', e); }
      };

      this.ws.onerror = (error) => {
        console.error('[OpenClaw] WebSocket error:', error);
        this.connectionHandlers.forEach(handler => {
          try { handler({ type: 'error', error }); } catch (e) { console.error(e); }
        });
      };

      this.ws.onclose = (event) => {
        console.log('[OpenClaw] Disconnected:', event.code, event.reason);
        this.ws = null;
        this.connectionHandlers.forEach(handler => {
          try { handler({ type: 'disconnected', code: event.code, reason: event.reason }); } catch (e) { console.error(e); }
        });
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
          setTimeout(() => this.connect(), delay);
        }
      };
    } catch (error) {
      console.error('[OpenClaw] Failed to create WebSocket connection:', error);
    }
  }

  disconnect() {
    if (this.ws) { this.ws.close(); this.ws = null; }
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  sendChatMessage(message, sessionId = 'agent:main:main') {
    return this.send({ type: 'chat', session: sessionId, message: message, timestamp: new Date().toISOString() });
  }

  onMessage(handler) { this.messageHandlers.add(handler); return () => this.messageHandlers.delete(handler); }
  onConnection(handler) { this.connectionHandlers.add(handler); return () => this.connectionHandlers.delete(handler); }
  isConnected() { return this.ws && this.ws.readyState === WebSocket.OPEN; }
}

/* ═══════════════════════════════════════════════════════════════
   THEME & UTILITIES
   ═══════════════════════════════════════════════════════════════ */
function mk(d){return d?{bg:"#1a1a1a",sf:"#212121",cd:"#262626",ac:"#F4A261",a2:"#E76F8B",gr:"#34A853",gf:"#1a2b1a",tx:"#ececec",so:"#a0a0a0",fa:"#5c5c5c",ln:"#353535",bl:"#5B8FF9",pu:"#A78BFA",inp:"#212121",hv:"#2f2f2f"}:{bg:"#F7F8FA",sf:"#EDEEF2",cd:"#FFFFFF",ac:"#F4A261",a2:"#E76F8B",gr:"#34A853",gf:"#F0FAF0",tx:"#111827",so:"#6B7280",fa:"#D1D5DB",ln:"#E5E7EB",bl:"#3B6FD4",pu:"#7C3AED",inp:"#F4F5F7",hv:"#F0F1F3"}}

function useW(){var s=useState(typeof window!=="undefined"?window.innerWidth:1200);useEffect(function(){var f=function(){s[1](window.innerWidth)};window.addEventListener("resize",f);return function(){window.removeEventListener("resize",f)};},[]);return s[0];}

function useOpenClaw() {
  const [connection, setConnection] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const gatewayUrl = 'https://openclaw-railway-template-production-b301.up.railway.app';
    const token = 'a6521e779dbe6948d7265287d344055223b29addf9f9ded546ab9db8312af961';
    const conn = new OpenClawConnection(gatewayUrl, token);

    const unsubscribeMessages = conn.onMessage((data) => {
      if (data.type === 'chat_response') {
        const timestamp = new Date().toLocaleTimeString([], {hour: "numeric", minute: "2-digit"});
        setMessages(prev => [...prev, { id: Date.now(), b: true, t: data.message, tm: timestamp }]);
      }
    });

    const unsubscribeConnection = conn.onConnection((event) => {
      setConnected(event.type === 'connected');
    });

    conn.connect();
    setConnection(conn);

    return () => {
      unsubscribeMessages();
      unsubscribeConnection();
      conn.disconnect();
    };
  }, []);

  const sendMessage = (message) => {
    if (connection && connection.isConnected()) {
      const timestamp = new Date().toLocaleTimeString([], {hour: "numeric", minute: "2-digit"});
      setMessages(prev => [...prev, { id: Date.now(), b: false, t: message, tm: timestamp }]);
      return connection.sendChatMessage(message);
    }
    return false;
  };

  return { connection, connected, messages, setMessages, sendMessage };
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
function Face({sz, agent}) {
  const s = sz || 30;
  const ag = agent || { nm: "Jaden", img: null, grad: "linear-gradient(135deg,#F4A261,#E76F8B)" };

  if (ag.img) {
    return (
      <div style={{width: s, height: s, flexShrink: 0}}>
        <div style={{width: s, height: s, borderRadius: s * 0.3, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,.12)", background: ag.grad}}>
          <img src={ag.img} alt={ag.nm} style={{width: "100%", height: "100%", objectFit: "cover"}} />
        </div>
      </div>
    );
  }

  const ini = ag.nm.split(" ").map(w => w[0]).join("").slice(0, 2);
  return (
    <div style={{width: s, height: s, flexShrink: 0}}>
      <div style={{width: s, height: s, borderRadius: s * 0.3, background: ag.grad, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,.12)"}}>
        <span style={{fontSize: s * 0.38, fontWeight: 700, color: "#fff"}}>{ini}</span>
      </div>
    </div>
  );
}

function Bloom({sz, glow}) {
  const s = sz || 36;
  return (
    <div style={{position: "relative", width: s, height: s, flexShrink: 0}}>
      {glow && <div style={{position: "absolute", inset: -4, borderRadius: s * 0.28 + 4, background: "radial-gradient(circle,#F4A26140 0%,#E76F8B20 50%,transparent 70%)", animation: "bloomGlow 2.5s ease-in-out infinite"}} />}
      <div style={{width: s, height: s, borderRadius: s * 0.28, background: "linear-gradient(135deg,#F4A261,#E76F8B)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 12px #E76F8B40", position: "relative", zIndex: 1}}>
        <svg width={s * 0.65} height={s * 0.65} viewBox="0 0 100 100" fill="none">
          {[0, 72, 144, 216, 288].map((r, i) => (
            <ellipse key={i} cx="50" cy="38" rx="14" ry="20" fill="#fff" opacity={i % 2 === 0 ? 0.9 : 0.8} transform={`rotate(${r} 50 50)`} />
          ))}
          <circle cx="50" cy="50" r="10" fill="#FFE0C2" />
          <circle cx="50" cy="50" r="5" fill="#F4A261" />
        </svg>
      </div>
    </div>
  );
}

function Screen({c, mob, live, mode, setMode}) {
  if (mode === "hidden") return null;

  const wrap = mode === "full"
    ? {position: "fixed", inset: 0, zIndex: 300, background: "#000", display: "flex", flexDirection: "column"}
    : mode === "pop"
    ? {position: "fixed", bottom: mob ? 12 : 20, right: mob ? 12 : 20, width: mob ? 200 : 340, height: mob ? 130 : 210, zIndex: 250, borderRadius: 14, overflow: "hidden", boxShadow: "0 12px 48px rgba(0,0,0,.45)", border: "2px solid " + c.ac + "60"}
    : {borderRadius: 12, overflow: "hidden", border: "1.5px solid " + (live ? c.gr + "50" : c.ln), marginBottom: 0, maxHeight: "100%"};

  const barH = mob ? 32 : 36;

  return (
    <div style={wrap}>
      <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px", height: barH, background: mode === "full" ? "#111" : c.cd, borderBottom: "1px solid " + c.ln, flexShrink: 0}}>
        <div style={{display: "flex", alignItems: "center", gap: 6}}>
          <span style={{width: 7, height: 7, borderRadius: "50%", background: live ? "#34A853" : c.fa, animation: live ? "pulse 1.2s ease infinite" : "none"}} />
          <span style={{fontSize: 11, fontWeight: 600, color: live ? c.gr : c.so}}>{live ? "LIVE" : "Idle"}</span>
          {live && <span style={{fontSize: 10, color: c.so, marginLeft: 2}}>Chromium</span>}
        </div>
        <div style={{display: "flex", gap: 4}}>
          {mode !== "pop" && <button onClick={() => setMode("pop")} title="Pop out" style={{width: 24, height: 24, borderRadius: 6, border: "1px solid " + c.ln, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"}}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={c.so} strokeWidth="1.8">
              <path d="M9 2h5v5M14 2L8 8M6 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-3" />
            </svg>
          </button>}
          {mode !== "full" && <button onClick={() => setMode("full")} title="Fullscreen" style={{width: 24, height: 24, borderRadius: 6, border: "1px solid " + c.ln, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"}}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={c.so} strokeWidth="1.8">
              <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" />
            </svg>
          </button>}
          {(mode === "full" || mode === "pop") && <button onClick={() => setMode(mode === "full" ? "docked" : "hidden")} title="Close" style={{width: 24, height: 24, borderRadius: 6, border: "1px solid " + c.ln, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"}}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={c.so} strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>}
          {mode === "docked" && <button onClick={() => setMode("hidden")} title="Hide" style={{width: 24, height: 24, borderRadius: 6, border: "1px solid " + c.ln, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"}}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={c.so} strokeWidth="2">
              <path d="M3 8h10" />
            </svg>
          </button>}
        </div>
      </div>

      <div style={{background: "#0a0a0a", flex: mode === "full" ? 1 : undefined, aspectRatio: mode === "full" ? undefined : "16/9", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden"}}>
        {live ? (
          <div style={{width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center"}}>
            <div style={{width: mode === "pop" ? (mob ? "94%" : "90%") : mob ? "85%" : "65%", background: "#161616", borderRadius: mode === "pop" ? 4 : 8, overflow: "hidden", border: "1px solid #333", boxShadow: "0 8px 32px rgba(0,0,0,.5)"}}>
              <div style={{padding: mode === "pop" ? "3px 6px" : "6px 10px", background: "#1c1c1c", display: "flex", alignItems: "center", gap: mode === "pop" ? 3 : 6}}>
                <div style={{display: "flex", gap: mode === "pop" ? 2 : 4}}>
                  {["#ff5f57", "#febc2e", "#28c840"].map((co, i) => (
                    <div key={i} style={{width: mode === "pop" ? 5 : 8, height: mode === "pop" ? 5 : 8, borderRadius: "50%", background: co}} />
                  ))}
                </div>
                <div style={{flex: 1, padding: mode === "pop" ? "1px 4px" : "3px 8px", borderRadius: 4, background: "#111", fontSize: mode === "pop" ? 7 : 10, color: "#888", fontFamily: "monospace", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis"}}>
                  example.com/dashboard
                </div>
              </div>
              <div style={{padding: mode === "pop" ? 6 : mob ? 12 : 20}}>
                <div style={{height: mode === "pop" ? 5 : 10, width: "60%", background: "#2a2a2a", borderRadius: 3, marginBottom: mode === "pop" ? 4 : 8}} />
                <div style={{height: mode === "pop" ? 4 : 8, width: "90%", background: "#222", borderRadius: 3, marginBottom: mode === "pop" ? 3 : 6}} />
                <div style={{height: mode === "pop" ? 4 : 8, width: "75%", background: "#222", borderRadius: 3, marginBottom: mode === "pop" ? 5 : 12}} />
                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: mode === "pop" ? 3 : 6}}>
                  {[35, 55, 25].map((h, i) => (
                    <div key={i} style={{height: mode === "pop" ? h * 0.4 : h, background: "linear-gradient(180deg,#F4A261" + (15 + i * 10) + ",#E76F8B15)", borderRadius: 3}} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{textAlign: "center", padding: mode === "pop" ? 10 : 30}}>
            <div style={{fontSize: mode === "pop" ? 20 : 36, marginBottom: mode === "pop" ? 4 : 10, opacity: 0.3}}>🖥️</div>
            {mode !== "pop" && (
              <>
                <div style={{fontSize: 13, color: "#666", marginBottom: 4}}>Browser idle</div>
                <div style={{fontSize: 11, color: "#555"}}>Activates when Jaden starts browsing</div>
              </>
            )}
          </div>
        )}
        {live && <div style={{position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.02) 2px,rgba(0,0,0,.02) 4px)", pointerEvents: "none"}} />}
      </div>
    </div>
  );
}

export default function BloomieDashboard() {
  const W = useW();
  const mob = W < 768;
  const [dark, setDark] = useState(true);
  const c = mk(dark);

  // OpenClaw connection
  const { connection, connected, messages, setMessages, sendMessage } = useOpenClaw();

  // UI State
  const [pg, setPg] = useState("chat");
  const [tx, setTx] = useState("");
  const [isNew, setNew] = useState(true);
  const [vcRec, setVcRec] = useState(false);
  const [scrM, setScrM] = useState("docked");
  const [scrLive] = useState(true);
  const [sbO, setSbO] = useState(!mob ? "full" : "closed");
  const [stO, setStO] = useState(false);
  const [stab, setStab] = useState("General");
  const [hlpO, setHlpO] = useState(false);
  const [umO, setUmO] = useState(false);
  const [heartbeatInterval, setHeartbeatInterval] = useState("0 */6 * * *"); // Every 6 hours
  const [heartbeatEnabled, setHeartbeatEnabled] = useState(true);

  const btm = useRef(null);
  const fRef = useRef(null);

  const sbOpen = sbO === "full" || sbO === "mini";

  // Agent info
  const currentAgent = {
    id: "jaden",
    nm: "Jaden",
    role: "OpenClaw Agent",
    img: null,
    grad: "linear-gradient(135deg,#F4A261,#E76F8B)",
    status: connected ? "online" : "offline"
  };

  // Mock cron jobs data
  const [cronJobs, setCronJobs] = useState([
    {id: "c1", nm: "Email monitoring", ic: "📧", freq: "Every 15min", next: "2:30 PM", last: "2:15 PM", ok: true, on: true},
    {id: "c2", nm: "Proactive check-in", ic: "💬", freq: heartbeatInterval, next: "6:00 PM", last: "12:00 PM", ok: true, on: heartbeatEnabled},
    {id: "c3", nm: "System health scan", ic: "🔍", freq: "Every 30min", next: "3:00 PM", last: "2:30 PM", ok: false, on: true},
    {id: "c4", nm: "Task completion scan", ic: "✅", freq: "Hourly", next: "3:00 PM", last: "2:00 PM", ok: true, on: true}
  ]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (btm.current) {
      setTimeout(() => {
        btm.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages]);

  // Close dropdowns on outside click
  useEffect(() => {
    if (!umO) return;
    const h = () => setUmO(false);
    setTimeout(() => document.addEventListener("click", h), 0);
    return () => document.removeEventListener("click", h);
  }, [umO]);

  const send = () => {
    if (!tx.trim()) return;
    const success = sendMessage(tx.trim());
    if (success) {
      setTx("");
      if (isNew) setNew(false);
    } else {
      const timestamp = new Date().toLocaleTimeString([], {hour: "numeric", minute: "2-digit"});
      setMessages(prev => [...prev, {
        id: Date.now(),
        b: true,
        t: "I'm not connected to the OpenClaw gateway right now. Please check the connection.",
        tm: timestamp
      }]);
    }
  };

  const toggleVoice = () => {
    if (vcRec) {
      setVcRec(false);
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      const timestamp = new Date().toLocaleTimeString([], {hour: "numeric", minute: "2-digit"});
      setMessages(prev => [...prev, {
        id: Date.now(),
        b: true,
        t: "Voice input isn't supported in this browser. Try Chrome or Edge for speech recognition.",
        tm: timestamp
      }]);
      return;
    }

    const r = new SR();
    r.continuous = false;
    r.interimResults = true;
    r.lang = "en-US";
    r.onresult = (ev) => {
      let t = "";
      for (let i = 0; i < ev.results.length; i++) {
        t += ev.results[i][0].transcript;
      }
      setTx(t);
    };
    r.onend = () => setVcRec(false);
    r.onerror = () => setVcRec(false);
    r.start();
    setVcRec(true);
  };

  const toggleCronJob = (jobId) => {
    setCronJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, on: !job.on } : job
    ));
  };

  const updateHeartbeat = (interval, enabled) => {
    setHeartbeatInterval(interval);
    setHeartbeatEnabled(enabled);
    setCronJobs(prev => prev.map(job =>
      job.id === "c2" ? { ...job, freq: interval, on: enabled } : job
    ));
  };

  return (
    <div style={{minHeight: "100vh", background: c.bg, fontFamily: "'Inter',system-ui,-apple-system,sans-serif", color: c.tx}}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
          @keyframes pop{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
          @keyframes bloomGlow{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.15)}}
          @keyframes bloomieWiggle{0%,100%{transform:rotate(0deg)}25%{transform:rotate(-3deg)}75%{transform:rotate(3deg)}}
          * {box-sizing: border-box; margin: 0; padding: 0}
          input:focus, button:focus {outline: none}
          ::-webkit-scrollbar {width: 4px}
          ::-webkit-scrollbar-thumb {background: ${c.ln}; border-radius: 10px}
        `}
      </style>

      <input ref={fRef} type="file" multiple style={{display: "none"}} />

      {/* ── HEADER ── */}
      <div style={{padding: mob ? "8px 12px" : "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: c.cd, borderBottom: "1px solid " + c.ln, position: "sticky", top: 0, zIndex: 60, gap: 8}}>
        <div style={{display: "flex", alignItems: "center", gap: mob ? 6 : 10}}>
          {pg === "chat" && <button onClick={() => setSbO(sbO === "full" ? "mini" : sbO === "mini" ? "closed" : "full")} style={{width: 32, height: 32, borderRadius: 8, border: "1px solid " + c.ln, background: c.cd, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: c.so, flexShrink: 0}}>☰</button>}
          <Bloom sz={mob ? 28 : 32} glow />
          {!mob && <span style={{fontSize: 16, fontWeight: 700, color: c.tx}}>Bloomie</span>}
          {!mob && <span style={{fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 6, background: "#E76F8B20", color: "#E76F8B", letterSpacing: 0.5}}>BETA</span>}
        </div>

        <div style={{display: "flex", alignItems: "center", gap: mob ? 6 : 12, flexWrap: "nowrap"}}>
          <div style={{display: "flex", gap: mob ? 2 : 4, background: c.sf, padding: 3, borderRadius: 10}}>
            {[{k: "chat", l: mob ? "💬" : "💬 Chat"}, {k: "cron", l: mob ? "⏰" : "⏰ Jobs"}, {k: "settings", l: mob ? "⚙️" : "⚙️ Settings"}].map(t => (
              <button key={t.k} onClick={() => setPg(t.k)} style={{padding: mob ? "7px 10px" : "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: pg === t.k ? c.cd : "transparent", color: pg === t.k ? c.tx : c.so, boxShadow: pg === t.k ? "0 1px 4px rgba(0,0,0,.06)" : "none"}}>
                {t.l}
              </button>
            ))}
          </div>

          <div style={{display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 12, background: connected ? c.gf : "#fef2f2", border: "1px solid " + (connected ? c.gr + "30" : "#fecaca")}}>
            <span style={{width: 6, height: 6, borderRadius: "50%", background: connected ? c.gr : "#ef4444", animation: connected ? "pulse 1.5s ease infinite" : "none"}} />
            <span style={{fontSize: 10, fontWeight: 600, color: connected ? c.gr : "#dc2626"}}>{connected ? "Connected" : "Offline"}</span>
          </div>
        </div>

        <div style={{display: "flex", alignItems: "center", gap: 8, position: "relative"}}>
          {scrM === "hidden" && <button onClick={() => setScrM("docked")} title="Show screen" style={{width: 32, height: 32, borderRadius: 8, border: "1px solid " + c.ln, background: c.cd, cursor: "pointer", fontSize: 14, color: c.so, display: "flex", alignItems: "center", justifyContent: "center"}}>🖥️</button>}
          <button onClick={() => setUmO(!umO)} style={{width: 36, height: 36, borderRadius: "50%", border: umO ? "2px solid " + c.ac : "2px solid " + c.ln, background: "linear-gradient(135deg,#F4A261,#E76F8B)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", transition: "border-color .15s"}}>
            K
          </button>
          {umO && (
            <div style={{position: "absolute", top: "100%", right: 0, marginTop: 8, width: 220, background: c.cd, borderRadius: 14, border: "1px solid " + c.ln, boxShadow: "0 12px 40px rgba(0,0,0,.22)", overflow: "hidden", animation: "pop .2s ease", zIndex: 80}}>
              <div style={{padding: "14px 16px", borderBottom: "1px solid " + c.ln, display: "flex", alignItems: "center", gap: 10}}>
                <div style={{width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#F4A261,#E76F8B)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0}}>K</div>
                <div><div style={{fontSize: 13, fontWeight: 700, color: c.tx}}>Kimberly</div><div style={{fontSize: 11, color: c.so}}>Owner</div></div>
              </div>
              <button onClick={() => {setUmO(false); setDark(!dark);}} style={{width: "100%", textAlign: "left", padding: "11px 16px", border: "none", cursor: "pointer", background: "transparent", fontSize: 13, color: c.tx, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid " + c.ln}} onMouseEnter={e => e.currentTarget.style.background = c.hv} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span style={{fontSize: 16}}>{dark ? "☀️" : "🌙"}</span>{dark ? "Light mode" : "Dark mode"}
              </button>
              <button onClick={() => {setUmO(false); setStO(true);}} style={{width: "100%", textAlign: "left", padding: "11px 16px", border: "none", cursor: "pointer", background: "transparent", fontSize: 13, color: c.tx, display: "flex", alignItems: "center", gap: 10}} onMouseEnter={e => e.currentTarget.style.background = c.hv} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span style={{fontSize: 16}}>⚙️</span>Settings
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{display: "flex", position: "relative"}}>
        {/* Mobile sidebar backdrop */}
        {pg === "chat" && sbO === "full" && mob && <div onClick={() => setSbO("closed")} style={{position: "fixed", inset: 0, top: 52, background: "rgba(0,0,0,.3)", zIndex: 45}} />}

        {/* ── SIDEBAR ── */}
        {pg === "chat" && sbOpen && (
          <div style={mob ? {position: "fixed", top: 52, left: 0, bottom: 0, zIndex: 50} : {}}>
            <div style={{width: sbO === "mini" ? 60 : 260, height: "calc(100vh - 52px)", background: c.cd, borderRight: "1px solid " + c.ln, display: "flex", flexDirection: "column", flexShrink: 0, transition: "width .2s ease", overflow: "hidden"}}>

              {/* MINI SIDEBAR */}
              {sbO === "mini" && (
                <div style={{display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", gap: 4, flex: 1}}>
                  <button onClick={() => setNew(true)} title="New chat" style={{width: 40, height: 40, borderRadius: 10, border: "1.5px dashed " + c.ln, background: "transparent", cursor: "pointer", fontSize: 16, color: c.so, display: "flex", alignItems: "center", justifyContent: "center"}}>+</button>
                  <button title={currentAgent.nm} style={{width: 40, height: 40, borderRadius: 10, border: "none", background: "transparent", padding: 2, marginTop: 4}}>
                    <Face sz={36} agent={currentAgent} />
                  </button>
                  <div style={{width: 32, height: 1, background: c.ln, margin: "6px 0"}} />
                  <button onClick={() => setSbO("full")} title="Kimberly" style={{width: 40, height: 40, borderRadius: 10, border: "none", background: c.sf, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: c.tx, marginTop: "auto"}}>K</button>
                </div>
              )}

              {/* FULL SIDEBAR */}
              {sbO === "full" && (
                <>
                  <div style={{padding: "14px 14px 8px"}}>
                    <button onClick={() => setNew(true)} style={{width: "100%", padding: "10px 0", borderRadius: 10, border: "1.5px dashed " + c.ln, background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: c.so}}>+ New chat</button>
                  </div>

                  {/* Agent card */}
                  <div style={{margin: "0 14px 10px"}}>
                    <div style={{width: "100%", padding: "10px 12px", borderRadius: 12, background: c.sf, border: "1px solid " + c.ln, display: "flex", alignItems: "center", gap: 10}}>
                      <Face sz={36} agent={currentAgent} />
                      <div style={{flex: 1, minWidth: 0}}>
                        <div style={{fontSize: 13, fontWeight: 700, color: c.tx, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{currentAgent.nm}</div>
                        <div style={{fontSize: 11, color: c.so}}>{currentAgent.role}</div>
                        <div style={{fontSize: 10, color: connected ? c.gr : c.fa, display: "flex", alignItems: "center", gap: 4, marginTop: 2}}>
                          <span style={{width: 5, height: 5, borderRadius: "50%", background: connected ? c.gr : c.fa, animation: connected ? "pulse 1.5s ease infinite" : "none"}} />
                          {connected ? "Online" : "Offline"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{flex: 1}} />

                  {/* User card */}
                  <div style={{padding: "10px 14px", borderTop: "1px solid " + c.ln}}>
                    <div style={{width: "100%", padding: "10px 12px", borderRadius: 10, display: "flex", alignItems: "center", gap: 10}}>
                      <div style={{width: 32, height: 32, borderRadius: 8, background: c.sf, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: c.tx}}>K</div>
                      <div style={{flex: 1}}>
                        <div style={{fontSize: 13, fontWeight: 600, color: c.tx}}>Kimberly</div>
                        <div style={{fontSize: 11, color: c.so}}>Owner</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── MAIN CONTENT ── */}
        <div style={{flex: 1, minWidth: 0}}>

          {/* CHAT PAGE */}
          {pg === "chat" && (
            <div style={{height: "calc(100vh - 52px)", display: "flex", flexDirection: "column", overflow: "hidden"}}>

              {/* Chat header */}
              {!isNew && (
                <div style={{padding: mob ? "8px 12px" : "10px 16px", display: "flex", alignItems: "center", gap: mob ? 8 : 10, borderBottom: "1px solid " + c.ln, background: c.cd, flexShrink: 0}}>
                  <Face sz={mob ? 28 : 32} agent={currentAgent} />
                  <div style={{flex: 1}}>
                    <div style={{fontSize: mob ? 14 : 15, fontWeight: 700, color: c.tx}}>{currentAgent.nm}</div>
                    <div style={{fontSize: 11, color: connected ? c.gr : c.fa, display: "flex", alignItems: "center", gap: 5}}>
                      <span style={{width: 6, height: 6, borderRadius: "50%", background: connected ? c.gr : c.fa, animation: connected ? "pulse 1.5s ease infinite" : "none"}} />
                      {connected ? "Online" : "Offline"}
                    </div>
                  </div>
                  <span style={{fontSize: 11, color: c.so}}>Session: agent:main:main</span>
                </div>
              )}

              {/* Welcome screen or Messages */}
              {isNew ? (
                <div style={{flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: mob ? "20px 16px" : "40px 20px"}}>
                  <div style={{width: "100%", maxWidth: 620, textAlign: "center"}}>
                    <div style={{display: "flex", justifyContent: "center", marginBottom: 8}}>
                      <Face sz={mob ? 64 : 80} agent={currentAgent} />
                    </div>
                    <h2 style={{fontSize: mob ? 22 : 28, fontWeight: 700, color: c.tx, marginTop: 18, marginBottom: 6}}>
                      Chat with Jaden
                    </h2>
                    <p style={{fontSize: mob ? 13 : 15, color: c.so, marginBottom: 28}}>
                      {connected ? "Connected to OpenClaw gateway. Start a conversation!" : "Connecting to OpenClaw gateway..."}
                    </p>

                    <div style={{position: "relative", marginBottom: 20}}>
                      <div style={{display: "flex", gap: mob ? 6 : 10, alignItems: "center"}}>
                        <input
                          value={tx}
                          onChange={(e) => setTx(e.target.value)}
                          onKeyDown={(e) => {if (e.key === "Enter") send()}}
                          placeholder={vcRec ? "Listening…" : connected ? "Ask anything..." : "Connecting..."}
                          disabled={!connected}
                          style={{
                            flex: 1,
                            padding: mob ? "12px 14px" : "14px 18px",
                            borderRadius: 14,
                            border: "1.5px solid " + (vcRec ? c.ac : c.ln),
                            fontSize: 15,
                            fontFamily: "inherit",
                            background: c.inp,
                            color: c.tx,
                            transition: "border-color .2s",
                            opacity: connected ? 1 : 0.5
                          }}
                        />
                        <button
                          onClick={toggleVoice}
                          disabled={!connected}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            border: vcRec ? "2px solid " + c.ac : "1.5px solid " + c.ln,
                            cursor: connected ? "pointer" : "not-allowed",
                            background: vcRec ? c.ac + "18" : c.cd,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            transition: "all .2s ease",
                            position: "relative",
                            opacity: connected ? 1 : 0.5
                          }}
                        >
                          {vcRec && <span style={{position: "absolute", inset: -4, borderRadius: 16, border: "2px solid " + c.ac, animation: "pulse 1.2s ease infinite", opacity: 0.4}} />}
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={vcRec ? c.ac : c.so} strokeWidth="2" strokeLinecap="round">
                            <rect x="9" y="1" width="6" height="12" rx="3"/>
                            <path d="M5 10a7 7 0 0014 0"/>
                            <path d="M12 17v4M8 21h8"/>
                          </svg>
                        </button>
                        <button
                          onClick={send}
                          disabled={!connected || !tx.trim()}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            border: "none",
                            cursor: (connected && tx.trim()) ? "pointer" : "not-allowed",
                            background: (connected && tx.trim()) ? "linear-gradient(135deg,#F4A261,#E76F8B)" : c.sf,
                            color: (connected && tx.trim()) ? "#fff" : c.fa,
                            fontSize: 18,
                            fontWeight: 700,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all .2s ease"
                          }}
                        >
                          ➜
                        </button>
                      </div>
                    </div>

                    <div style={{display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 24}}>
                      {["What can you help me with?", "Check my emails", "Show me the dashboard", "Run a quick task"].map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setTx(s)}
                          disabled={!connected}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 20,
                            border: "1px solid " + c.ln,
                            background: c.cd,
                            cursor: connected ? "pointer" : "not-allowed",
                            fontSize: 12,
                            color: c.so,
                            transition: "border-color .15s",
                            opacity: connected ? 1 : 0.5
                          }}
                          onMouseEnter={(e) => connected && (e.currentTarget.style.borderColor = c.ac)}
                          onMouseLeave={(e) => connected && (e.currentTarget.style.borderColor = c.ln)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>

                    {!connected && (
                      <div style={{fontSize: 11, color: c.fa, marginTop: 16}}>
                        Connecting to: openclaw-railway-template-production-b301.up.railway.app
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <div style={{flex: 1, minHeight: 0, overflowY: "auto", display: "flex"}}>

                    {/* Chat messages */}
                    <div style={{flex: 1, padding: mob ? "14px 12px" : "18px 20px", background: c.bg}}>
                      {messages.map((m) => (
                        <div key={m.id} style={{display: "flex", justifyContent: m.b ? "flex-start" : "flex-end", marginBottom: 14}}>
                          {m.b && <div style={{marginRight: 8, marginTop: 2}}><Face sz={mob ? 26 : 28} agent={currentAgent} /></div>}
                          <div style={{
                            maxWidth: mob ? "85%" : "70%",
                            padding: "12px 16px",
                            fontSize: mob ? 13 : 14,
                            lineHeight: 1.55,
                            color: m.b ? c.tx : "#fff",
                            borderRadius: m.b ? "6px 18px 18px 18px" : "18px 6px 18px 18px",
                            background: m.b ? c.cd : "linear-gradient(135deg,#F4A261,#E76F8B)",
                            border: m.b ? "1px solid " + c.ln : "none"
                          }}>
                            {m.t}
                            <div style={{fontSize: 10, opacity: 0.45, marginTop: 5, textAlign: m.b ? "left" : "right"}}>{m.tm}</div>
                          </div>
                        </div>
                      ))}
                      <div ref={btm} />
                    </div>

                    {/* Screen viewer (desktop only) */}
                    {!mob && scrM !== "hidden" && (
                      <div style={{width: 320, flexShrink: 0, padding: "8px 12px 8px 0"}}>
                        <Screen c={c} mob={false} live={scrLive} mode="docked" setMode={setScrM} />
                      </div>
                    )}
                  </div>

                  {/* Input bar */}
                  <div style={{flexShrink: 0, padding: mob ? "6px 10px" : "8px 16px", background: c.cd, borderTop: "1px solid " + c.ln}}>
                    <div style={{display: "flex", alignItems: "center", gap: 6, paddingBottom: 5}}>
                      <span style={{width: 5, height: 5, borderRadius: "50%", background: connected ? c.gr : c.fa}} />
                      <span style={{fontSize: 11, color: c.fa}}>
                        {connected ? "Connected to agent:main:main" : "Disconnected"}
                      </span>
                    </div>
                    <div style={{display: "flex", gap: mob ? 6 : 8, alignItems: "center"}}>
                      <input
                        value={tx}
                        onChange={(e) => setTx(e.target.value)}
                        onKeyDown={(e) => {if (e.key === "Enter") send()}}
                        placeholder={vcRec ? "Listening…" : (mob ? "Message…" : "Tell Jaden what you need…")}
                        disabled={!connected}
                        style={{
                          flex: 1,
                          padding: mob ? "10px 14px" : "11px 14px",
                          borderRadius: 12,
                          border: "1.5px solid " + (vcRec ? c.ac : c.ln),
                          fontSize: 14,
                          fontFamily: "inherit",
                          background: c.inp,
                          color: c.tx,
                          transition: "border-color .2s",
                          opacity: connected ? 1 : 0.5
                        }}
                      />
                      <button
                        onClick={toggleVoice}
                        disabled={!connected}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 11,
                          border: vcRec ? "2px solid " + c.ac : "1.5px solid " + c.ln,
                          cursor: connected ? "pointer" : "not-allowed",
                          background: vcRec ? c.ac + "18" : c.cd,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all .2s ease",
                          position: "relative",
                          opacity: connected ? 1 : 0.5
                        }}
                      >
                        {vcRec && <span style={{position: "absolute", inset: -4, borderRadius: 15, border: "2px solid " + c.ac, animation: "pulse 1.2s ease infinite", opacity: 0.4}} />}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={vcRec ? c.ac : c.so} strokeWidth="2" strokeLinecap="round">
                          <rect x="9" y="1" width="6" height="12" rx="3"/>
                          <path d="M5 10a7 7 0 0014 0"/>
                          <path d="M12 17v4M8 21h8"/>
                        </svg>
                      </button>
                      <button
                        onClick={send}
                        disabled={!connected || !tx.trim()}
                        style={{
                          padding: mob ? "10px 16px" : "11px 20px",
                          borderRadius: 12,
                          border: "none",
                          cursor: (connected && tx.trim()) ? "pointer" : "not-allowed",
                          background: (connected && tx.trim()) ? "linear-gradient(135deg,#F4A261,#E76F8B)" : c.sf,
                          color: (connected && tx.trim()) ? "#fff" : c.fa,
                          fontSize: 14,
                          fontWeight: 700,
                          flexShrink: 0,
                          transition: "all .2s ease"
                        }}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* CRON JOBS PAGE */}
          {pg === "cron" && (
            <div style={{padding: mob ? "16px 12px 40px" : "20px 20px 40px", maxWidth: 1000, margin: "0 auto"}}>
              <div style={{marginBottom: 24}}>
                <h1 style={{fontSize: mob ? 20 : 24, fontWeight: 700, color: c.tx, marginBottom: 6}}>⏰ Automation & Cron Jobs</h1>
                <p style={{fontSize: 13, color: c.so}}>Manage Jaden's automated tasks and proactive behaviors</p>
              </div>

              {/* HEARTBEAT SECTION */}
              <div style={{padding: 20, borderRadius: 16, background: c.cd, border: "1px solid " + c.ln, marginBottom: 20}}>
                <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16}}>
                  <div>
                    <div style={{fontSize: 16, fontWeight: 700, color: c.tx, marginBottom: 4}}>💗 Jaden's Proactive Heartbeat</div>
                    <div style={{fontSize: 12, color: c.so}}>Set when Jaden should proactively check in with you</div>
                  </div>
                  <div style={{padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: heartbeatEnabled ? c.gr + "15" : c.fa + "15", color: heartbeatEnabled ? c.gr : c.fa}}>
                    {heartbeatEnabled ? "Active" : "Paused"}
                  </div>
                </div>

                <div style={{display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16}}>
                  <div>
                    <div style={{fontSize: 12, fontWeight: 600, color: c.so, marginBottom: 6}}>Schedule (Cron Expression)</div>
                    <input
                      value={heartbeatInterval}
                      onChange={(e) => setHeartbeatInterval(e.target.value)}
                      placeholder="0 */6 * * *"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "1.5px solid " + c.ln,
                        background: c.sf,
                        fontSize: 13,
                        fontFamily: "monospace",
                        color: c.tx
                      }}
                    />
                    <div style={{fontSize: 10, color: c.fa, marginTop: 4}}>
                      Current: Every 6 hours • Next: {new Date(Date.now() + 6 * 60 * 60 * 1000).toLocaleTimeString([], {hour: "numeric", minute: "2-digit"})}
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize: 12, fontWeight: 600, color: c.so, marginBottom: 6}}>Quick Presets</div>
                    <div style={{display: "flex", gap: 6, flexWrap: "wrap"}}>
                      {[
                        {l: "Every hour", v: "0 * * * *"},
                        {l: "Every 6hrs", v: "0 */6 * * *"},
                        {l: "Daily 9am", v: "0 9 * * *"},
                        {l: "Weekdays 9am", v: "0 9 * * 1-5"}
                      ].map(preset => (
                        <button
                          key={preset.v}
                          onClick={() => setHeartbeatInterval(preset.v)}
                          style={{
                            padding: "5px 8px",
                            borderRadius: 6,
                            border: "1px solid " + c.ln,
                            background: heartbeatInterval === preset.v ? c.ac + "15" : c.sf,
                            cursor: "pointer",
                            fontSize: 10,
                            fontWeight: 500,
                            color: heartbeatInterval === preset.v ? c.ac : c.so
                          }}
                        >
                          {preset.l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{display: "flex", gap: 10, alignItems: "center"}}>
                  <button
                    onClick={() => updateHeartbeat(heartbeatInterval, !heartbeatEnabled)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 10,
                      border: "none",
                      cursor: "pointer",
                      background: heartbeatEnabled ? c.fa + "30" : "linear-gradient(135deg,#F4A261,#E76F8B)",
                      color: heartbeatEnabled ? c.fa : "#fff",
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    {heartbeatEnabled ? "⏸️ Pause" : "▶️ Start"} Heartbeat
                  </button>
                  <button
                    onClick={() => updateHeartbeat(heartbeatInterval, heartbeatEnabled)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 10,
                      border: "1px solid " + c.ln,
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      color: c.so
                    }}
                  >
                    💾 Save Changes
                  </button>
                </div>
              </div>

              {/* CRON JOBS LIST */}
              <div style={{padding: 0, borderRadius: 16, background: c.cd, border: "1px solid " + c.ln, overflow: "hidden"}}>
                <div style={{padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid " + c.ln, background: c.sf}}>
                  <div style={{display: "flex", alignItems: "center", gap: 8}}>
                    <div style={{position: "relative", width: 10, height: 10}}>
                      <span style={{position: "absolute", inset: 0, borderRadius: "50%", background: c.gr, animation: "pulse 1.5s ease infinite"}} />
                      <span style={{position: "absolute", inset: 2, borderRadius: "50%", background: c.gr}} />
                    </div>
                    <span style={{fontSize: 13, fontWeight: 700, color: c.tx}}>Automated Jobs</span>
                    <span style={{fontSize: 11, color: c.so}}>{cronJobs.filter(j => j.on).length} active</span>
                  </div>
                  <span style={{fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: c.gr + "15", color: c.gr}}>Running</span>
                </div>

                <div style={{padding: "8px 0"}}>
                  {cronJobs.map((job, i) => {
                    const stCl = !job.on ? c.fa : job.ok ? c.gr : "#E76F8B";
                    return (
                      <div key={job.id} style={{padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: i < cronJobs.length - 1 ? "1px solid " + c.ln + "60" : "none", opacity: job.on ? 1 : 0.5}}>
                        <div style={{position: "relative", flexShrink: 0}}>
                          <span style={{fontSize: 16}}>{job.ic}</span>
                          <span style={{position: "absolute", bottom: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: stCl, border: "1.5px solid " + c.cd}} />
                        </div>
                        <div style={{flex: 1, minWidth: 0}}>
                          <div style={{fontSize: 13, fontWeight: 600, color: job.on ? c.tx : c.so, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{job.nm}</div>
                          <div style={{fontSize: 10, color: c.fa, marginTop: 1}}>
                            {job.freq} • {job.on ? `Next: ${job.next}` : "Paused"}
                          </div>
                        </div>
                        {job.on && (
                          <div style={{flexShrink: 0, textAlign: "right"}}>
                            <div style={{fontSize: 9, color: job.ok ? c.gr : "#E76F8B", fontWeight: 600, display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end"}}>
                              <span>{job.ok ? "✓" : "⚠"}</span>{job.ok ? "OK" : "Failed"}
                            </div>
                            <div style={{fontSize: 9, color: c.fa, marginTop: 1}}>{job.last}</div>
                          </div>
                        )}
                        <button
                          onClick={() => toggleCronJob(job.id)}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            border: "1px solid " + c.ln,
                            background: "transparent",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            color: c.so,
                            flexShrink: 0
                          }}
                        >
                          {job.on ? "⏸" : "▶"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div style={{padding: "10px 16px", borderTop: "1px solid " + c.ln, background: c.sf, display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                  <div style={{fontSize: 10, color: c.so}}>
                    Next run: <span style={{fontWeight: 600, color: c.tx}}>Email monitoring</span> at 3:00 PM
                  </div>
                  <button style={{padding: "4px 10px", borderRadius: 6, border: "1px solid " + c.ac + "40", background: "transparent", cursor: "pointer", fontSize: 10, fontWeight: 600, color: c.ac}}>+ Add Job</button>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS PAGE */}
          {pg === "settings" && (
            <div style={{padding: mob ? "16px 12px 40px" : "20px 20px 40px", maxWidth: 800, margin: "0 auto"}}>
              <div style={{marginBottom: 24}}>
                <h1 style={{fontSize: mob ? 20 : 24, fontWeight: 700, color: c.tx, marginBottom: 6}}>⚙️ Settings</h1>
                <p style={{fontSize: 13, color: c.so}}>Configure Jaden and your Bloomie experience</p>
              </div>

              <div style={{display: "flex", gap: mob ? 0 : undefined, flexDirection: mob ? "column" : "row", marginBottom: 20}}>
                <div style={{padding: mob ? "10px 16px" : "16px", borderRight: mob ? "none" : "1px solid " + c.ln, borderBottom: mob ? "1px solid " + c.ln : "none", display: "flex", flexDirection: mob ? "row" : "column", gap: mob ? 4 : 2, overflowX: mob ? "auto" : "visible", flexShrink: 0}}>
                  {["General", "Connection", "Interface"].map(t => (
                    <button key={t} onClick={() => setStab(t)} style={{padding: mob ? "8px 14px" : "10px 16px", borderRadius: 10, border: "none", cursor: "pointer", background: stab === t ? c.ac + "12" : "transparent", fontSize: 13, fontWeight: stab === t ? 600 : 500, color: stab === t ? c.tx : c.so, textAlign: "left", whiteSpace: "nowrap"}}>
                      {t}
                    </button>
                  ))}
                </div>

                <div style={{flex: 1, overflowY: "auto", padding: 20}}>
                  {stab === "General" && (
                    <div>
                      <div style={{marginBottom: 28}}>
                        <div style={{fontSize: 14, fontWeight: 700, color: c.tx, marginBottom: 10}}>Theme</div>
                        <div style={{display: "flex", gap: 8}}>
                          <button onClick={() => setDark(false)} style={{flex: 1, padding: "10px 14px", borderRadius: 10, border: dark ? "1px solid " + c.ln : "2px solid " + c.ac, background: dark ? "transparent" : c.ac + "12", cursor: "pointer", fontSize: 13, fontWeight: 600, color: dark ? c.so : c.ac}}>
                            ☀️ Light
                          </button>
                          <button onClick={() => setDark(true)} style={{flex: 1, padding: "10px 14px", borderRadius: 10, border: dark ? "2px solid " + c.ac : "1px solid " + c.ln, background: dark ? c.ac + "12" : "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: dark ? c.ac : c.so}}>
                            🌙 Dark
                          </button>
                        </div>
                      </div>

                      <div style={{marginBottom: 28}}>
                        <div style={{fontSize: 14, fontWeight: 700, color: c.tx, marginBottom: 10}}>Voice Recognition</div>
                        <div style={{padding: "12px 14px", borderRadius: 10, background: c.sf, border: "1px solid " + c.ln}}>
                          <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                            <span style={{fontSize: 13, color: c.tx}}>Enable voice input</span>
                            <div style={{width: 40, height: 22, borderRadius: 11, background: c.gr, cursor: "pointer", position: "relative"}}>
                              <div style={{position: "absolute", top: 2, left: 20, width: 18, height: 18, borderRadius: 9, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.15)", transition: "left .2s"}} />
                            </div>
                          </div>
                          <div style={{fontSize: 11, color: c.so, marginTop: 6}}>Allow Jaden to listen when you click the microphone button</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {stab === "Connection" && (
                    <div>
                      <div style={{marginBottom: 28}}>
                        <div style={{fontSize: 14, fontWeight: 700, color: c.tx, marginBottom: 10}}>OpenClaw Gateway</div>
                        <div style={{padding: "12px 14px", borderRadius: 10, background: connected ? c.gf : "#fef2f2", border: "1px solid " + (connected ? c.gr + "30" : "#fecaca")}}>
                          <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 8}}>
                            <span style={{width: 8, height: 8, borderRadius: "50%", background: connected ? c.gr : "#ef4444", animation: connected ? "pulse 1.5s ease infinite" : "none"}} />
                            <span style={{fontSize: 13, fontWeight: 600, color: connected ? c.gr : "#dc2626"}}>
                              {connected ? "Connected" : "Disconnected"}
                            </span>
                          </div>
                          <div style={{fontSize: 11, color: c.so, fontFamily: "monospace"}}>
                            openclaw-railway-template-production-b301.up.railway.app
                          </div>
                          <div style={{fontSize: 11, color: c.so, marginTop: 4}}>
                            Session: agent:main:main
                          </div>
                        </div>
                      </div>

                      <div style={{marginBottom: 28}}>
                        <div style={{fontSize: 14, fontWeight: 700, color: c.tx, marginBottom: 10}}>Connection Settings</div>
                        <div style={{fontSize: 11, color: c.so, marginBottom: 12}}>These settings control how Bloomie connects to Jaden</div>
                        {[
                          {l: "Auto-reconnect on disconnect", on: true},
                          {l: "Keep connection alive", on: true},
                          {l: "Enable connection notifications", on: false}
                        ].map((setting, i) => (
                          <div key={i} style={{display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 2 ? "1px solid " + c.ln : "none"}}>
                            <span style={{fontSize: 13, color: c.tx}}>{setting.l}</span>
                            <div style={{width: 40, height: 22, borderRadius: 11, background: setting.on ? c.gr : c.fa, cursor: "pointer", position: "relative"}}>
                              <div style={{position: "absolute", top: 2, left: setting.on ? 20 : 2, width: 18, height: 18, borderRadius: 9, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.15)", transition: "left .2s"}} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {stab === "Interface" && (
                    <div>
                      <div style={{marginBottom: 28}}>
                        <div style={{fontSize: 14, fontWeight: 700, color: c.tx, marginBottom: 10}}>Screen Viewer</div>
                        <div style={{fontSize: 11, color: c.so, marginBottom: 12}}>Control when Jaden's browser screen is visible</div>
                        <select value={scrM} onChange={(e) => setScrM(e.target.value)} style={{width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid " + c.ln, background: c.sf, fontSize: 13, color: c.tx, cursor: "pointer"}}>
                          <option value="docked">Docked (side panel)</option>
                          <option value="pop">Pop-out window</option>
                          <option value="hidden">Hidden</option>
                        </select>
                      </div>

                      <div style={{marginBottom: 28}}>
                        <div style={{fontSize: 14, fontWeight: 700, color: c.tx, marginBottom: 10}}>Sidebar</div>
                        <div style={{fontSize: 11, color: c.so, marginBottom: 12}}>Choose how the sidebar behaves</div>
                        <select value={sbO} onChange={(e) => setSbO(e.target.value)} style={{width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid " + c.ln, background: c.sf, fontSize: 13, color: c.tx, cursor: "pointer"}}>
                          <option value="full">Full sidebar</option>
                          <option value="mini">Mini sidebar (icons only)</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── POP-OUT SCREEN (persists across tabs) ── */}
      {scrM === "pop" && <Screen c={c} mob={mob} live={scrLive} mode="pop" setMode={setScrM} />}
      {scrM === "full" && <Screen c={c} mob={mob} live={scrLive} mode="full" setMode={setScrM} />}

      {/* ── BLOOMIE HELP BUBBLE ── */}
      {!hlpO && !stO && (
        <button onClick={() => setHlpO(true)} style={{position: "fixed", bottom: mob ? 16 : 24, right: mob ? 16 : 24, width: 56, height: 56, borderRadius: "50%", border: "none", background: "linear-gradient(135deg,#F4A261,#E76F8B)", cursor: "pointer", boxShadow: "0 4px 20px rgba(231,111,139,.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 90, transition: "transform .2s"}} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
          <Bloom sz={36} glow />
        </button>
      )}

      {/* ── HELP PANEL ── */}
      {hlpO && (
        <div style={{position: "fixed", bottom: mob ? 0 : 24, right: mob ? 0 : 24, width: mob ? "100%" : 380, height: mob ? "85vh" : 520, borderRadius: mob ? "20px 20px 0 0" : 20, background: c.cd, border: "1px solid " + c.ln, boxShadow: "0 12px 48px rgba(0,0,0,.25)", zIndex: 95, display: "flex", flexDirection: "column", overflow: "hidden", animation: "pop .2s ease"}}>
          <div style={{padding: "16px 20px", background: "linear-gradient(135deg,#F4A261,#E76F8B)", display: "flex", alignItems: "center", gap: 12}}>
            <Bloom sz={40} />
            <div style={{flex: 1}}>
              <div style={{fontSize: 16, fontWeight: 700, color: "#fff"}}>Bloomie Help</div>
              <div style={{fontSize: 11, color: "rgba(255,255,255,.8)"}}>Your AI assistant</div>
            </div>
            <button onClick={() => setHlpO(false)} style={{width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(255,255,255,.3)", background: "rgba(255,255,255,.15)", cursor: "pointer", color: "#fff", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center"}}>✕</button>
          </div>

          <div style={{flex: 1, overflowY: "auto", padding: 16}}>
            <div style={{fontSize: 12, fontWeight: 600, color: c.so, marginBottom: 12}}>How can I help?</div>
            {[
              {ic: "🚀", t: "Getting started", d: "Set up your OpenClaw connection"},
              {ic: "💬", t: "Chat with Jaden", d: "Tips for effective AI conversations"},
              {ic: "⏰", t: "Automation setup", d: "Configure cron jobs and heartbeats"},
              {ic: "🖥️", t: "Screen sharing", d: "Use browser automation features"},
              {ic: "⚙️", t: "Settings", d: "Customize your dashboard"},
              {ic: "🔧", t: "Troubleshooting", d: "Fix connection and performance issues"}
            ].map((item, i) => (
              <button key={i} style={{width: "100%", textAlign: "left", padding: "12px 14px", borderRadius: 12, border: "1px solid " + c.ln, background: c.cd, marginBottom: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "background .15s"}} onMouseEnter={e => e.currentTarget.style.background = c.hv} onMouseLeave={e => e.currentTarget.style.background = c.cd}>
                <span style={{fontSize: 20, flexShrink: 0}}>{item.ic}</span>
                <div>
                  <div style={{fontSize: 13, fontWeight: 600, color: c.tx}}>{item.t}</div>
                  <div style={{fontSize: 11, color: c.so, marginTop: 1}}>{item.d}</div>
                </div>
              </button>
            ))}
          </div>

          <div style={{padding: "12px 16px", borderTop: "1px solid " + c.ln, display: "flex", alignItems: "center", gap: 8}}>
            <input placeholder="Ask Bloomie anything…" style={{flex: 1, padding: "10px 14px", borderRadius: 12, border: "1.5px solid " + c.ln, background: c.sf, fontSize: 13, color: c.tx, outline: "none"}} />
            <button style={{width: 38, height: 38, borderRadius: "50%", border: "none", background: "linear-gradient(135deg,#F4A261,#E76F8B)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}