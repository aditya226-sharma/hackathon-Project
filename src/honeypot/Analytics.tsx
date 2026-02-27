export function Analytics() {
  return (
    <div className="analytics-page">
      <h2 className="page-title">Analytics & Insights</h2>

      <div className="analytics-grid">
        <div className="chart-card large">
          <h3>Scam Detection Over Time</h3>
          <div className="line-chart">
            <div className="chart-bars">
              <div className="chart-bar" style={{ height: '40%' }}><span>Mon</span></div>
              <div className="chart-bar" style={{ height: '65%' }}><span>Tue</span></div>
              <div className="chart-bar" style={{ height: '55%' }}><span>Wed</span></div>
              <div className="chart-bar" style={{ height: '80%' }}><span>Thu</span></div>
              <div className="chart-bar" style={{ height: '70%' }}><span>Fri</span></div>
              <div className="chart-bar" style={{ height: '45%' }}><span>Sat</span></div>
              <div className="chart-bar" style={{ height: '30%' }}><span>Sun</span></div>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3>Scam Types Distribution</h3>
          <div className="pie-chart">
            <div className="pie-segment upi">UPI Fraud<br/>42%</div>
            <div className="pie-segment phishing">Phishing<br/>28%</div>
            <div className="pie-segment bank">Bank Scam<br/>18%</div>
            <div className="pie-segment other">Other<br/>12%</div>
          </div>
        </div>

        <div className="chart-card">
          <h3>Detection Accuracy</h3>
          <div className="accuracy-display">
            <div className="accuracy-circle">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" className="accuracy-bg" />
                <circle cx="50" cy="50" r="45" className="accuracy-fill" style={{ strokeDashoffset: 18 }} />
              </svg>
              <div className="accuracy-text">95.2%</div>
            </div>
            <div className="accuracy-label">Overall Accuracy</div>
          </div>
        </div>

        <div className="chart-card wide">
          <h3>Top Scam Patterns</h3>
          <div className="pattern-list">
            <div className="pattern-item">
              <span className="pattern-name">OTP Request</span>
              <div className="pattern-bar">
                <div className="pattern-fill" style={{ width: '85%' }}></div>
              </div>
              <span className="pattern-count">342</span>
            </div>
            <div className="pattern-item">
              <span className="pattern-name">Prize/Lottery</span>
              <div className="pattern-bar">
                <div className="pattern-fill" style={{ width: '68%' }}></div>
              </div>
              <span className="pattern-count">271</span>
            </div>
            <div className="pattern-item">
              <span className="pattern-name">Bank Alert</span>
              <div className="pattern-bar">
                <div className="pattern-fill" style={{ width: '52%' }}></div>
              </div>
              <span className="pattern-count">208</span>
            </div>
            <div className="pattern-item">
              <span className="pattern-name">KYC Update</span>
              <div className="pattern-bar">
                <div className="pattern-fill" style={{ width: '45%' }}></div>
              </div>
              <span className="pattern-count">180</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
