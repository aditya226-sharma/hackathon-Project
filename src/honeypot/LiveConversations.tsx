import { useState } from 'react';

export function LiveConversations() {
  const [selectedChat, setSelectedChat] = useState(0);

  const conversations = [
    { id: 0, name: 'Unknown +91-98765-43210', score: 87, status: 'scam', lastMsg: 'Please send OTP immediately' },
    { id: 1, name: 'Unknown +91-87654-32109', score: 72, status: 'suspicious', lastMsg: 'Click this link to claim prize' },
    { id: 2, name: 'Unknown +91-76543-21098', score: 15, status: 'legitimate', lastMsg: 'Thank you for your help' }
  ];

  const messages = [
    { role: 'scammer', text: 'Hello sir, I am calling from bank', time: '10:23 AM' },
    { role: 'ai', text: 'Which bank are you calling from?', time: '10:24 AM' },
    { role: 'scammer', text: 'State Bank of India. Your account has suspicious activity', time: '10:24 AM' },
    { role: 'ai', text: 'What kind of suspicious activity?', time: '10:25 AM' },
    { role: 'scammer', text: 'Someone trying to withdraw money. Please share OTP to stop', time: '10:25 AM' },
    { role: 'ai', text: 'What is your employee ID?', time: '10:26 AM' }
  ];

  return (
    <div className="conversations-page">
      <div className="conversations-list">
        <h3>Active Conversations</h3>
        {conversations.map(conv => (
          <div 
            key={conv.id} 
            className={`conversation-item ${selectedChat === conv.id ? 'active' : ''}`}
            onClick={() => setSelectedChat(conv.id)}
          >
            <div className="conv-header">
              <span className="conv-name">{conv.name}</span>
              <span className={`conv-status ${conv.status}`}>{conv.status.toUpperCase()}</span>
            </div>
            <div className="conv-score">Scam Score: {conv.score}%</div>
            <div className="conv-preview">{conv.lastMsg}</div>
          </div>
        ))}
      </div>

      <div className="chat-window">
        <div className="chat-header">
          <div>
            <h3>{conversations[selectedChat].name}</h3>
            <span className={`status-badge ${conversations[selectedChat].status}`}>
              {conversations[selectedChat].status.toUpperCase()}
            </span>
          </div>
          <div className="scam-score-display">
            Scam Intent: <span className="score-value">{conversations[selectedChat].score}%</span>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              <div className="message-bubble">
                {msg.text}
                {msg.role === 'scammer' && msg.text.includes('OTP') && (
                  <span className="keyword-highlight">⚠️ Scam Keyword</span>
                )}
              </div>
              <div className="message-time">{msg.time}</div>
            </div>
          ))}
          <div className="typing-indicator">
            <span></span><span></span><span></span>
            <span className="typing-text">AI Agent is typing...</span>
          </div>
        </div>

        <div className="chat-input-area">
          <input type="text" placeholder="AI Agent will respond automatically..." disabled />
          <button disabled>🤖 Auto Mode</button>
        </div>
      </div>
    </div>
  );
}
