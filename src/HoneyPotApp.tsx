import { useState } from 'react';
import { LandingPage } from './honeypot/LandingPage';
import { Dashboard } from './honeypot/Dashboard';
import { LiveConversations } from './honeypot/LiveConversations';
import { IntelligencePanel } from './honeypot/IntelligencePanel';
import { Analytics } from './honeypot/Analytics';
import { APIManagement } from './honeypot/APIManagement';

type Page = 'landing' | 'dashboard' | 'conversations' | 'intelligence' | 'analytics' | 'api';

export function HoneyPotApp() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  if (currentPage === 'landing') {
    return <LandingPage onLaunch={() => setCurrentPage('dashboard')} />;
  }

  return (
    <div className="honeypot-app">
      <aside className="honeypot-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">🛡️</div>
          <h2>HoneyPot AI</h2>
        </div>
        <nav className="sidebar-nav">
          <button className={currentPage === 'dashboard' ? 'active' : ''} onClick={() => setCurrentPage('dashboard')}>
            📊 Overview
          </button>
          <button className={currentPage === 'conversations' ? 'active' : ''} onClick={() => setCurrentPage('conversations')}>
            💬 Live Conversations
          </button>
          <button className={currentPage === 'intelligence' ? 'active' : ''} onClick={() => setCurrentPage('intelligence')}>
            🎯 Intelligence
          </button>
          <button className={currentPage === 'analytics' ? 'active' : ''} onClick={() => setCurrentPage('analytics')}>
            📈 Analytics
          </button>
          <button className={currentPage === 'api' ? 'active' : ''} onClick={() => setCurrentPage('api')}>
            🔌 API Management
          </button>
        </nav>
      </aside>
      <div className="honeypot-main">
        <header className="honeypot-navbar">
          <h1>AI-Powered Scam Intelligence</h1>
          <div className="navbar-right">
            <span className="api-status active">🟢 API Active</span>
            <div className="user-avatar">👤</div>
          </div>
        </header>
        <main className="honeypot-content">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'conversations' && <LiveConversations />}
          {currentPage === 'intelligence' && <IntelligencePanel />}
          {currentPage === 'analytics' && <Analytics />}
          {currentPage === 'api' && <APIManagement />}
        </main>
      </div>
    </div>
  );
}
