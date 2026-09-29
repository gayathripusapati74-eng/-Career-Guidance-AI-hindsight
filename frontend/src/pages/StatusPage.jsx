import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  Activity,
  Database,
  Cpu,
  Brain,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Send,
  Search,
  Sparkles,
  Terminal,
  Key,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export default function StatusPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Key configuration state
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [keySaveMessage, setKeySaveMessage] = useState(null);

  // Sandbox states
  const [retainContent, setRetainContent] = useState(
    'Candidate declared expertise: React 75%, JavaScript 68%. Goal: Full Stack Developer. Weakness: SQL 42%.'
  );
  const [retainResult, setRetainResult] = useState(null);
  const [retaining, setRetaining] = useState(false);

  const [recallQuery, setRecallQuery] = useState('What are the candidate skills and target career goal?');
  const [recallResult, setRecallResult] = useState(null);
  const [recalling, setRecalling] = useState(false);

  const [reflectQuery, setReflectQuery] = useState(
    'Synthesize the candidate technical strengths and current learning trajectory.'
  );
  const [reflectResult, setReflectResult] = useState(null);
  const [reflecting, setReflecting] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/status');
      if (res.data?.success) {
        setStatus(res.data.services);
      }
    } catch (e) {
      console.warn('Failed to load status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;

    setSavingKey(true);
    setKeySaveMessage(null);

    try {
      const res = await api.post('/status/config', {
        hindsightApiKey: apiKeyInput.trim(),
      });

      if (res.data?.success) {
        setKeySaveMessage({ type: 'success', text: res.data.message });
        setApiKeyInput('');
        fetchStatus();
        confetti({ particleCount: 70, spread: 60 });
      }
    } catch (err) {
      setKeySaveMessage({
        type: 'error',
        text: err.response?.data?.message || err.message,
      });
    } finally {
      setSavingKey(false);
    }
  };

  const handleTestRetain = async () => {
    if (!retainContent.trim()) return;
    setRetaining(true);
    setRetainResult(null);

    try {
      const res = await api.post('/memory/retain', {
        content: retainContent.trim(),
        tags: ['sandbox_test', 'career_fact'],
        context: 'Manual Sandbox Test',
      });
      setRetainResult({ success: true, data: res.data });
    } catch (err) {
      setRetainResult({
        success: false,
        error: err.response?.data?.message || err.message,
      });
    } finally {
      setRetaining(false);
    }
  };

  const handleTestRecall = async () => {
    if (!recallQuery.trim()) return;
    setRecalling(true);
    setRecallResult(null);

    try {
      const res = await api.post('/memory/recall', {
        query: recallQuery.trim(),
      });
      setRecallResult({ success: true, data: res.data });
    } catch (err) {
      setRecallResult({
        success: false,
        error: err.response?.data?.message || err.message,
      });
    } finally {
      setRecalling(false);
    }
  };

  const handleTestReflect = async () => {
    if (!reflectQuery.trim()) return;
    setReflecting(true);
    setReflectResult(null);

    try {
      const res = await api.post('/memory/reflect', {
        query: reflectQuery.trim(),
      });
      setReflectResult({ success: true, data: res.data });
    } catch (err) {
      setReflectResult({
        success: false,
        error: err.response?.data?.message || err.message,
      });
    } finally {
      setReflecting(false);
    }
  };

  const isMongoOk = status?.mongodb?.connected;
  const isAiOk = status?.ai?.configured;
  const isHindsightOk = status?.hindsight?.configured && status?.hindsight?.connected;

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800 }}>System Integration Health & API Test</h1>
            <span className="badge badge-info">Diagnostics</span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
            Real-time status probes for MongoDB, AI LLM, and Hindsight Cloud memory integration.
          </p>
        </div>

        <button onClick={fetchStatus} disabled={loading} className="btn btn-secondary">
          <RefreshCw size={14} className={loading ? 'spinner' : ''} />
          <span>Refresh Probes</span>
        </button>
      </div>

      {/* Prominent Hindsight Cloud Key Configuration Box */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: isHindsightOk ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(99, 102, 241, 0.4)',
          boxShadow: isHindsightOk ? '0 0 25px rgba(16, 185, 129, 0.15)' : '0 0 25px rgba(99, 102, 241, 0.15)',
          padding: '28px',
          marginBottom: '28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: isHindsightOk ? 'rgba(16, 185, 129, 0.2)' : 'linear-gradient(135deg, #6366f1, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isHindsightOk ? '#10b981' : '#fff',
              }}
            >
              <Key size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                  Hindsight Cloud Connection Setup
                </h3>
                <span className={`badge ${isHindsightOk ? 'badge-success' : 'badge-warning'}`}>
                  {isHindsightOk ? 'Connected to Cloud' : 'API Key Required'}
                </span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
                Paste your Hindsight Cloud API key below to connect live. (Saved to backend/.env automatically).
              </p>
            </div>
          </div>

          <a
            href="https://ui.hindsight.vectorize.io"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '8px 14px' }}
          >
            <span>Open Hindsight Console</span>
            <ExternalLink size={13} />
          </a>
        </div>

        {/* Instructions */}
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '10px',
            fontSize: '12px',
            color: '#cbd5e1',
            lineHeight: 1.6,
            marginBottom: '18px',
            borderLeft: '3px solid #6366f1',
          }}
        >
          <strong>How to get your API key in 1 minute:</strong>
          <ol style={{ paddingLeft: '18px', marginTop: '6px' }}>
            <li>Go to <a href="https://ui.hindsight.vectorize.io" target="_blank" rel="noreferrer" style={{ color: '#67e8f9', textDecoration: 'underline' }}>ui.hindsight.vectorize.io</a> and log in with your email (e.g. <code>gayathripuspati74@gmail.com</code>).</li>
            <li>Go to <strong>API Keys</strong> in the dashboard and copy your generated key.</li>
            <li>Paste it below and click <strong>"Save & Connect"</strong>.</li>
          </ol>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSaveApiKey} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="password"
            className="form-input"
            placeholder="Paste your Hindsight API key here..."
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            style={{ flex: 1, minWidth: '300px' }}
          />
          <button
            type="submit"
            disabled={savingKey || !apiKeyInput.trim()}
            className="btn btn-primary"
            style={{ padding: '12px 24px' }}
          >
            {savingKey ? 'Connecting...' : 'Save & Connect to Hindsight Cloud'}
          </button>
        </form>

        {keySaveMessage && (
          <div
            style={{
              marginTop: '14px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              background: keySaveMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              color: keySaveMessage.type === 'success' ? '#6ee7b7' : '#fda4af',
              border: `1px solid ${keySaveMessage.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            }}
          >
            {keySaveMessage.text}
          </div>
        )}
      </div>

      {/* Core 3 Systems Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* 1. MongoDB Status */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: isMongoOk ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isMongoOk ? '#10b981' : '#f43f5e',
                }}
              >
                <Database size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>MongoDB Database</h3>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Structured Data Store</div>
              </div>
            </div>
            <span className={`badge ${isMongoOk ? 'badge-success' : 'badge-danger'}`}>
              {isMongoOk ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
              {status?.mongodb?.statusText || (isMongoOk ? 'Connected' : 'Not connected')}
            </span>
          </div>

          <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.6 }}>
            <div>
              <strong>Host:</strong> {status?.mongodb?.details?.host || '127.0.0.1'}
            </div>
            <div>
              <strong>Database:</strong> {status?.mongodb?.details?.dbName || 'career-guidance-ai'}
            </div>
            <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '11px' }}>
              Stores accounts, skill assessments, resumes, quiz answers, and roadmap checkpoints.
            </div>
          </div>
        </div>

        {/* 2. AI LLM API Status */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: isAiOk ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isAiOk ? '#10b981' : '#f59e0b',
                }}
              >
                <Cpu size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>AI LLM Provider</h3>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Reasoning & Mentorship</div>
              </div>
            </div>
            <span className={`badge ${isAiOk ? 'badge-success' : 'badge-warning'}`}>
              {isAiOk ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
              {status?.ai?.statusText || (isAiOk ? 'Configured' : 'Not configured')}
            </span>
          </div>

          <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.6 }}>
            <div>
              <strong>Provider:</strong> {status?.ai?.details?.provider || 'Google Gemini'}
            </div>
            <div>
              <strong>Model:</strong> {status?.ai?.details?.model || 'gemini-1.5-flash'}
            </div>
            <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '11px' }}>
              {status?.ai?.details?.message}
            </div>
          </div>
        </div>

        {/* 3. Hindsight Memory Status */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: isHindsightOk
                    ? 'rgba(16, 185, 129, 0.15)'
                    : status?.hindsight?.configured
                    ? 'rgba(245, 158, 11, 0.15)'
                    : 'rgba(244, 63, 94, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isHindsightOk ? '#10b981' : status?.hindsight?.configured ? '#f59e0b' : '#f43f5e',
                }}
              >
                <Brain size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Hindsight Cloud</h3>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Official SDK Memory Layer</div>
              </div>
            </div>
            <span
              className={`badge ${
                isHindsightOk
                  ? 'badge-success'
                  : status?.hindsight?.configured
                  ? 'badge-warning'
                  : 'badge-danger'
              }`}
            >
              {isHindsightOk ? (
                <CheckCircle2 size={12} />
              ) : status?.hindsight?.configured ? (
                <AlertTriangle size={12} />
              ) : (
                <XCircle size={12} />
              )}
              {status?.hindsight?.statusText || (status?.hindsight?.configured ? 'Configured' : 'Not configured')}
            </span>
          </div>

          <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.6 }}>
            <div>
              <strong>Endpoint:</strong> {status?.hindsight?.details?.baseUrl || 'https://api.hindsight.vectorize.io'}
            </div>
            <div>
              <strong>SDK Package:</strong> <code>@vectorize-io/hindsight-client v0.10.1</code>
            </div>
            <div>
              <strong>Active Bank:</strong> <code>{user?.hindsightBankId || 'Not registered'}</code>
            </div>
            <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '11px' }}>
              {status?.hindsight?.details?.message}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Hindsight Sandbox */}
      <div className="card" style={{ padding: '32px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Terminal size={22} color="#6366f1" />
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Hindsight Operation Verification Sandbox</h2>
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>
              Directly invoke the official Hindsight SDK operations (Retain, Recall, Reflect) and inspect raw memory payloads.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Operation 1: Retain */}
          <div
            style={{
              padding: '20px',
              background: 'rgba(15, 23, 42, 0.7)',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span className="badge badge-primary">1. RETAIN</span>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>Ingest Memory Fact</span>
            </div>

            <textarea
              className="form-textarea"
              rows={4}
              value={retainContent}
              onChange={(e) => setRetainContent(e.target.value)}
              placeholder="Enter career memory to retain..."
              style={{ fontSize: '12px' }}
            />

            <button
              onClick={handleTestRetain}
              disabled={retaining || !retainContent.trim()}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '12px', fontSize: '13px' }}
            >
              {retaining ? 'Retaining...' : 'Test client.retain()'}
            </button>

            {retainResult && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '10px',
                  background: retainResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: retainResult.success ? '#6ee7b7' : '#fda4af',
                }}
              >
                {retainResult.success
                  ? `✅ Retained successfully into bank [${retainResult.data.bankId}]`
                  : `⚠️ ${retainResult.error}`}
              </div>
            )}
          </div>

          {/* Operation 2: Recall */}
          <div
            style={{
              padding: '20px',
              background: 'rgba(15, 23, 42, 0.7)',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span className="badge badge-info">2. RECALL</span>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>Retrieve Relevant Memories</span>
            </div>

            <textarea
              className="form-textarea"
              rows={4}
              value={recallQuery}
              onChange={(e) => setRecallQuery(e.target.value)}
              placeholder="Search memories via semantic/temporal recall..."
              style={{ fontSize: '12px' }}
            />

            <button
              onClick={handleTestRecall}
              disabled={recalling || !recallQuery.trim()}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '12px', fontSize: '13px' }}
            >
              {recalling ? 'Recalling...' : 'Test client.recall()'}
            </button>

            {recallResult && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '10px',
                  background: recallResult.success ? 'rgba(6, 182, 212, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: recallResult.success ? '#67e8f9' : '#fda4af',
                }}
              >
                {recallResult.success ? (
                  <div>
                    <div>✅ Retrieved {recallResult.data.count || 0} memories:</div>
                    {recallResult.data.memories?.map((m, i) => (
                      <div key={i} style={{ marginTop: '4px', paddingLeft: '8px', borderLeft: '2px solid #06b6d4' }}>
                        "{m.text}"
                      </div>
                    ))}
                  </div>
                ) : (
                  `⚠️ ${recallResult.error}`
                )}
              </div>
            )}
          </div>

          {/* Operation 3: Reflect */}
          <div
            style={{
              padding: '20px',
              background: 'rgba(15, 23, 42, 0.7)',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span className="badge badge-success">3. REFLECT</span>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>Synthesize Growth Trajectory</span>
            </div>

            <textarea
              className="form-textarea"
              rows={4}
              value={reflectQuery}
              onChange={(e) => setReflectQuery(e.target.value)}
              placeholder="Ask synthesis question for Reflect..."
              style={{ fontSize: '12px' }}
            />

            <button
              onClick={handleTestReflect}
              disabled={reflecting || !reflectQuery.trim()}
              className="btn btn-success"
              style={{ width: '100%', marginTop: '12px', fontSize: '13px' }}
            >
              {reflecting ? 'Reflecting...' : 'Test client.reflect()'}
            </button>

            {reflectResult && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '10px',
                  background: reflectResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: reflectResult.success ? '#6ee7b7' : '#fda4af',
                }}
              >
                {reflectResult.success ? (
                  <div>
                    <div>✅ Reflect Output:</div>
                    <div style={{ marginTop: '4px', fontStyle: 'italic', lineHeight: 1.4 }}>
                      "{reflectResult.data.reflection}"
                    </div>
                  </div>
                ) : (
                  `⚠️ ${reflectResult.error}`
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
