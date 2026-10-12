import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, INSTITUTIONAL_ROLES } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, User } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleQuickSelect = async (roleId) => {
    setEmail('demo.candidate@example.com');
    setPassword('Password123!');
    setError('');
    setLoading(true);
    const res = await login('demo.candidate@example.com', 'Password123!', roleId);
    setLoading(false);

    if (res.success) {
      const targetRoleMeta = INSTITUTIONAL_ROLES.find((r) => r.id === roleId);
      navigate(targetRoleMeta ? targetRoleMeta.path : '/management');
    } else {
      setError(res.message || 'Login failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/management');
    } else {
      setError(res.message || 'Invalid email or password');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '40px 36px',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-secondary) 100%)',
              border: '1px solid rgba(198, 40, 40, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              margin: '0 auto 14px auto',
              boxShadow: '0 0 20px rgba(139, 0, 0, 0.4)',
            }}
          >
            <Shield size={24} />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            CAMPUS<span style={{ color: 'var(--primary-hover)' }}>IQ</span>
          </h2>
          <div style={{ width: '40px', height: '3px', background: 'var(--primary-hover)', margin: '8px auto 10px auto', borderRadius: '2px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
            AI-Powered Student Analytics & Success Platform
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 14px',
              background: 'rgba(198, 40, 40, 0.15)',
              border: '1px solid rgba(198, 40, 40, 0.35)',
              borderRadius: '8px',
              color: '#ef5350',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Standard Login Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          <div className="form-group">
            <label className="form-label">Institutional Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '14px', marginTop: '4px' }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to CampusIQ'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Role Logins */}
        <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', textAlign: 'center' }}>
            Instant Role Login (1-Click Evaluation)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {INSTITUTIONAL_ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleRoleQuickSelect(r.id)}
                disabled={loading}
                style={{
                  padding: '8px 10px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '8px',
                  color: 'var(--text-muted)',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary-hover)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-card)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <div style={{ color: 'var(--text-main)', fontWeight: 700 }}>{r.label.split('/')[0].trim()}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{r.badge}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '11.5px', color: 'var(--text-dim)' }}>
          Need an account?{' '}
          <Link to="/signup" style={{ color: 'var(--primary-hover)', fontWeight: 600 }}>
            Register Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
