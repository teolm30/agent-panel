import { useState } from 'react';
import Head from 'next/head';

export default function AgentPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState('');
  const [agentList] = useState([
    { id: -1, name: 'Main Agent (Jarvis)', type: 'main', status: 'active', desc: 'Primary assistant' },
    { id: -2, name: 'MCraft Builder', type: 'subagent', status: 'idle', desc: 'Minecraft clone project' },
    { id: -3, name: 'FoxOS Compat', type: 'subagent', status: 'idle', desc: 'FoxOS compatibility work' },
  ]);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [customId, setCustomId] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '2012') {
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const targetId = selectedAgent ? selectedAgent.id : parseInt(customId);
    if (!targetId && targetId !== 0) return;
    
    // Open Telegram direct chat - message goes to Jarvis
    const encoded = encodeURIComponent(`[AGENT:${targetId}] ${message}`);
    // Use t.me/c/ with your Telegram user ID or the direct chat
    window.open(`https://t.me/JarvisClawTeobot?text=${encoded}`, '_blank');
    
    const agentName = selectedAgent ? selectedAgent.name : `Agent ${targetId}`;
    setSent(`Opening Telegram to send to ${agentName}...`);
    setMessage('');
  };

  const selectAgent = (agent) => {
    setSelectedAgent(agent);
    setCustomId('');
    setShowAgentForm(false);
  };

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
          <button className="logout-btn" onClick={() => setAuthenticated(false)}>Logout</button>
        </div>
      </header>

      <main>
        <div className="container">
          
          <section className="agents-section">
            <h2>Active Agents</h2>
            <div className="agents-grid">
              {agentList.map((agent, i) => (
                <div
                  key={i}
                  className={`agent-card ${selectedAgent?.id === agent.id ? 'selected' : ''}`}
                  onClick={() => selectAgent(agent)}
                >
                  <div className="agent-icon">
                    {agent.type === 'main' ? '🤖' : '⚙️'}
                  </div>
                  <div className="agent-info">
                    <h3>{agent.name}</h3>
                    <p>{agent.desc}</p>
                    <span className={`status-badge ${agent.status}`}>{agent.status}</span>
                  </div>
                  <div className="agent-id">#{agent.id}</div>
                </div>
              ))}
              
              <div
                className={`agent-card custom ${!selectedAgent && customId ? 'selected' : ''} ${showAgentForm ? 'expanded' : ''}`}
                onClick={() => { setShowAgentForm(true); setSelectedAgent(null); }}
              >
                <div className="agent-icon">📝</div>
                <div className="agent-info">
                  <h3>Custom Agent ID</h3>
                  <p>Enter any agent ID manually</p>
                  {showAgentForm && (
                    <input
                      type="number"
                      value={customId}
                      onChange={(e) => setCustomId(e.target.value)}
                      placeholder="e.g. -4"
                      className="id-input"
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  )}
                </div>
                {customId && <div className="agent-id">#{customId}</div>}
              </div>
            </div>
          </section>

          <section className="message-section">
            <h2>
              Send Message
              {selectedAgent && (
                <span className="target-label">→ {selectedAgent.name}</span>
              )}
              {(!selectedAgent && customId) && (
                <span className="target-label">→ Agent #{customId}</span>
              )}
              {(!selectedAgent && !customId) && (
                <span className="target-label-none"> (select agent first)</span>
              )}
            </h2>
            
            <form onSubmit={handleSend}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message to the agent..."
                rows={5}
                disabled={!selectedAgent && !customId}
              />
              <button
                type="submit"
                className="send-btn"
                disabled={!message.trim() || (!selectedAgent && !customId)}
              >
                Open Telegram & Send to Jarvis →
              </button>
            </form>
            
            {sent && (
              <div className="sent-confirm">
                {sent}
                <br/>
                <small>Press <strong>Send</strong> in Telegram to dispatch the agent. Include <strong>[AGENT:ID]</strong> in the message so Jarvis knows which agent to route to.</small>
              </div>
            )}
          </section>

          <section className="info-section">
            <h3>How it works</h3>
            <ol>
              <li>Select an agent from the list (or enter a custom ID)</li>
              <li>Type your message below</li>
              <li>Click <strong>Open Telegram & Send</strong></li>
              <li>Your message will include <code>[AGENT:ID]</code> tag</li>
              <li>Jarvis sees the tag and routes to the correct sub-agent</li>
            </ol>
            <div className="bot-note">
              <strong>Bot username:</strong> @JarvisClawTeobot
            </div>
          </section>
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
          padding: 16px 0; position: sticky; top: 0; z-index: 100; backdrop-filter: blur(10px);
        }
        .header-content { max-width: 900px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 24px; color: #fff; }
        .logo span { margin-left: 12px; font-weight: 700; }
        .logout-btn {
          padding: 8px 16px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 6px; color: #ef4444; cursor: pointer; font-size: 14px;
        }
        .logout-btn:hover { background: rgba(239, 68, 68, 0.3); }
        main { padding: 40px 24px; }
        .container { max-width: 900px; margin: 0 auto; }
        section { margin-bottom: 40px; }
        h2 { font-size: 20px; color: #fff; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        h3 { font-size: 16px; color: #ccc; margin-bottom: 12px; }
        .target-label { font-size: 14px; color: #6366f1; font-weight: 400; }
        .target-label-none { font-size: 14px; color: #666; font-weight: 400; }
        
        .agents-grid { display: flex; flex-direction: column; gap: 12px; }
        .agent-card {
          background: rgba(30, 30, 50, 0.8); border: 2px solid rgba(100, 100, 150, 0.2);
          border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 16px;
          cursor: pointer; transition: all 0.2s;
        }
        .agent-card:hover { border-color: rgba(99, 102, 241, 0.4); transform: translateX(4px); }
        .agent-card.selected { border-color: #6366f1; background: rgba(99, 102, 241, 0.15); }
        .agent-card.custom { border-style: dashed; }
        .agent-card.expanded { border-color: #8b5cf6; }
        .agent-icon { font-size: 36px; }
        .agent-info { flex: 1; }
        .agent-info h3 { font-size: 16px; color: #fff; margin-bottom: 4px; }
        .agent-info p { color: #888; font-size: 13px; margin-bottom: 8px; }
        .status-badge { font-size: 11px; padding: 2px 8px; border-radius: 10px; text-transform: uppercase; letter-spacing: 1px; }
        .status-badge.active { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
        .status-badge.idle { background: rgba(100, 100, 150, 0.2); color: #a0a0c0; }
        .agent-id { font-size: 18px; font-weight: 700; color: #6366f1; }
        .id-input {
          margin-top: 8px; padding: 8px 12px; width: 100px; font-size: 16px;
          border: 1px solid #444; border-radius: 6px; background: #1a1a2e; color: #fff; outline: none;
        }
        .id-input:focus { border-color: #6366f1; }
        
        .message-section {
          background: rgba(30, 30, 50, 0.6); border: 1px solid rgba(100, 100, 150, 0.2);
          border-radius: 12px; padding: 24px;
        }
        textarea {
          width: 100%; padding: 16px; font-size: 15px; font-family: inherit;
          border: 1px solid #444; border-radius: 8px; background: rgba(20, 20, 40, 0.8);
          color: #fff; resize: vertical; outline: none; margin-bottom: 16px;
        }
        textarea:focus { border-color: #6366f1; }
        textarea:disabled { opacity: 0.5; cursor: not-allowed; }
        .send-btn {
          width: 100%; padding: 14px 24px; font-size: 15px; font-weight: 600;
          background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
          border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s;
        }
        .send-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4); }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .sent-confirm {
          margin-top: 16px; padding: 12px 16px; background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px;
          color: #4ade80; font-size: 14px; line-height: 1.6;
        }
        .sent-confirm small { color: #888; display: block; margin-top: 8px; }
        .sent-confirm code { background: rgba(99,102,241,0.3); padding: 2px 6px; border-radius: 4px; }
        
        .info-section {
          background: rgba(30, 30, 50, 0.4); border: 1px solid rgba(100, 100, 150, 0.15);
          border-radius: 12px; padding: 20px;
        }
        ol { padding-left: 24px; color: #888; font-size: 14px; line-height: 2; }
        li { margin-bottom: 4px; }
        code { font-family: monospace; color: #a78bfa; }
        .bot-note {
          margin-top: 16px; padding: 12px 16px; background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 8px;
          color: #a0a0c0; font-size: 14px;
        }
      `}</style>
    </div>
  );
}
