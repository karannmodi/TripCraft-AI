import React, { useState, useEffect, useRef } from 'react';
import { Trip, ChatMessage } from '../../types/trip';
import { fetchChatHistory, sendChatMessage } from '../../api/client';
import { Bot, User, Send, Sparkles, AlertTriangle, HelpCircle } from 'lucide-react';

interface AskMyTripViewProps {
  trip: Trip;
}

const SUGGESTED_PROMPTS = [
  'What reservations do I have?',
  'How much of my budget have I spent?',
  'Which day has the most activities?',
  'Summarize my trip.',
  'What do I still need to pack?'
];

export const AskMyTripView: React.FC<AskMyTripViewProps> = ({ trip }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadHistory = async () => {
    setInitialLoading(true);
    setError(null);
    try {
      const res = await fetchChatHistory(trip.id);
      setMessages(res.messages || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load chat history.');
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (trip?.id) {
      loadHistory();
    }
  }, [trip?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (messageText: string) => {
    const text = messageText.trim();
    if (!text || loading) return;

    setInputMessage('');
    setError(null);

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      trip_id: trip.id,
      sender: 'user',
      message: text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const asstMsg = await sendChatMessage(trip.id, text);
      setMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), tempUserMsg, asstMsg]);
    } catch (err: any) {
      setError(err.message || 'Failed to get response from Ask My Trip assistant.');
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputMessage);
    }
  };

  return (
    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', height: '520px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} style={{ color: '#a855f7' }} />
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700 }}>
            Ask My Trip Assistant
          </h3>
        </div>
        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Context-aware AI assistant with zero factual hallucination — backed by PostgreSQL data & local Ollama model.
        </p>
      </div>

      {/* Suggested Query Pills */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        {SUGGESTED_PROMPTS.map((promptText, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(promptText)}
            disabled={loading}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              background: 'rgba(168, 85, 247, 0.1)',
              color: '#d8b4fe',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <HelpCircle size={12} /> {promptText}
          </button>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', marginBottom: '0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Chat Messages Window */}
      <div
        style={{
          flex: 1,
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '1rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        {initialLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 0.5rem auto' }} />
            Loading chat history...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Bot size={36} style={{ margin: '0 auto 0.75rem auto', color: '#a855f7', opacity: 0.6 }} />
            <h4 style={{ margin: '0 0 0.4rem 0', color: 'var(--text-main)' }}>Ask anything about your Chicago trip!</h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              Click one of the suggested query pills above or type your question below.
            </p>
          </div>
        ) : (
          messages.map(msg => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '0.65rem',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                {!isUser && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={18} style={{ color: '#ffffff' }} />
                  </div>
                )}
                <div
                  style={{
                    background: isUser ? 'rgba(59, 130, 246, 0.25)' : 'rgba(30, 41, 59, 0.8)',
                    border: isUser ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.75rem 1rem',
                    borderRadius: isUser ? '1rem 1rem 0.2rem 1rem' : '1rem 1rem 1rem 0.2rem',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem',
                    lineHeight: '1.45',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {!isUser && (
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#c084fc', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Sparkles size={11} /> TripCraft Assistant (gemma3:1b / Facts Engine)
                    </div>
                  )}
                  {msg.message}
                </div>
                {isUser && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={18} style={{ color: '#93c5fd' }} />
                  </div>
                )}
              </div>
            );
          })
        )}

        {loading && (
          <div style={{ display: 'flex', gap: '0.65rem', alignSelf: 'flex-start', maxWidth: '85%' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot size={18} style={{ color: '#ffffff' }} />
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '0.75rem 1rem', borderRadius: '1rem 1rem 1rem 0.2rem', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="spinner" style={{ width: '14px', height: '14px' }} />
              Analysing database facts & generating response...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
        <input
          type="text"
          className="input-field"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your trip..."
          disabled={loading}
          style={{ flex: 1 }}
        />
        <button
          onClick={() => handleSend(inputMessage)}
          disabled={loading || !inputMessage.trim()}
          className="btn-primary"
          style={{ padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Send size={16} /> Send
        </button>
      </div>
    </div>
  );
};
