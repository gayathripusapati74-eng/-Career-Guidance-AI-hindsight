import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Brain, Cpu, Database, User as UserIcon, ShieldCheck, Activity } from 'lucide-react';
import api from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await api.get('/status');
        if (res.data?.success) {
          setStatus(res.data.services);
        }
      } catch (e) {
        // silent
      }
    }
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isHindsightOnline = status?.hindsight?.configured && status?.hindsight?.connected;

  return (
    <header
      style={{
        height: '70px',
        borderBottom: '1px solid var(--border-card)',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Brain size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em', color: '#fff' }}>
              CAREER GUIDANCE <span className="gradient-text">AI</span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
              Powered by <strong style={{ color: '#a5b4fc' }}>Hindsight Memory</strong>
            </div>
          </div>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Health status badge */}
        <Link
          to="/status"
          className="badge"
          style={{
            cursor: 'pointer',
            padding: '6px 12px',
            background: isHindsightOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
            border: `1px solid ${isHindsightOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
            color: isHindsightOnline ? '#6ee7b7' : '#a5b4fc',
          }}
          title="Click to view System Integration Health"
        >
          <div
            className="pulse-indicator"
            style={{ background: isHindsightOnline ? '#10b981' : '#6366f1' }}
          ></div>
          <span style={{ fontSize: '12px', fontWeight: 600 }}>
            {isHindsightOnline ? 'Hindsight Active' : 'Hindsight Integration'}
          </span>
        </Link>

        {/* User Profile Pill */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 14px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
              {user.firstName} {user.lastName}
            </span>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{ padding: '8px 14px', fontSize: '13px' }}
          title="Sign out"
        >
          <LogOut size={16} />
          <span className="hide-mobile">Logout</span>
        </button>
      </div>
    </header>
  );
}
