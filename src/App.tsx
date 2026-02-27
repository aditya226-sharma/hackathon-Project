import { useState, useEffect, lazy, Suspense } from 'react';
import { initSDK, getAccelerationMode } from './runanywhere';
import { getPrivacyMode, setPrivacyMode } from './privacy';

const ChatTab = lazy(() => import('./components/ChatTab').then(m => ({ default: m.ChatTab })));
const VisionTab = lazy(() => import('./components/VisionTab').then(m => ({ default: m.VisionTab })));
const VoiceTab = lazy(() => import('./components/VoiceTab').then(m => ({ default: m.VoiceTab })));
const SettingsModal = lazy(() => import('./components/SettingsModal').then(m => ({ default: m.SettingsModal })));

type Tab = 'chat' | 'vision' | 'voice';

interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  messages: Array<{ role: string; text: string }>;
}

export function App() {
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [privacyMode, setPrivacyModeState] = useState(getPrivacyMode());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Load chat sessions from localStorage
    const saved = localStorage.getItem('chatSessions');
    if (saved) {
      try {
        setChatSessions(JSON.parse(saved));
      } catch {}
    }
    
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'fetch';
    preloadLink.href = 'https://huggingface.co';
    document.head.appendChild(preloadLink);
    
    initSDK()
      .then(() => setSdkReady(true))
      .catch((err) => setSdkError(err instanceof Error ? err.message : String(err)));
      
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (sdkError) {
    return (
      <div className="app-loading">
        <h2>SDK Error</h2>
        <p className="error-text">{sdkError}</p>
      </div>
    );
  }

  if (!sdkReady) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <h2>Loading RunAnywhere SDK...</h2>
        <p>Initializing on-device AI engine</p>
      </div>
    );
  }

  const accel = getAccelerationMode();

  const togglePrivacy = () => {
    const newMode = !privacyMode;
    setPrivacyMode(newMode);
    setPrivacyModeState(newMode);
  };

  const saveSession = (messages: Array<{ role: string; text: string }>) => {
    if (messages.length === 0) return;
    
    const sessionId = currentSessionId || Date.now().toString();
    const title = messages[0]?.text.slice(0, 50) || 'New Chat';
    
    const newSession: ChatSession = {
      id: sessionId,
      title,
      timestamp: Date.now(),
      messages
    };
    
    const updated = chatSessions.filter(s => s.id !== sessionId);
    updated.unshift(newSession);
    setChatSessions(updated);
    localStorage.setItem('chatSessions', JSON.stringify(updated));
    setCurrentSessionId(sessionId);
  };

  const loadSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setShowHistory(false);
  };

  const newChat = () => {
    setCurrentSessionId(null);
    setShowHistory(false);
    // Force ChatTab to reset by triggering a re-render
    const event = new CustomEvent('newChat');
    window.dispatchEvent(event);
  };

  const deleteSession = (sessionId: string) => {
    const updated = chatSessions.filter(s => s.id !== sessionId);
    setChatSessions(updated);
    localStorage.setItem('chatSessions', JSON.stringify(updated));
    if (currentSessionId === sessionId) setCurrentSessionId(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          {activeTab === 'chat' && (
            <button className="btn btn-icon" onClick={() => setShowHistory(!showHistory)} title="Chat History">
              📚
            </button>
          )}
          <div className="logo-icon">🤖</div>
          <div>
            <h1>RunAnywhere AI</h1>
            <p className="header-subtitle">On-Device Intelligence</p>
          </div>
        </div>
        <div className="header-controls">
          {!isOnline && (
            <span className="badge badge-offline" title="Offline Mode - All AI runs on your device">
              ⚡ OFFLINE
            </span>
          )}
          {accel && <span className="badge badge-accel">{accel === 'webgpu' ? '🚀 WebGPU' : '⚙️ CPU'}</span>}
          <button 
            className={`btn btn-sm btn-privacy ${privacyMode ? 'active' : ''}`}
            onClick={togglePrivacy}
            title="Privacy Mode - All data stays on your device"
          >
            🔒 {privacyMode ? 'Private' : 'Standard'}
          </button>
          <button 
            className="btn btn-sm btn-icon" 
            onClick={() => setShowSettings(true)}
            title="Data & Privacy Settings"
          >
            ⚙️
          </button>
        </div>
      </header>

      <nav className="tab-bar">
        <button className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
          <span className="tab-icon">💬</span>
          <span className="tab-label">Chat</span>
        </button>
        <button className={`tab-btn ${activeTab === 'vision' ? 'active' : ''}`} onClick={() => setActiveTab('vision')}>
          <span className="tab-icon">📷</span>
          <span className="tab-label">Vision</span>
        </button>
        <button className={`tab-btn ${activeTab === 'voice' ? 'active' : ''}`} onClick={() => setActiveTab('voice')}>
          <span className="tab-icon">🎙️</span>
          <span className="tab-label">Voice</span>
        </button>
      </nav>

      <main className="tab-content">
        {showHistory && activeTab === 'chat' && (
          <div className="history-sidebar">
            <div className="history-header">
              <h3>Chat History</h3>
              <button className="btn btn-sm btn-primary" onClick={newChat}>+ New Chat</button>
            </div>
            <div className="history-list">
              {chatSessions.length === 0 ? (
                <div className="history-empty">No previous chats</div>
              ) : (
                chatSessions.map(session => (
                  <div key={session.id} className="history-item">
                    <div className="history-item-content" onClick={() => loadSession(session.id)}>
                      <div className="history-title">{session.title}</div>
                      <div className="history-time">{new Date(session.timestamp).toLocaleDateString()}</div>
                    </div>
                    <button className="history-delete" onClick={() => deleteSession(session.id)}>🗑️</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        <Suspense fallback={<div className="spinner" />}>
          {activeTab === 'chat' && <ChatTab sessionId={currentSessionId} onSave={saveSession} />}
          {activeTab === 'vision' && <VisionTab />}
          {activeTab === 'voice' && <VoiceTab />}
        </Suspense>
      </main>

      {showSettings && (
        <Suspense fallback={null}>
          <SettingsModal onClose={() => setShowSettings(false)} />
        </Suspense>
      )}
    </div>
  );
}
