import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

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
      navigate('/dashboard');
    } else {
      setError(res.message || 'Invalid email or password');
    }
  };

  const handleDemoFill = () => {
    setEmail('demo.candidate@example.com');
    setPassword('Password123!');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: '40px',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              margin: '0 auto 16px auto',
              boxShadow: '0 0 25px rgba(99, 102, 241, 0.5)',
            }}
          >
            <Brain size={28} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>
            Sign in to your Career Guidance AI workspace powered by Hindsight
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '10px',
              color: '#fda4af',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>
            Don't have an account yet?{' '}
            <Link to="/signup" style={{ fontWeight: 600, color: '#818cf8' }}>
              Sign up here
            </Link>
          </p>
        </div>

        {/* Demo Fill Helper */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center',
          }}
        >
          <button
            type="button"
            onClick={handleDemoFill}
            className="btn btn-secondary"
            style={{ width: '100%', fontSize: '12px', padding: '8px' }}
          >
            <ShieldCheck size={14} color="#06b6d4" />
            <span>Fill Demo Credentials (or create new below)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
