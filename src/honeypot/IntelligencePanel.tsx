import { useState } from 'react';

export function IntelligencePanel() {
  const [showJSON, setShowJSON] = useState(false);

  const intelligence = {
    bankAccount: '1234567890123456',
    ifsc: 'SBIN0001234',
    upiId: 'scammer@paytm',
    phoneNumber: '+91-9876543210',
    phishingLinks: ['http://fake-bank.com/login', 'http://prize-claim.xyz'],
    confidence: 94
  };

  return (
    <div className="intelligence-page">
      <div className="page-header">
        <h2 className="page-title">Intelligence Extracted</h2>
        <button className="btn-toggle" onClick={() => setShowJSON(!showJSON)}>
          {showJSON ? '📋 Card View' : '{ } JSON View'}
        </button>
      </div>

      {!showJSON ? (
        <div className="intelligence-grid">
          <div className="intel-card">
            <div className="intel-icon">🏦</div>
            <div className="intel-content">
              <div className="intel-label">Bank Account Number</div>
              <div className="intel-value">{intelligence.bankAccount}</div>
              <div className="intel-meta">IFSC: {intelligence.ifsc}</div>
            </div>
            <button className="btn-copy">📋</button>
          </div>

          <div className="intel-card">
            <div className="intel-icon">💳</div>
            <div className="intel-content">
              <div className="intel-label">UPI ID</div>
              <div className="intel-value">{intelligence.upiId}</div>
              <div className="intel-meta">Verified via conversation</div>
            </div>
            <button className="btn-copy">📋</button>
          </div>

          <div className="intel-card">
            <div className="intel-icon">📱</div>
            <div className="intel-content">
              <div className="intel-label">Phone Number</div>
              <div className="intel-value">{intelligence.phoneNumber}</div>
              <div className="intel-meta">Active scammer line</div>
            </div>
            <button className="btn-copy">📋</button>
          </div>

          <div className="intel-card wide">
            <div className="intel-icon">🔗</div>
            <div className="intel-content">
              <div className="intel-label">Phishing Links Detected</div>
              {intelligence.phishingLinks.map((link, i) => (
                <div key={i} className="intel-value link">{link}</div>
              ))}
              <div className="intel-meta">{intelligence.phishingLinks.length} malicious URLs identified</div>
            </div>
            <button className="btn-copy">📋</button>
          </div>

          <div className="intel-card confidence">
            <div className="intel-icon">🎯</div>
            <div className="intel-content">
              <div className="intel-label">Confidence Score</div>
              <div className="intel-value large">{intelligence.confidence}%</div>
              <div className="confidence-bar">
                <div className="confidence-fill" style={{ width: `${intelligence.confidence}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="json-view">
          <pre>{JSON.stringify(intelligence, null, 2)}</pre>
          <button className="btn-copy-json">📋 Copy JSON</button>
        </div>
      )}

      <div className="intel-timeline">
        <h3>Extraction Timeline</h3>
        <div className="timeline-item">
          <div className="timeline-dot"></div>
          <div className="timeline-content">
            <div className="timeline-title">Phone number extracted</div>
            <div className="timeline-time">2 minutes ago</div>
          </div>
        </div>
        <div className="timeline-item">
          <div className="timeline-dot"></div>
          <div className="timeline-content">
            <div className="timeline-title">UPI ID captured</div>
            <div className="timeline-time">5 minutes ago</div>
          </div>
        </div>
        <div className="timeline-item">
          <div className="timeline-dot"></div>
          <div className="timeline-content">
            <div className="timeline-title">Bank account revealed</div>
            <div className="timeline-time">8 minutes ago</div>
          </div>
        </div>
      </div>
    </div>
  );
}
