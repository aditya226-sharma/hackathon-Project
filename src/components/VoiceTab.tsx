import { useState, useRef, useCallback, useEffect } from 'react';
import { VoicePipeline, ModelCategory, ModelManager } from '@runanywhere/web';
import { AudioCapture, AudioPlayback, VAD, SpeechActivity } from '@runanywhere/web-onnx';
import { useModelLoader } from '../hooks/useModelLoader';
import { ModelBanner } from './ModelBanner';
import { getPrivacyMode } from '../privacy';
import { saveVoiceData, exportVoiceJSON, exportVoiceCSV } from '../dataExport';

type VoiceState = 'idle' | 'loading-models' | 'listening' | 'processing' | 'speaking';

export function VoiceTab() {
  const llmLoader = useModelLoader(ModelCategory.Language, true);
  const sttLoader = useModelLoader(ModelCategory.SpeechRecognition, true);
  const ttsLoader = useModelLoader(ModelCategory.SpeechSynthesis, true);
  const vadLoader = useModelLoader(ModelCategory.Audio, true);

  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const micRef = useRef<AudioCapture | null>(null);
  const pipelineRef = useRef<VoicePipeline | null>(null);
  const vadUnsub = useRef<(() => void) | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('voiceData');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {}
    }
    
    return () => {
      micRef.current?.stop();
      vadUnsub.current?.();
    };
  }, []);

  // Ensure all 4 models are loaded
  const ensureModels = useCallback(async (): Promise<boolean> => {
    setVoiceState('loading-models');
    setError(null);

    const [vad, stt, llm, tts] = await Promise.all([
      vadLoader.ensure(),
      sttLoader.ensure(),
      llmLoader.ensure(),
      ttsLoader.ensure(),
    ]);

    if (vad && stt && llm && tts) {
      setVoiceState('idle');
      return true;
    }

    setError('Failed to load one or more voice models');
    setVoiceState('idle');
    return false;
  }, [vadLoader, sttLoader, llmLoader, ttsLoader]);

  // Start listening
  const startListening = useCallback(async () => {
    setTranscript('');
    setResponse('');
    setError(null);

    const anyMissing = !ModelManager.getLoadedModel(ModelCategory.Audio)
      || !ModelManager.getLoadedModel(ModelCategory.SpeechRecognition)
      || !ModelManager.getLoadedModel(ModelCategory.Language)
      || !ModelManager.getLoadedModel(ModelCategory.SpeechSynthesis);

    if (anyMissing) {
      const ok = await ensureModels();
      if (!ok) return;
    }

    setVoiceState('listening');

    const mic = new AudioCapture({ sampleRate: 16000 });
    micRef.current = mic;

    if (!pipelineRef.current) {
      pipelineRef.current = new VoicePipeline();
    }

    VAD.reset();

    vadUnsub.current = VAD.onSpeechActivity((activity) => {
      if (activity === SpeechActivity.Ended) {
        const segment = VAD.popSpeechSegment();
        if (segment && segment.samples.length > 1600) {
          processSpeech(segment.samples);
        }
      }
    });

    await mic.start(
      (chunk) => { VAD.processSamples(chunk); },
      (level) => { setAudioLevel(level); },
    );
  }, [ensureModels]);

  const processSpeech = useCallback(async (audioData: Float32Array) => {
    const pipeline = pipelineRef.current;
    if (!pipeline) return;

    micRef.current?.stop();
    vadUnsub.current?.();
    setVoiceState('processing');

    try {
      const result = await pipeline.processTurn(audioData, {
        maxTokens: 40,
        temperature: 0.6,
        systemPrompt: 'You are a helpful voice assistant. Keep responses concise — 1-2 sentences max.',
      }, {
        onTranscription: (text) => {
          setTranscript(text);
        },
        onResponseToken: (_token, accumulated) => {
          setResponse(accumulated);
        },
        onResponseComplete: (text) => {
          setResponse(text);
        },
        onSynthesisComplete: async (audio, sampleRate) => {
          setVoiceState('speaking');
          const player = new AudioPlayback({ sampleRate });
          await player.play(audio, sampleRate);
          player.dispose();
        },
        onStateChange: (s) => {
          if (s === 'processingSTT') setVoiceState('processing');
          if (s === 'generatingResponse') setVoiceState('processing');
          if (s === 'playingTTS') setVoiceState('speaking');
        },
      });

      if (result) {
        setTranscript(result.transcription);
        setResponse(result.response);
        
        saveVoiceData({
          timestamp: Date.now(),
          transcript: result.transcription,
          response: result.response
        });
        
        const saved = localStorage.getItem('voiceData');
        if (saved) setHistory(JSON.parse(saved));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }

    setVoiceState('idle');
    setAudioLevel(0);
  }, []);

  const stopListening = useCallback(() => {
    micRef.current?.stop();
    vadUnsub.current?.();
    setVoiceState('idle');
    setAudioLevel(0);
  }, []);

  const pendingLoaders = [
    { label: 'VAD', loader: vadLoader },
    { label: 'STT', loader: sttLoader },
    { label: 'LLM', loader: llmLoader },
    { label: 'TTS', loader: ttsLoader },
  ].filter((l) => l.loader.state !== 'ready');

  return (
    <div className="tab-panel voice-panel">
      {showHistory && (
        <div className="history-sidebar">
          <div className="history-header">
            <h3>Voice History</h3>
            <button className="btn btn-sm btn-icon" onClick={() => setShowHistory(false)}>✕</button>
          </div>
          <div className="history-list">
            {history.length === 0 ? (
              <div className="history-empty">No previous voice interactions</div>
            ) : (
              history.slice().reverse().map((item, idx) => (
                <div key={idx} className="history-item">
                  <div className="history-item-content">
                    <div className="history-title">{item.transcript.slice(0, 40)}...</div>
                    <div className="history-time">{new Date(item.timestamp).toLocaleString()}</div>
                    <div className="history-result">{item.response.slice(0, 60)}...</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      {pendingLoaders.length > 0 && voiceState === 'idle' && (
        <ModelBanner
          state={pendingLoaders[0].loader.state}
          progress={pendingLoaders[0].loader.progress}
          error={pendingLoaders[0].loader.error}
          onLoad={ensureModels}
          label={`Voice (${pendingLoaders.map((l) => l.label).join(', ')})`}
        />
      )}

      {error && <div className="model-banner"><span className="error-text">{error}</span></div>}

      <div className="voice-center">
        <div className="voice-orb" data-state={voiceState} style={{ '--level': audioLevel } as React.CSSProperties}>
          <div className="voice-orb-inner" />
        </div>

        <p className="voice-status">
          {voiceState === 'idle' && 'Tap to start listening'}
          {voiceState === 'loading-models' && 'Loading models...'}
          {voiceState === 'listening' && 'Listening... speak now'}
          {voiceState === 'processing' && 'Processing...'}
          {voiceState === 'speaking' && 'Speaking...'}
        </p>

        {voiceState === 'idle' || voiceState === 'loading-models' ? (
          <button
            className="btn btn-primary btn-lg"
            onClick={startListening}
            disabled={voiceState === 'loading-models'}
          >
            Start Listening
          </button>
        ) : voiceState === 'listening' ? (
          <button className="btn btn-lg" onClick={stopListening}>
            Stop
          </button>
        ) : null}
      </div>

      {transcript && (
        <div className="voice-transcript">
          <h4>You said:</h4>
          <p>{transcript}</p>
        </div>
      )}

      {response && (
        <div className="voice-response">
          <h4>AI response:</h4>
          <p>{response}</p>
        </div>
      )}
      
      <div className="voice-actions">
        <button className="btn btn-sm" onClick={() => setShowHistory(!showHistory)}>📚 History</button>
        <button className="btn btn-sm" onClick={exportVoiceJSON}>Export JSON</button>
        <button className="btn btn-sm" onClick={exportVoiceCSV}>Export CSV</button>
      </div>
      </div>
    </div>
  );
}
