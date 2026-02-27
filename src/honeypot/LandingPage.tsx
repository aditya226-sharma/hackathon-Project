interface LandingPageProps {
  onLaunch: () => void;
}

export function LandingPage({ onLaunch }: LandingPageProps) {
  return (
    <div className="landing-page">
      <div className="landing-hero">
        <div className="hero-content">
          <div className="hero-badge">🛡️ AI-Powered Security</div>
          <h1 className="hero-title">AI-Powered Scam Intelligence System</h1>
          <p className="hero-subtitle">Detect. Engage. Extract. Protect.</p>
          <div className="hero-buttons">
            <button className="btn-hero-primary" onClick={onLaunch}>
              🚀 Launch Dashboard
            </button>
            <button className="btn-hero-secondary">
              📖 View API Docs
            </button>
          </div>
        </div>
        <div className="hero-background">
          <div className="grid-pattern"></div>
          <div className="glow-orb glow-1"></div>
          <div className="glow-orb glow-2"></div>
        </div>
      </div>
      
      <div className="landing-features">
        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h3>Real-Time Scam Detection</h3>
          <p>Advanced AI algorithms analyze messages instantly to identify potential scams with 95%+ accuracy</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🤖</div>
          <h3>Autonomous AI Engagement</h3>
          <p>AI agents autonomously engage with scammers to gather intelligence while protecting users</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎯</div>
          <h3>Intelligence Extraction</h3>
          <p>Extract structured data including bank accounts, UPI IDs, and phishing links automatically</p>
        </div>
      </div>
    </div>
  );
}
