import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, UserCheck, GraduationCap, Server } from 'lucide-react';

const DEMO_PERSONAS = [
  {
    role: 'admin',
    title: 'Institutional Admin',
    email: 'admin@campus.edu.in',
    password: 'Admin@123',
    icon: Shield,
    badge: 'Executive & Ops',
    desc: 'Campus-wide KPIs, early-warning radar, interventions & reports',
    targetPath: '/admin/dashboard',
  },
  {
    role: 'faculty',
    title: 'Faculty / Advisor',
    email: 'faculty.cse@campus.edu.in',
    password: 'Faculty@123',
    icon: UserCheck,
    badge: 'CSE Department',
    desc: 'Assigned cohort mentees, early warnings & intervention logging',
    targetPath: '/faculty/dashboard',
  },
  {
    role: 'student',
    title: 'Student Portal',
    email: 'student.aarav@campus.edu.in',
    password: 'Student@123',
    icon: GraduationCap,
    badge: 'CSE Semester 1',
    desc: 'Personal academics, study recommendations & AI Career Mentor',
    targetPath: '/student/dashboard',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (persona) => {
    setEmail(persona.email);
    setPassword(persona.password);
    setError('');
    setLoading(true);

    const res = await login(persona.email, persona.password);
    setLoading(false);

    if (res.success) {
      navigate(res.dashboardPath || persona.targetPath);
    } else {
      setError(res.message || 'Authentication failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both institutional email/username and password');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate(res.dashboardPath || '/admin/dashboard');
    } else {
      setError(res.message || 'Invalid institutional credentials');
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
        backgroundImage: 'radial-gradient(at 0% 0%, rgba(167, 25, 48, 0.12) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(28, 28, 32, 0.4) 0px, transparent 50%)',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '40px 36px',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          boxShadow: '0 20px 48px rgba(0,0,0,0.85)',
        }}
      >
        {/* Institutional Branding Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-secondary) 100%)',
              border: '1px solid rgba(198, 40, 61, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              margin: '0 auto 14px auto',
              boxShadow: '0 0 24px rgba(167, 25, 48, 0.4)',
            }}
          >
            <Shield size={26} />
          </div>

          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            CAMPUS<span style={{ color: 'var(--primary-hover)' }}>IQ</span>
          </h2>
          <div style={{ width: '44px', height: '3px', background: 'var(--primary)', margin: '8px auto 10px auto', borderRadius: '2px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, fontWeight: 500 }}>
            AI-Powered Student Analytics & Success Platform
          </p>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', fontStyle: 'italic' }}>
            Predict • Optimize • Intervene • Measure
          </div>
        </div>

        {/* 1-Click Role Logins for Hackathon Evaluators */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Institutional Persona:
            </span>
            <span style={{ fontSize: '10.5px', color: 'var(--primary-hover)', fontWeight: 600 }}>1-Click Verified Auth</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {DEMO_PERSONAS.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handleQuickLogin(p)}
                  disabled={loading}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '10px',
                    padding: '12px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-hover)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-card)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(167, 25, 48, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-hover)',
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>{p.title}</div>
                  <div style={{ fontSize: '9.5px', color: 'var(--text-dim)' }}>{p.badge}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-card)' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>Or Login With Credentials</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-card)' }} />
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={16} style={{ color: '#EF4444', flexShrink: 0 }} />
            <span style={{ fontSize: '12.5px', color: '#ff8a80' }}>{error}</span>
          </div>
        )}

        {/* Manual Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Institutional Email / Username
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="email"
                className="input"
                placeholder="e.g. admin@campus.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-main)',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  paddingRight: '40px',
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-main)',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: 'var(--primary)',
              borderColor: 'var(--primary-secondary)',
              color: '#ffffff',
              borderRadius: '8px',
              marginTop: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px' }} />
                <span>Authenticating with Institutional Authority...</span>
              </>
            ) : (
              <>
                <span>Secure Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid var(--border-card)', paddingTop: '16px' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '12px', margin: 0 }}>
            New student registration?{' '}
            <Link to="/signup" style={{ color: 'var(--primary-hover)', fontWeight: 600, textDecoration: 'none' }}>
              Create Student Account
            </Link>
          </p>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '8px' }}>
            🔒 Role-based authorization enforced server-side. Unassigned or elevated roles require Administrative approval.
          </div>
        </div>
      </div>
    </div>
  );
}
