import { useState, useRef, useEffect, useCallback } from 'react';
import { ModelCategory } from '@runanywhere/web';
import { TextGeneration } from '@runanywhere/web-llamacpp';
import { useModelLoader } from '../hooks/useModelLoader';
import { ModelBanner } from './ModelBanner';
import { saveChatMessages } from '../supabse';
import { saveLocalMessage } from '../dataControl';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  stats?: { tokens: number; tokPerSec: number; latencyMs: number };
}

export function ChatTab() {
  const loader = useModelLoader(ModelCategory.Language);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || generating) return;

    if (loader.state !== 'ready') {
      const ok = await loader.ensure();
      if (!ok) return;
    }

    setInput('');
    const userMsg = { role: 'user' as const, text };
    setMessages((prev) => [...prev, userMsg]);
    setGenerating(true);

    const assistantIdx = messages.length + 1;
    const placeholderMsg = { role: 'assistant' as const, text: '' };
    setMessages((prev) => [...prev, placeholderMsg]);

    const startTime = performance.now();

    try {
      const { stream, result: resultPromise, cancel } = await TextGeneration.generateStream(text, {
        maxTokens: 256,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
      });
      cancelRef.current = cancel;

      let accumulated = '';
      let lastUpdate = 0;
      for await (const token of stream) {
        accumulated += token;
        const now = performance.now();
        if (now - lastUpdate > 16) {
          setMessages((prev) => {
            const updated = [...prev];
            updated[assistantIdx] = { role: 'assistant', text: accumulated };
            return updated;
          });
          lastUpdate = now;
        }
      }

      const result = await resultPromise;
      const latency = Math.round(performance.now() - startTime);
      const finalMessage = {
        role: 'assistant' as const,
        text: result.text || accumulated,
        stats: {
          tokens: result.tokensUsed,
          tokPerSec: result.tokensPerSecond,
          latencyMs: latency,
        },
      };
      
      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantIdx] = finalMessage;
        return updated;
      });

      // Save to local storage
      saveLocalMessage({ role: 'user', text, timestamp: new Date().toISOString() });
      saveLocalMessage({ 
        role: 'assistant', 
        text: finalMessage.text, 
        timestamp: new Date().toISOString(),
        stats: finalMessage.stats
      });

      // Optionally save to cloud if privacy mode is off
      saveChatMessages([
        { role: 'user', message: text, timestamp: new Date().toISOString() },
        { 
          role: 'assistant', 
          message: finalMessage.text, 
          tokens: finalMessage.stats.tokens, 
          tok_per_sec: finalMessage.stats.tokPerSec, 
          latency_ms: finalMessage.stats.latencyMs, 
          timestamp: new Date().toISOString() 
        }
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantIdx] = { role: 'assistant', text: `Error: ${msg}` };
        return updated;
      });
    } finally {
      cancelRef.current = null;
      setGenerating(false);
    }
  }, [input, generating, messages.length, loader]);

  const handleCancel = () => {
    cancelRef.current?.();
  };

  return (
    <div className="tab-panel chat-panel">
      <ModelBanner
        state={loader.state}
        progress={loader.progress}
        error={loader.error}
        onLoad={loader.ensure}
        label="LLM"
      />

      <div className="message-list" ref={listRef}>
        {messages.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
            <h3>Welcome to RunAnywhere AI</h3>
            <p>Start chatting with your on-device AI assistant</p>
            <div style={{ 
              marginTop: '24px', 
              display: 'flex', 
              gap: '8px', 
              flexWrap: 'wrap',
              justifyContent: 'center',
              maxWidth: '400px'
            }}>
              <button 
                className="btn btn-sm" 
                onClick={() => setInput('Tell me a fun fact')}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                💡 Fun fact
              </button>
              <button 
                className="btn btn-sm" 
                onClick={() => setInput('Write a haiku about AI')}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                ✍️ Write haiku
              </button>
              <button 
                className="btn btn-sm" 
                onClick={() => setInput('Explain quantum computing')}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                🔬 Explain topic
              </button>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`message message-${msg.role}`}>
            <div className="message-bubble">
              <p>{msg.text || '...'}</p>
              {msg.stats && (
                <div className="message-stats">
                  {msg.stats.tokens} tokens · {msg.stats.tokPerSec.toFixed(1)} tok/s · {Math.round(msg.stats.latencyMs)}ms
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <form
        className="chat-input"
        onSubmit={(e) => { e.preventDefault(); send(); }}
      >
        <input
          type="text"
          placeholder="Message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !generating) {
              e.preventDefault();
              send();
            }
          }}
          disabled={generating}
          autoComplete="off"
          autoFocus
        />
        {generating ? (
          <button type="button" className="btn" onClick={handleCancel}>Stop</button>
        ) : (
          <button type="submit" className="btn btn-primary" disabled={!input.trim()}>Send</button>
        )}
      </form>
    </div>
  );
}
