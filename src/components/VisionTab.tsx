import { useState, useRef, useEffect, useCallback } from 'react';
import { ModelCategory } from '@runanywhere/web';
import { VideoCapture, VLMWorkerBridge } from '@runanywhere/web-llamacpp';
import { useModelLoader } from '../hooks/useModelLoader';
import { ModelBanner } from './ModelBanner';
import { getPrivacyMode } from '../privacy';
import { saveVisionData, exportVisionJSON, exportVisionCSV } from '../dataExport';

const LIVE_INTERVAL_MS = 2000;
const LIVE_MAX_TOKENS = 25;
const SINGLE_MAX_TOKENS = 60;
const CAPTURE_DIM = 256;

interface VisionResult {
  text: string;
  totalMs: number;
}

export function VisionTab() {
  const loader = useModelLoader(ModelCategory.Multimodal);
  const [cameraActive, setCameraActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [result, setResult] = useState<VisionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Describe what you see briefly.');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const videoMountRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<VideoCapture | null>(null);
  const processingRef = useRef(false);
  const liveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const liveModeRef = useRef(false);

  processingRef.current = processing;
  liveModeRef.current = liveMode;

  // ------------------------------------------------------------------
  // Camera
  // ------------------------------------------------------------------
  const startCamera = useCallback(async () => {
    if (captureRef.current?.isCapturing) return;

    const cam = new VideoCapture({ facingMode: 'environment' });
    await cam.start();
    captureRef.current = cam;

    const mount = videoMountRef.current;
    if (mount) {
      const el = cam.videoElement;
      el.style.width = '100%';
      el.style.borderRadius = '12px';
      mount.appendChild(el);
    }

    setCameraActive(true);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('visionData');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {}
    }
    
    return () => {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
      const cam = captureRef.current;
      if (cam) {
        cam.stop();
        cam.videoElement.parentNode?.removeChild(cam.videoElement);
        captureRef.current = null;
      }
    };
  }, []);

  // ------------------------------------------------------------------
  // Core: capture + infer
  // ------------------------------------------------------------------
  const describeFrame = useCallback(async (maxTokens: number) => {
    if (processingRef.current) return;

    const cam = captureRef.current;
    if (!cam?.isCapturing) return;

    if (loader.state !== 'ready') {
      const ok = await loader.ensure();
      if (!ok) return;
    }

    const frame = cam.captureFrame(CAPTURE_DIM);
    if (!frame) return;

    setProcessing(true);
    processingRef.current = true;
    setError(null);

    const startTime = performance.now();

    try {
      const bridge = VLMWorkerBridge.shared;
      if (!bridge.isModelLoaded) {
        throw new Error('VLM model not loaded in worker');
      }

      const res = await bridge.process(
        frame.rgbPixels,
        frame.width,
        frame.height,
        prompt,
        { maxTokens, temperature: 0.5 },
      );

      const totalMs = Math.round(performance.now() - startTime);
      setResult({ text: res.text, totalMs });
      
      saveVisionData({
        timestamp: Date.now(),
        prompt,
        result: res.text,
        processingTime: totalMs,
        mode: liveModeRef.current ? 'live' : 'single'
      });
      
      const saved = localStorage.getItem('visionData');
      if (saved) setHistory(JSON.parse(saved));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isWasmCrash = msg.includes('memory access out of bounds')
        || msg.includes('RuntimeError');

      if (isWasmCrash) {
        setResult({ text: 'Recovering from memory error... next frame will retry.', totalMs: 0 });
      } else {
        setError(msg);
        if (liveModeRef.current) stopLive();
      }
    } finally {
      setProcessing(false);
      processingRef.current = false;
    }
  }, [loader, prompt]);

  // ------------------------------------------------------------------
  // Single-shot
  // ------------------------------------------------------------------
  const describeSingle = useCallback(async () => {
    if (!captureRef.current?.isCapturing) {
      await startCamera();
      return;
    }
    await describeFrame(SINGLE_MAX_TOKENS);
  }, [startCamera, describeFrame]);

  // ------------------------------------------------------------------
  // Live mode
  // ------------------------------------------------------------------
  const startLive = useCallback(async () => {
    if (!captureRef.current?.isCapturing) {
      await startCamera();
    }

    setLiveMode(true);
    liveModeRef.current = true;

    describeFrame(LIVE_MAX_TOKENS);

    liveIntervalRef.current = setInterval(() => {
      if (!processingRef.current && liveModeRef.current) {
        describeFrame(LIVE_MAX_TOKENS);
      }
    }, LIVE_INTERVAL_MS);
  }, [startCamera, describeFrame]);

  const stopLive = useCallback(() => {
    setLiveMode(false);
    liveModeRef.current = false;
    if (liveIntervalRef.current) {
      clearInterval(liveIntervalRef.current);
      liveIntervalRef.current = null;
    }
  }, []);

  const toggleLive = useCallback(() => {
    if (liveMode) {
      stopLive();
    } else {
      startLive();
    }
  }, [liveMode, startLive, stopLive]);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div className="tab-panel vision-panel">
      {showHistory && (
        <div className="history-sidebar">
          <div className="history-header">
            <h3>Vision History</h3>
            <button className="btn btn-sm btn-icon" onClick={() => setShowHistory(false)}>✕</button>
          </div>
          <div className="history-list">
            {history.length === 0 ? (
              <div className="history-empty">No previous vision results</div>
            ) : (
              history.slice().reverse().map((item, idx) => (
                <div key={idx} className="history-item">
                  <div className="history-item-content">
                    <div className="history-title">{item.prompt.slice(0, 40)}...</div>
                    <div className="history-time">{new Date(item.timestamp).toLocaleString()}</div>
                    <div className="history-result">{item.result.slice(0, 60)}...</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ModelBanner
        state={loader.state}
        progress={loader.progress}
        error={loader.error}
        onLoad={loader.ensure}
        label="VLM"
      />

      <div className="vision-camera">
        {!cameraActive && (
          <div className="empty-state">
            <h3>📷 Camera Preview</h3>
            <p>Tap below to start the camera</p>
          </div>
        )}
        <div ref={videoMountRef} />
      </div>

      <input
        className="vision-prompt"
        type="text"
        placeholder="What do you want to know about the image?"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={liveMode}
      />

      <div className="vision-actions">
        {!cameraActive ? (
          <button className="btn btn-primary" onClick={startCamera}>Start Camera</button>
        ) : (
          <>
            <button
              className="btn btn-primary"
              onClick={describeSingle}
              disabled={processing || liveMode}
            >
              {processing && !liveMode ? 'Analyzing...' : 'Describe'}
            </button>
            <button
              className={`btn ${liveMode ? 'btn-live-active' : ''}`}
              onClick={toggleLive}
              disabled={processing && !liveMode}
            >
              {liveMode ? '⏹ Stop Live' : '▶ Live'}
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="vision-result">
          <span className="error-text">Error: {error}</span>
        </div>
      )}

      {result && (
        <div className="vision-result">
          {liveMode && <span className="live-badge">LIVE</span>}
          <h4>Result</h4>
          <p>{result.text}</p>
          {result.totalMs > 0 && (
            <div className="message-stats">{(result.totalMs / 1000).toFixed(1)}s</div>
          )}
        </div>
      )}
      
      <div className="vision-actions">
        <button className="btn btn-sm" onClick={() => setShowHistory(!showHistory)}>📚 History</button>
        <button className="btn btn-sm" onClick={exportVisionJSON}>Export JSON</button>
        <button className="btn btn-sm" onClick={exportVisionCSV}>Export CSV</button>
      </div>
      </div>
    </div>
  );
}
