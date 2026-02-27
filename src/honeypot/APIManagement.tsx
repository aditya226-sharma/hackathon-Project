export function APIManagement() {
  const apiKey = 'hp_live_sk_a8f7d9e2b4c1f6h3j5k8m9n0p2q4r6s8';
  const endpoint = 'https://api.honeypot-ai.com/v1';

  const sampleRequest = {
    message: "Hello, I am from bank. Please share OTP",
    phone: "+91-9876543210",
    timestamp: "2024-01-15T10:30:00Z"
  };

  const sampleResponse = {
    scam_detected: true,
    confidence: 0.94,
    scam_type: "OTP_FRAUD",
    risk_level: "HIGH",
    extracted_data: {
      phone: "+91-9876543210",
      keywords: ["bank", "OTP", "share"]
    }
  };

  return (
    <div className="api-page">
      <h2 className="page-title">API Management</h2>

      <div className="api-section">
        <h3>API Key</h3>
        <div className="api-key-box">
          <code>{apiKey}</code>
          <button className="btn-copy">📋 Copy</button>
        </div>
        <button className="btn-generate">🔄 Generate New Key</button>
      </div>

      <div className="api-section">
        <h3>Base Endpoint</h3>
        <div className="endpoint-box">
          <code>{endpoint}</code>
          <button className="btn-copy">📋 Copy</button>
        </div>
      </div>

      <div className="api-grid">
        <div className="api-card">
          <h3>Sample Request</h3>
          <div className="code-block">
            <pre>{`POST ${endpoint}/analyze

Headers:
Authorization: Bearer ${apiKey}
Content-Type: application/json

Body:
${JSON.stringify(sampleRequest, null, 2)}`}</pre>
          </div>
          <button className="btn-copy-code">📋 Copy Request</button>
        </div>

        <div className="api-card">
          <h3>Sample Response</h3>
          <div className="code-block">
            <pre>{JSON.stringify(sampleResponse, null, 2)}</pre>
          </div>
          <button className="btn-copy-code">📋 Copy Response</button>
        </div>
      </div>

      <div className="api-endpoints">
        <h3>Available Endpoints</h3>
        <div className="endpoint-item">
          <span className="method post">POST</span>
          <span className="path">/analyze</span>
          <span className="desc">Analyze message for scam detection</span>
        </div>
        <div className="endpoint-item">
          <span className="method get">GET</span>
          <span className="path">/conversations</span>
          <span className="desc">Get all active conversations</span>
        </div>
        <div className="endpoint-item">
          <span className="method get">GET</span>
          <span className="path">/intelligence</span>
          <span className="desc">Retrieve extracted intelligence data</span>
        </div>
        <div className="endpoint-item">
          <span className="method get">GET</span>
          <span className="path">/analytics</span>
          <span className="desc">Get analytics and statistics</span>
        </div>
      </div>
    </div>
  );
}
