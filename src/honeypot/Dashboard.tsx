export function Dashboard() {
  return (
    <div className="dashboard-page">
      <h2 className="page-title">Dashboard Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📨</div>
          <div className="stat-content">
            <div className="stat-label">Messages Scanned</div>
            <div className="stat-value">12,847</div>
            <div className="stat-trend up">↑ 23%</div>
          </div>
        </div>
        
        <div className="stat-card alert">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-label">Scams Detected</div>
            <div className="stat-value">1,243</div>
            <div className="stat-trend up">↑ 15%</div>
          </div>
        </div>
        
        <div className="stat-card active">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <div className="stat-label">Active Conversations</div>
            <div className="stat-value">47</div>
            <div className="stat-trend">→ Live</div>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-label">Intelligence Extracted</div>
            <div className="stat-value">892</div>
            <div className="stat-trend up">↑ 31%</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Recent Scam Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-badge scam">SCAM</span>
              <span className="activity-text">UPI fraud attempt detected</span>
              <span className="activity-time">2 min ago</span>
            </div>
            <div className="activity-item">
              <span className="activity-badge scam">SCAM</span>
              <span className="activity-text">Phishing link identified</span>
              <span className="activity-time">5 min ago</span>
            </div>
            <div className="activity-item">
              <span className="activity-badge suspicious">SUSPICIOUS</span>
              <span className="activity-text">Bank account request</span>
              <span className="activity-time">12 min ago</span>
            </div>
            <div className="activity-item">
              <span className="activity-badge legitimate">LEGITIMATE</span>
              <span className="activity-text">Normal conversation</span>
              <span className="activity-time">18 min ago</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>AI Agent Status</h3>
          <div className="agent-status">
            <div className="agent-item">
              <div className="agent-indicator active"></div>
              <span>Agent Alpha - Engaging scammer</span>
            </div>
            <div className="agent-item">
              <div className="agent-indicator active"></div>
              <span>Agent Beta - Extracting data</span>
            </div>
            <div className="agent-item">
              <div className="agent-indicator idle"></div>
              <span>Agent Gamma - Idle</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
