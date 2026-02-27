import { useState, useEffect, lazy, Suspense } from 'react';
import { initSDK, getAccelerationMode } from './runanywhere';
import { getPrivacyMode, setPrivacyMode } from './privacy';

const ChatTab = lazy(() => import('./components/ChatTab').then(m => ({ default: m.ChatTab })));
const VisionTab = lazy(() => import('./components/VisionTab').then(m => ({ default: m.VisionTab })));
const VoiceTab = lazy(() => import('./components/VoiceTab').then(m => ({ default: m.VoiceTab })));
const SettingsModal = lazy(() => import('./components/SettingsModal').then(m => ({ default: m.SettingsModal })));

type Tab = 'chat' | 'vision' | 'voice';

export function App() {
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [privacyMode, setPrivacyModeState] = useState(getPrivacyMode());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Preload critical resources
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>RunAnywhere AI</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {!isOnline && (
            <span 
              className="badge" 
              style={{ background: 'var(--green)', fontSize: '10px' }}
              title="Offline Mode - All AI runs on your device"
            >
              ⚡ OFFLINE
            </span>
          )}
          {accel && <span className="badge">{accel === 'webgpu' ? 'WebGPU' : 'CPU'}</span>}
          <button 
            className="btn btn-sm" 
            onClick={togglePrivacy}
            style={{ 
              background: privacyMode ? 'var(--green)' : 'var(--bg-card)',
              color: privacyMode ? 'white' : 'var(--text)',
              border: privacyMode ? 'none' : '1px solid var(--border)',
              padding: '4px 10px',
              fontSize: '11px'
            }}
            title="Privacy Mode - All data stays on your device"
          >
            🔒 Private
          </button>
          <button 
            className="btn btn-sm" 
            onClick={() => setShowSettings(true)}
            style={{ padding: '4px 10px', fontSize: '11px' }}
            title="Data & Privacy Settings"
          >
            ⚙️
          </button>
        </div>
      </header>

      <nav className="tab-bar">
        <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>
          💬 Chat
        </button>
        <button className={activeTab === 'vision' ? 'active' : ''} onClick={() => setActiveTab('vision')}>
          📷 Vision
        </button>
        <button className={activeTab === 'voice' ? 'active' : ''} onClick={() => setActiveTab('voice')}>
          🎙️ Voice
        </button>
      </nav>

      <main className="tab-content">
        <Suspense fallback={<div className="spinner" />}>
          {activeTab === 'chat' && <ChatTab />}
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
