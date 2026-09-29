import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Send,
  Brain,
  Sparkles,
  Bot,
  User as UserIcon,
  Trash2,
  ChevronDown,
  ChevronUp,
  Database,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

const SUGGESTIONS = [
  'I want to become a full-stack developer. I know React and JS, but need to improve SQL.',
  'What should I learn next based on my profile?',
  'What are my weaknesses and how should I overcome them?',
  'How have I improved over time?',
  'Create a 4-week learning plan for backend and database indexing.',
];

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedMemoryId, setExpandedMemoryId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.get('/ai/chat/history');
        if (res.data?.success && res.data.messages.length > 0) {
          setMessages(res.data.messages);
        } else {
          // Initial greeting
          setMessages([
            {
              sender: 'ai',
              text: `### Hello ${user?.firstName || 'there'}! 👋\n\nI am your **Career Guidance AI Mentor**, integrated with **Hindsight Long-term Memory**.\n\nI retain and recall your career goals, skill scores, resume feedback, and interview performance across every session so you always receive hyper-personalized coaching.\n\n*Try asking "What should I learn next?" or state your career aspirations below.*`,
              createdAt: new Date(),
            },
          ]);
        }
      } catch (err) {
        console.warn('Could not load chat history');
      }
    }
    loadHistory();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      sender: 'user',
      text: textToSend.trim(),
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: textToSend });
      if (res.data?.success) {
        const aiMsg = {
          _id: res.data.messageId,
          sender: 'ai',
          text: res.data.reply,
          memoriesRecalled: res.data.memoriesRecalled || [],
          retainedMemory: res.data.retainedMemory,
          hindsightConfigured: res.data.hindsightConfigured,
          liveLlm: res.data.liveLlm,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        if (aiMsg.memoriesRecalled.length > 0) {
          setExpandedMemoryId(aiMsg._id);
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `⚠️ **Error Processing Request:** ${err.response?.data?.message || err.message}`,
          createdAt: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear conversation view? (Your memories in Hindsight Cloud remain preserved)')) return;
    try {
      await api.delete('/ai/chat/history');
      setMessages([
        {
          sender: 'ai',
          text: `Conversation view cleared! All long-term memories in your Hindsight bank \`${user?.hindsightBankId}\` remain intact.`,
          createdAt: new Date(),
        },
      ]);
    } catch (e) {
      console.warn('Failed to clear chat view');
    }
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800 }}>AI Career Mentor</h1>
            <span className="badge badge-primary">
              <Brain size={12} />
              <span>Hindsight Active</span>
            </span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
            Long-term memory driven guidance. Every answer is grounded in your recalled Hindsight facts.
          </p>
        </div>

        <button
          onClick={handleClear}
          className="btn btn-secondary"
          style={{ padding: '8px 12px', fontSize: '12px' }}
          title="Clear chat view"
        >
          <Trash2 size={14} />
          <span>Clear View</span>
        </button>
      </div>

      {/* Suggested Questions Carousel / Row */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '12px',
        }}
      >
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSend(s)}
            className="btn btn-secondary"
            style={{
              fontSize: '12px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              flexShrink: 0,
            }}
          >
            <Sparkles size={12} color="#f59e0b" />
            <span>{s.slice(0, 48)}...</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div
        className="card"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          marginBottom: '16px',
        }}
      >
        {messages.map((m, idx) => {
          const isUser = m.sender === 'user';
          const hasMemories = m.memoriesRecalled && m.memoriesRecalled.length > 0;
          const isExpanded = expandedMemoryId === (m._id || idx);

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '100%',
              }}
            >
              {/* Message Bubble */}
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  maxWidth: '82%',
                  flexDirection: isUser ? 'row-reverse' : 'row',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    flexShrink: 0,
                    background: isUser
                      ? 'linear-gradient(135deg, #4f46e5, #8b5cf6)'
                      : 'linear-gradient(135deg, #6366f1, #06b6d4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  {isUser ? <UserIcon size={18} /> : <Bot size={18} />}
                </div>

                {/* Content */}
                <div
                  style={{
                    background: isUser
                      ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)'
                      : 'rgba(15, 23, 42, 0.85)',
                    border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    color: '#f8fafc',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {m.text}
                </div>
              </div>

              {/* Hindsight Retained Badge for User message */}
              {m.retainedMemory && m.retainedMemory.success && (
                <div
                  style={{
                    marginTop: '6px',
                    marginRight: '48px',
                    fontSize: '11px',
                    color: '#6ee7b7',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Brain size={12} />
                  <span>Retained in Hindsight Memory Bank</span>
                </div>
              )}

              {/* Hindsight Recalled Memory Accordion for AI Message */}
              {!isUser && hasMemories && (
                <div
                  style={{
                    marginLeft: '48px',
                    marginTop: '8px',
                    maxWidth: '80%',
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                  }}
                >
                  <div
                    onClick={() => setExpandedMemoryId(isExpanded ? null : (m._id || idx))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#a5b4fc',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Brain size={13} color="#6366f1" />
                      <span>{m.memoriesRecalled.length} Hindsight Memories Recalled for this Answer</span>
                    </div>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
                        The AI injected these verified long-term facts retrieved from your Hindsight bank:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {m.memoriesRecalled.map((mem, mi) => (
                          <div
                            key={mi}
                            style={{
                              fontSize: '11px',
                              padding: '6px 10px',
                              background: 'rgba(15, 23, 42, 0.7)',
                              borderRadius: '6px',
                              borderLeft: '2px solid #6366f1',
                              color: '#cbd5e1',
                            }}
                          >
                            {mem.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Bot size={18} />
            </div>
            <div
              style={{
                padding: '12px 18px',
                background: 'rgba(15, 23, 42, 0.85)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#94a3b8',
                fontSize: '13px',
              }}
            >
              <div className="spinner" style={{ width: '14px', height: '14px' }}></div>
              <span>Recalling Hindsight memories & formulating guidance...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{ display: 'flex', gap: '12px' }}
      >
        <input
          type="text"
          className="form-input"
          placeholder="Ask anything or state goals (e.g., 'What should I learn next?')..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{ flex: 1, padding: '14px 20px', borderRadius: '14px' }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!input.trim() || loading}
          style={{ padding: '0 24px', borderRadius: '14px' }}
        >
          <Send size={18} />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
