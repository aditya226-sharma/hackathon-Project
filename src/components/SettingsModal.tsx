import { useState } from 'react';
import { getPrivacyMode, setPrivacyMode } from '../privacy';
import { clearLocalHistory, exportLocalData, exportLocalDataAsCSV, getStorageSize } from '../dataControl';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [privacyMode, setPrivacyModeState] = useState(getPrivacyMode());
  const [storageSize, setStorageSize] = useState(getStorageSize());

  const togglePrivacy = () => {
    const newMode = !privacyMode;
    setPrivacyMode(newMode);
    setPrivacyModeState(newMode);
  };

  const handleExport = () => {
    const data = exportLocalData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `runanywhere-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csv = exportLocalDataAsCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `runanywhere-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('Delete all local chat history? This cannot be undone.')) {
      clearLocalHistory();
      setStorageSize(0);
      alert('Local data cleared successfully');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Data & Privacy Settings</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="settings-section">
          <h3>🔒 Privacy Mode</h3>
          <p>Control whether your data is logged to cloud storage</p>
          <label className="toggle-switch">
            <input type="checkbox" checked={privacyMode} onChange={togglePrivacy} />
            <span className="toggle-slider"></span>
            <span className="toggle-label">
              {privacyMode ? 'Private (No cloud logging)' : 'Logging enabled'}
            </span>
          </label>
        </div>

        <div className="settings-section">
          <h3>💾 Local Data</h3>
          <p>Your chat history stored locally: {(storageSize / 1024).toFixed(2)} KB</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            <button className="btn" onClick={handleExport}>
              📥 Export JSON
            </button>
            <button className="btn" onClick={handleExportCSV}>
              📊 Export CSV
            </button>
            <button className="btn" onClick={handleClear} style={{ color: 'var(--red)' }}>
              🗑️ Delete All
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3>ℹ️ How Your Data is Used</h3>
          <ul style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
            <li>✓ All AI processing happens on your device</li>
            <li>✓ No data sent to external servers when privacy mode is ON</li>
            <li>✓ Local storage only (you have full control)</li>
            <li>✓ Export or delete your data anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
