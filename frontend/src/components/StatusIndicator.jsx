import React, { useState, useEffect } from 'react';
import { Database, Cpu, Brain, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function StatusIndicator({ compact = false }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/status');
      if (res.data?.success) {
        setStatus(res.data.services);
        setError(null);
      }
    } catch (err) {
      setError('Could not reach backend API at /api/status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (compact) {
    const isHindsightOk = status?.hindsight?.configured && status?.hindsight?.connected;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          className={`badge ${isHindsightOk ? 'badge-success' : 'badge-warning'}`}
          style={{ fontSize: '11px' }}
        >
          <Brain size={12} />
          {isHindsightOk ? 'Hindsight Online' : 'Hindsight Configured'}
        </span>
      </div>
    );
  }

  const items = [
    {
      key: 'mongodb',
      name: 'MongoDB Database',
      icon: Database,
      status: status?.mongodb?.connected ? 'connected' : 'disconnected',
      label: status?.mongodb?.statusText || (status?.mongodb?.connected ? 'Connected' : 'Not connected'),
      details: status?.mongodb?.connected
        ? `Host: ${status?.mongodb?.details?.host} (${status?.mongodb?.details?.dbName})`
        : 'Connect via MONGODB_URI in backend/.env',
    },
    {
      key: 'ai',
      name: 'AI LLM API',
      icon: Cpu,
      status: status?.ai?.configured ? 'connected' : 'warning',
      label: status?.ai?.configured ? 'Configured' : 'Not configured (Template Mode)',
      details: status?.ai?.details?.message || (status?.ai?.configured ? 'Gemini 1.5 Flash Active' : 'Set AI_API_KEY for live LLM'),
    },
    {
      key: 'hindsight',
      name: 'Hindsight Memory Layer',
      icon: Brain,
      status: status?.hindsight?.configured
        ? status?.hindsight?.connected
          ? 'connected'
          : 'warning'
        : 'disconnected',
      label: status?.hindsight?.statusText || (!status?.hindsight?.configured ? 'Not configured' : 'Connected'),
      details: status?.hindsight?.details?.message || 'Set HINDSIGHT_API_KEY in backend/.env',
    },
  ];

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
            }}
          >
            <Brain size={16} />
          </div>
          <div>
            <h4 style={{ fontSize: '14px', margin: 0 }}>System Health & Integration Status</h4>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Real-time service verification probe</div>
          </div>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="btn btn-secondary"
          style={{ padding: '4px 10px', fontSize: '12px' }}
        >
          <RefreshCw size={12} className={loading ? 'spinner' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error ? (
        <div style={{ padding: '12px', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '8px', color: '#fb7185', fontSize: '12px' }}>
          {error}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {items.map((it) => {
            const Icon = it.icon;
            const isOk = it.status === 'connected';
            const isWarn = it.status === 'warning';

            return (
              <div
                key={it.key}
                style={{
                  padding: '14px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  borderRadius: '10px',
                  border: `1px solid ${isOk ? 'rgba(16, 185, 129, 0.2)' : isWarn ? 'rgba(245, 158, 11, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={16} color={isOk ? '#10b981' : isWarn ? '#f59e0b' : '#f43f5e'} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>{it.name}</span>
                  </div>
                  <span className={`badge ${isOk ? 'badge-success' : isWarn ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '10px' }}>
                    {isOk ? <CheckCircle2 size={10} /> : isWarn ? <AlertTriangle size={10} /> : <XCircle size={10} />}
                    {it.label}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
                  {it.details}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
