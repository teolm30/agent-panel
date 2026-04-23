import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

export default function AgentPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { from: 'system', text: 'Connected to Jarvis via Telegram bot' }
  ]);
  const [sending, setSending] = useState(false);
  const [customId, setCustomId] = useState('');
  const [showAgentForm, setShowAgentForm] = useState(false);
  const chatEndRef = useRef(null);
  
  const agentList = [
    { id: -1, name: 'Main Agent (Jarvis)', type: 'main', status: 'active', desc: 'Primary assistant' },
    { id: -2, name: 'MCraft Builder', type: 'subagent', status: 'idle', desc: 'Minecraft clone project' },
    { id: -3, name: 'FoxOS Compat', type: 'subagent', status: 'idle', desc: 'FoxOS compatibility work' },
  ];

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
    
    const targetId = selectedAgent ? selectedAgent.id : parseInt(customId);
    if (!targetId && targetId !== 0) return;
    
    const fullMessage = `[AGENT:${targetId}] ${message}`;
    const userMsg = message;
    
    // Add user message
    setChatMessages(prev => [...prev, { from: 'user', text: userMsg, agent: targetId }]);
    setMessage('');
    setSending(true);
    
    try {
      const res = await fetch(`/api/send?text=${encodeURIComponent(fullMessage)}`);
      const data = await res.json();
      
      if (data.success) {
        setChatMessages(prev => [...prev, { 
          from: 'jarvis', 
          text: `✓ Message dispatched to agent ${targetId}`,
          agent: null 
        }]);
      } else {
        setChatMessages(prev => [...prev, { 
          from: 'system', 
          text: `Send failed: ${data.error}`,
          agent: null 
        }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { 
        from: 'system', 
        text: 'Network error. Try again.',
        agent: null 
      }]);
    }
    
    setSending(false);
  };

  const selectAgent = (agent) => {
    setSelectedAgent(agent);
    setCustomId('');
    setShowAgentForm(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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

  return (
    <div className="panel-bg">
      <Head><title>Agent Control Panel</title></Head>
      
      <header>
        <div className="header-content">
          <div className="logo">🎛️ <span>Agent Panel</span></div>
          <div className="header-right">
            <span className="connected-badge">✓ Telegram Connected</span>
            <button className="logout-btn" onClick={() => setAuthenticated(false)}>Logout</button>
          </div>
        </div>
      </header>

      <main>
        <div className="main-grid">
          
          {/* Left: Agent List */}
          <div className="agents-panel">
            <h2>Agents</h2>
            <div className="agents-list">
              {agentList.map((agent, i) => (
                <div
                  key={i}
                  className={`agent-item ${selectedAgent?.id === agent.id ? 'selected' : ''}`}
                  onClick={() => selectAgent(agent)}
                >
                  <span className="agent-emoji">{agent.type === 'main' ? '🤖' : '⚙️'}</span>
                  <div className="agent-details">
                    <span className="agent-name">{agent.name}</span>
                    <span className={`agent-status ${agent.status}`}>{agent.status}</span>
                  </div>
                  <span className="agent-num">#{agent.id}</span>
                </div>
              ))}
              
              <div 
                className={`agent-item custom ${!selectedAgent && customId ? 'selected' : ''}`}
                onClick={() => { setShowAgentForm(true); setSelectedAgent(null); }}
              >
                <span className="agent-emoji">📝</span>
                <div className="agent-details">
                  <span className="agent-name">Custom ID</span>
                  {showAgentForm && (
                    <input
                      type="number"
                      value={customId}
                      onChange={(e) => setCustomId(e.target.value)}
                      placeholder="-4"
                      className="custom-id-input"
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  )}
                </div>
                {customId && <span className="agent-num">#{customId}</span>}
              </div>
            </div>

            <div className="bot-info">
              <small>Bot: <code>@JarvisClawTeobot</code></small>
            </div>
          </div>

          {/* Right: Chat + Compose */}
          <div className="chat-panel">
            <div className="chat-header">
              <h2>
                Chat 
                {selectedAgent && <span className="chatting-with">→ {selectedAgent.name}</span>}
                {(!selectedAgent && customId) && <span className="chatting-with">→ Agent #{customId}</span>}
                {(!selectedAgent && !customId) && <span className="no-agent"> (select agent first)</span>}
              </h2>
            </div>

            {/* Chat Messages */}
            <div className="chat-messages">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`chat-msg ${msg.from}`}>
                  {msg.from === 'system' && <span className="msg-icon">ℹ️</span>}
                  {msg.from === 'user' && <span className="msg-icon">👤</span>}
                  {msg.from === 'jarvis' && <span className="msg-icon">🤖</span>}
                  <div className="msg-content">
                    {msg.agent && <span className="msg-tag">[Agent {msg.agent}]</span>}
                    <span className="msg-text">{msg.text}</span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Compose */}
            <form className="compose-form" onSubmit={handleSend}>
              <div className="compose-row">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={selectedAgent || customId ? "Type your message..." : "Select an agent first..."}
                  rows={2}
                  disabled={!selectedAgent && !customId}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                />
              </div>
              <div className="compose-actions">
                {selectedAgent && (
                  <span className="target-display">
                    To: <strong>{selectedAgent.name}</strong> #{selectedAgent.id}
                  </span>
                )}
                {!selectedAgent && customId && (
                  <span className="target-display">
                    To: <strong>Agent #{customId}</strong>
                  </span>
                )}
                <button 
                  type="submit" 
                  className="send-btn"
                  disabled={!message.trim() || (!selectedAgent && !customId) || sending}
                >
                  {sending ? 'Sending...' : 'Send via Telegram'}
                </button>
              </div>
            </form>
          </div>
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
        .header-content { max-width: 1100px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 22px; color: #fff; }
        .logo span { margin-left: 10px; font-weight: 700; }
        .header-right { display: flex; align-items: center; gap: 16px; }
        .connected-badge { font-size: 13px; color: #4ade80; background: rgba(74, 222, 128, 0.15); padding: 4px 10px; border-radius: 12px; }
        .logout-btn {
          padding: 8px 16px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 6px; color: #ef4444; cursor: pointer; font-size: 13px;
        }
        .logout-btn:hover { background: rgba(239, 68, 68, 0.3); }
        
        main { padding: 24px 20px; }
        .main-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 280px 1fr; gap: 24px; }
        
        .agents-panel { background: rgba(30, 30, 50, 0.7); border: 1px solid rgba(100, 100, 150, 0.2); border-radius: 12px; padding: 20px; height: fit-content; }
        .agents-panel h2 { font-size: 16px; color: #fff; margin-bottom: 16px; }
        .agents-list { display: flex; flex-direction: column; gap: 8px; }
        
        .agent-item {
          display: flex; align-items: center; gap: 10px; padding: 12px;
          background: rgba(40, 40, 60, 0.6); border: 2px solid transparent;
          border-radius: 10px; cursor: pointer; transition: all 0.2s;
        }
        .agent-item:hover { border-color: rgba(99, 102, 241, 0.4); transform: translateX(3px); }
        .agent-item.selected { border-color: #6366f1; background: rgba(99, 102, 241, 0.15); }
        .agent-item.custom { border-style: dashed; }
        .agent-emoji { font-size: 24px; }
        .agent-details { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .agent-name { font-size: 14px; color: #fff; }
        .agent-status { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        .agent-status.active { color: #4ade80; }
        .agent-status.idle { color: #888; }
        .agent-num { font-size: 14px; font-weight: 700; color: #6366f1; }
        .custom-id-input {
          margin-top: 6px; padding: 6px 10px; width: 80px; font-size: 14px;
          border: 1px solid #555; border-radius: 6px; background: #1a1a2e; color: #fff; outline: none;
        }
        .custom-id-input:focus { border-color: #6366f1; }
        .bot-info { margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(100, 100, 150, 0.2); }
        .bot-info small { color: #666; font-size: 12px; }
        .bot-info code { color: #8b5cf6; }
        
        .chat-panel {
          background: rgba(30, 30, 50, 0.7); border: 1px solid rgba(100, 100, 150, 0.2);
          border-radius: 12px; display: flex; flex-direction: column; height: 70vh;
        }
        .chat-header { padding: 16px 20px; border-bottom: 1px solid rgba(100, 100, 150, 0.15); }
        .chat-header h2 { font-size: 16px; color: #fff; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .chatting-with { color: #6366f1; font-weight: 400; font-size: 14px; }
        .no-agent { color: #666; font-weight: 400; font-size: 14px; }
        
        .chat-messages { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; }
        
        .chat-msg { display: flex; align-items: flex-start; gap: 10px; padding: 10px 14px; border-radius: 12px; max-width: 85%; }
        .chat-msg.user { background: rgba(99, 102, 241, 0.2); border: 1px solid rgba(99, 102, 241, 0.3); align-self: flex-end; flex-direction: row-reverse; }
        .chat-msg.jarvis { background: rgba(74, 222, 128, 0.1); border: 1px solid rgba(74, 222, 128, 0.2); align-self: flex-start; }
        .chat-msg.system { background: rgba(100, 100, 150, 0.2); border: 1px solid rgba(100, 100, 150, 0.3); align-self: flex-start; font-size: 13px; }
        .msg-icon { font-size: 18px; flex-shrink: 0; }
        .msg-content { display: flex; flex-direction: column; gap: 4px; }
        .msg-tag { font-size: 11px; color: #6366f1; font-weight: 600; }
        .msg-text { font-size: 14px; line-height: 1.5; }
        
        .compose-form { padding: 16px 20px; border-top: 1px solid rgba(100, 100, 150, 0.15); }
        .compose-row textarea {
          width: 100%; padding: 12px 14px; font-size: 14px; font-family: inherit;
          border: 1px solid #444; border-radius: 10px; background: rgba(20, 20, 40, 0.8);
          color: #fff; resize: none; outline: none;
        }
        .compose-row textarea:focus { border-color: #6366f1; }
        .compose-row textarea:disabled { opacity: 0.5; }
        .compose-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
        .target-display { font-size: 13px; color: #888; }
        .target-display strong { color: #6366f1; }
        .send-btn {
          padding: 10px 20px; font-size: 14px; font-weight: 600;
          background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
          border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s;
        }
        .send-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4); }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        @media (max-width: 768px) {
          .main-grid { grid-template-columns: 1fr; }
          .chat-panel { height: 60vh; }
        }
      `}</style>
    </div>
  );
}