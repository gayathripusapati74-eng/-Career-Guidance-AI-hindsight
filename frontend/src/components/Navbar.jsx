import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, INSTITUTIONAL_ROLES } from '../context/AuthContext';
import {
  LogOut,
  Brain,
  Shield,
  Bell,
  ChevronDown,
  User as UserIcon,
  Search,
  Activity,
  Layers,
} from 'lucide-react';
import api from '../services/api';

export default function Navbar() {
  const { user, currentRole, switchRole, logout } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

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

  const handleRoleSelect = (role) => {
    switchRole(role.id);
    setRoleDropdownOpen(false);
    navigate(role.path);
  };

  const currentRoleMeta = INSTITUTIONAL_ROLES.find((r) => r.id === currentRole) || INSTITUTIONAL_ROLES[0];
  const isHindsightOnline = status?.hindsight?.configured && status?.hindsight?.connected;

  return (
    <header
      style={{
        height: '70px',
        borderBottom: '1px solid var(--border-card)',
        background: 'var(--bg-navbar)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
      }}
    >
      {/* Left: Brand & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/management" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-secondary) 100%)',
              border: '1px solid rgba(198, 40, 40, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 14px rgba(139, 0, 0, 0.4)',
            }}
          >
            <Shield size={19} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15.5px', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              CAMPUS<span style={{ color: 'var(--primary-hover)' }}>IQ</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              AI Student Analytics & Success Platform
            </div>
          </div>
        </Link>
      </div>

      {/* Right Controls: Role Switcher, Alerts, Profile & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Institutional Role Selector Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: '8px',
              color: 'var(--text-main)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-hover)' }} />
            <span>Role: <strong style={{ color: '#ff8a80' }}>{currentRoleMeta.label}</strong></span>
            <ChevronDown size={14} color="var(--text-dim)" />
          </button>

          {roleDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '280px',
                background: '#0D0D0D',
                border: '1px solid var(--border-card)',
                borderRadius: '12px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.8)',
                padding: '6px',
                zIndex: 100,
              }}
            >
              <div style={{ padding: '8px 10px', fontSize: '10.5px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Select Active Institutional View
              </div>
              {INSTITUTIONAL_ROLES.map((r) => {
                const isSelected = r.id === currentRole;
                return (
                  <div
                    key={r.id}
                    onClick={() => handleRoleSelect(r)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--primary-light)' : 'transparent',
                      borderLeft: isSelected ? '3px solid var(--primary-hover)' : '3px solid transparent',
                      transition: 'background 0.15s ease',
                      marginBottom: '2px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: isSelected ? '#ff8a80' : 'var(--text-main)' }}>
                        {r.label}
                      </span>
                      <span className="badge" style={{ fontSize: '9px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-dim)' }}>
                        {r.badge}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {r.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hindsight Health Indicator */}
        <Link
          to="/status"
          className="badge"
          style={{
            cursor: 'pointer',
            padding: '5px 10px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            color: 'var(--text-muted)',
            textDecoration: 'none',
          }}
          title="System Health & Hindsight Memory Layer"
        >
          <div
            className={isHindsightOnline ? 'pulse-indicator-green' : 'pulse-indicator'}
          />
          <span style={{ fontSize: '11.5px', fontWeight: 600 }}>
            {isHindsightOnline ? 'Hindsight Memory' : 'Hindsight Active'}
          </span>
        </Link>

        {/* User Pill */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 12px',
              background: 'var(--bg-surface)',
              borderRadius: '9999px',
              border: '1px solid var(--border-card)',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
            </div>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)' }}>
              {user.firstName}
            </span>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{ padding: '7px 12px', fontSize: '12px' }}
          title="Sign out"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
