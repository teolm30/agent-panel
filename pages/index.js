import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

const AGENTS = [
  { id: 'jarvis', name: 'Jarvis', emoji: '🤖', desc: 'Main Agent', bot: '@JarvisClawTeobot', color: '#6366f1' },
  { id: 'mcraft', name: 'MCraft Builder', emoji: '⛏️', desc: 'Minecraft Projects', bot: '@ClawHp1_bot', color: '#22c55e' },
  { id: 'foxos', name: 'FoxOS Agent', emoji: '🦊', desc: 'FoxOS Development', bot: '@ClawHp2_bot', color: '#f59e0b' }
];

export default function AgentPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('jarvis');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState(null);
  const chatEndRef = useRef(null);
  const messagesEndRef = useRef(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '2012') {
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending) return;
    
    const msgText = message;
    const currentAgent = AGENTS.find(a => a.id === selectedAgent);
    
    // Add user message to chat
    setMessages(prev => [...prev, {
      id: Date.now(),
      from: 'user',
      text: msgText,
      agent: selectedAgent,
      time: new Date().toLocaleTimeString()
    }]);
    
    setMessage('');
    setSending(true);
    setStatus(null);
    
    try {
      const res = await fetch(`/api/send?text=${encodeURIComponent(msgText)}&agent=${selectedAgent}`);
      const data = await res.json();
      
      if (data.success) {
        setStatus({ type: 'info', text: `📱 Sent to ${currentAgent.name} via ${currentAgent.bot}` });
        // Add system message showing it was dispatched
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            from: 'system',
            text: `✓ Message dispatched to ${currentAgent.emoji} ${currentAgent.name}. Response will come to your Telegram.`,
            time: new Date().toLocaleTimeString()
          }]);
        }, 500);
      } else {
        setStatus({ type: 'error', text: `Failed: ${data.error}` });
      }
    } catch (err) {
      setStatus({ type: 'error', text: 'Network error. Try again.' });
    }
    
    setSending(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!authenticated) {
    return (
      <div className="login-bg">
        <Head><title>Agent Control Panel</title></Head>
        <div className="login-box">
          <div className="logo">🎛️</div>
          <h1>Agent Panel</h1>
          <p>Enter password to access</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••"
              autoFocus
            />
            {error && <p className="error">Incorrect password</p>}
            <button type="submit">Unlock</button>
          </form>
        </div>
        <style jsx>{`
          .login-bg {
            min-height: 100vh; display: flex; align-items: center; justify-content: center;
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f23 100%);
            font-family: 'Segoe UI', system-ui, sans-serif;
          }
          .login-box {
            background: rgba(30, 30, 50, 0.9); border: 1px solid rgba(100, 100, 150, 0.3);
            border-radius: 16px; padding: 48px; text-align: center;
            backdrop-filter: blur(10px); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
          }
          .logo { font-size: 64px; margin-bottom: 16px; }
          h1 { color: #fff; margin: 0 0 8px 0; font-size: 28px; }
          p { color: #888; margin: 0 0 24px 0; }
          input {
            width: 200px; padding: 12px 16px; font-size: 18px;
            border: 1px solid #444; border-radius: 8px;
            background: #1a1a2e; color: #fff; text-align: center; outline: none;
          }
          input:focus { border-color: #6366f1; }
          .error { color: #ef4444; font-size: 14px; margin-top: 8px; }
          button {
            width: 100%; margin-top: 16px; padding: 12px 24px; font-size: 16px; font-weight: 600;
            background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
            border: none; border-radius: 8px; cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          button:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4); }
        `}</style>
      </div>
    );
  }

  const currentAgent = AGENTS.find(a => a.id === selectedAgent);

  return (
    <div className="panel-bg">
      <Head><title>Agent Control Panel</title></Head>
      
      <header>
        <div className="header-content">
          <div className="logo">🎛️ <span>Agent Panel</span></div>
          <button className="logout-btn" onClick={() => setAuthenticated(false)}>Logout</button>
        </div>
      </header>

      <main>
        {/* Agent Selector */}
        <div className="agents-row">
          {AGENTS.map(agent => (
            <div
              key={agent.id}
              className={`agent-card ${selectedAgent === agent.id ? 'selected' : ''}`}
              style={{ '--agent-color': agent.color }}
              onClick={() => setSelectedAgent(agent.id)}
            >
              <span className="agent-icon">{agent.emoji}</span>
              <div className="agent-info">
                <span className="agent-name">{agent.name}</span>
                <span className="agent-desc">{agent.desc}</span>
                <span className="agent-bot">{agent.bot}</span>
              </div>
              {selectedAgent === agent.id && <span className="active-badge">✓</span>}
            </div>
          ))}
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          <div className="chat-header">
            <span className="chat-icon">{currentAgent.emoji}</span>
            <span>Routing to <strong>{currentAgent.name}</strong></span>
            <span className="chat-bot">{currentAgent.bot}</span>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="welcome-msg">
                <span className="welcome-icon">💬</span>
                <p>Send a message to <strong>{currentAgent.name}</strong></p>
                <small>Messages are sent via Telegram bot. Responses come to your Telegram.</small>
              </div>
            )}
            
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.from}`}>
                <div className="msg-icon">
                  {msg.from === 'user' && '👤'}
                  {msg.from === 'system' && 'ℹ️'}
                  {msg.from === 'jarvis' && currentAgent.emoji}
                </div>
                <div className="msg-body">
                  <div className="msg-meta">
                    <span className="msg-sender">
                      {msg.from === 'user' && `You → ${currentAgent.name}`}
                      {msg.from === 'system' && 'System'}
                      {msg.from === 'jarvis' && currentAgent.name}
                    </span>
                    <span className="msg-time">{msg.time}</span>
                  </div>
                  <div className="msg-text">{msg.text}</div>
                </div>
              </div>
            ))}
            
            {status && (
              <div className={`status-bar ${status.type}`}>
                {status.text}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Compose */}
          <form className="compose-form" onSubmit={handleSend}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Message ${currentAgent.name} via ${currentAgent.bot}...`}
              rows={2}
              disabled={sending}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            <div className="compose-footer">
              <span className="route-info">
                Route: You → {currentAgent.bot} → {currentAgent.name}
              </span>
              <button 
                type="submit" 
                className="send-btn"
                disabled={!message.trim() || sending}
                style={{ background: currentAgent.color }}
              >
                {sending ? 'Sending...' : `📤 Send via ${currentAgent.emoji}`}
              </button>
            </div>
          </form>
        </div>
      </main>

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f23 100%);
          min-height: 100vh; font-family: 'Segoe UI', system-ui, sans-serif; color: #e0e0e0;
        }
        header {
          background: rgba(20, 20, 35, 0.95); border-bottom: 1px solid rgba(100, 100, 150, 0.2);
          padding: 12px 0; position: sticky; top: 0; z-index: 100; backdrop-filter: blur(10px);
        }
        .header-content { max-width: 900px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 22px; color: #fff; }
        .logo span { margin-left: 10px; font-weight: 700; }
        .logout-btn {
          padding: 8px 16px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 6px; color: #ef4444; cursor: pointer; font-size: 13px;
        }
        .logout-btn:hover { background: rgba(239, 68, 68, 0.3); }
        
        main { max-width: 900px; margin: 0 auto; padding: 24px 20px; }
        
        .agents-row {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;
        }
        .agent-card {
          background: rgba(30, 30, 50, 0.7); border: 2px solid rgba(100, 100, 150, 0.2);
          border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; gap: 12px; position: relative;
        }
        .agent-card:hover { border-color: var(--agent-color); transform: translateY(-2px); }
        .agent-card.selected { 
          border-color: var(--agent-color); 
          background: rgba(99, 102, 241, 0.1);
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
        }
        .agent-icon { font-size: 32px; }
        .agent-info { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .agent-name { font-size: 16px; font-weight: 700; color: #fff; }
        .agent-desc { font-size: 12px; color: #888; }
        .agent-bot { font-size: 11px; color: var(--agent-color); margin-top: 4px; }
        .active-badge {
          position: absolute; top: 10px; right: 10px;
          background: var(--agent-color); color: #fff;
          width: 20px; height: 20px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; font-size: 12px;
        }
        
        .chat-area {
          background: rgba(30, 30, 50, 0.7); border: 1px solid rgba(100, 100, 150, 0.2);
          border-radius: 12px; overflow: hidden;
        }
        .chat-header {
          padding: 16px 20px; border-bottom: 1px solid rgba(100, 100, 150, 0.15);
          display: flex; align-items: center; gap: 12px; font-size: 14px;
          background: rgba(40, 40, 60, 0.3);
        }
        .chat-icon { font-size: 24px; }
        .chat-header strong { color: #fff; }
        .chat-bot { margin-left: auto; color: var(--agent-color, #6366f1); font-size: 12px; }
        
        .chat-messages { padding: 20px; min-height: 300px; max-height: 50vh; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
        
        .welcome-msg {
          text-align: center; padding: 40px 20px;
          background: rgba(40, 40, 60, 0.5); border-radius: 12px;
        }
        .welcome-icon { font-size: 48px; display: block; margin-bottom: 12px; }
        .welcome-msg p { color: #ccc; font-size: 14px; }
        .welcome-msg strong { color: #fff; }
        .welcome-msg small { display: block; margin-top: 8px; color: #666; font-size: 12px; }
        
        .message {
          display: flex; gap: 12px; padding: 12px 16px; border-radius: 12px;
          max-width: 85%; animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .message.user { background: rgba(99, 102, 241, 0.2); border: 1px solid rgba(99, 102, 241, 0.3); align-self: flex-end; flex-direction: row-reverse; }
        .message.system { background: rgba(100, 100, 150, 0.2); border: 1px solid rgba(100, 100, 150, 0.3); align-self: center; max-width: 90%; }
        .message.jarvis { background: rgba(74, 222, 128, 0.15); border: 1px solid rgba(74, 222, 128, 0.3); align-self: flex-start; }
        
        .msg-icon { font-size: 20px; flex-shrink: 0; }
        .msg-body { display: flex; flex-direction: column; gap: 4px; }
        .msg-meta { display: flex; align-items: center; gap: 8px; }
        .msg-sender { font-size: 12px; font-weight: 600; color: #888; }
        .msg-time { font-size: 10px; color: #666; }
        .msg-text { font-size: 14px; line-height: 1.5; }
        
        .status-bar {
          text-align: center; padding: 8px 16px; border-radius: 20px; font-size: 12px;
          align-self: center;
        }
        .status-bar.info { background: rgba(99, 102, 241, 0.3); color: #a5b4fc; }
        .status-bar.success { background: rgba(74, 222, 128, 0.3); color: #4ade80; }
        .status-bar.error { background: rgba(239, 68, 68, 0.3); color: #ef4444; }
        
        .compose-form { padding: 16px 20px; border-top: 1px solid rgba(100, 100, 150, 0.15); }
        .compose-form textarea {
          width: 100%; padding: 12px 14px; font-size: 14px; font-family: inherit;
          border: 1px solid #444; border-radius: 10px; background: rgba(20, 20, 40, 0.8);
          color: #fff; resize: none; outline: none;
        }
        .compose-form textarea:focus { border-color: var(--agent-color, #6366f1); }
        .compose-form textarea:disabled { opacity: 0.5; }
        .compose-footer { 
          display: flex; justify-content: space-between; align-items: center; margin-top: 12px;
        }
        .route-info { font-size: 11px; color: #666; }
        .send-btn {
          padding: 10px 24px; font-size: 14px; font-weight: 600;
          color: #fff; border: none; border-radius: 8px; cursor: pointer;
          transition: all 0.2s;
        }
        .send-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        @media (max-width: 768px) {
          .agents-row { grid-template-columns: 1fr; }
          .message { max-width: 95%; }
        }
      `}</style>
    </div>
  );
}