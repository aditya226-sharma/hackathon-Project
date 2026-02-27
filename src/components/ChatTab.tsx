import { useState, useRef, useEffect, useCallback } from 'react';
import { ModelCategory } from '@runanywhere/web';
import { TextGeneration } from '@runanywhere/web-llamacpp';
import { useModelLoader } from '../hooks/useModelLoader';
import { ModelBanner } from './ModelBanner';
import { saveLocalMessage } from '../dataControl';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  stats?: { tokens: number; tokPerSec: number; latencyMs: number };
}

interface ChatTabProps {
  sessionId: string | null;
  onSave: (messages: Array<{ role: string; text: string }>) => void;
}

export function ChatTab({ sessionId, onSave }: ChatTabProps) {
  const loader = useModelLoader(ModelCategory.Language);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load session messages
  useEffect(() => {
    if (sessionId) {
      const saved = localStorage.getItem('chatSessions');
      if (saved) {
        try {
          const sessions = JSON.parse(saved);
          const session = sessions.find((s: any) => s.id === sessionId);
          if (session) setMessages(session.messages);
        } catch {}
      }
    } else {
      setMessages([]);
    }
  }, [sessionId]);

  // Listen for new chat event
  useEffect(() => {
    const handleNewChat = () => {
      setMessages([]);
      setInput('');
      setGenerating(false);
    };
    window.addEventListener('newChat', handleNewChat);
    return () => window.removeEventListener('newChat', handleNewChat);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
    if (messages.length > 0) onSave(messages);
  }, [messages, onSave]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || generating) return;

    if (loader.state !== 'ready') {
      const ok = await loader.ensure();
      if (!ok) return;
    }

    setInput('');
    const userMsg = { role: 'user' as const, text };
    setGenerating(true);

    let assistantIdx = 0;
    setMessages((prev) => {
      assistantIdx = prev.length + 1;
      return [...prev, userMsg, { role: 'assistant' as const, text: '' }];
    });

    // Force scroll after state update
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }, 0);

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
  }, [input, generating, messages.length, loader, onSave]);

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
              {msg.role === 'assistant' && !msg.text && generating ? (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                <>
                  <p>{msg.text || '...'}</p>
                  {msg.stats && (
                    <div className="message-stats">
                      {msg.stats.tokens} tokens · {msg.stats.tokPerSec.toFixed(1)} tok/s · {Math.round(msg.stats.latencyMs)}ms
                    </div>
                  )}
                </>
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
          placeholder={generating ? "AI is thinking..." : "Message..."}
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
          className={generating ? 'input-thinking' : ''}
        />
        {generating ? (
          <button type="button" className="btn btn-stop" onClick={handleCancel}>⏹ Stop</button>
        ) : (
          <button type="submit" className="btn btn-primary" disabled={!input.trim()}>Send</button>
        )}
      </form>
    </div>
  );
}
