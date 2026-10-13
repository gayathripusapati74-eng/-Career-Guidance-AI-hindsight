import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  Shield,
  ChevronDown,
  UserCheck,
  GraduationCap,
  Activity,
  User,
  Lock,
} from 'lucide-react';
import api from '../services/api';

const SWITCH_ACCOUNTS = [
  {
    role: 'admin',
    title: 'Institutional Admin',
    email: 'admin@campus.edu.in',
    password: 'Admin@123',
    icon: Shield,
    path: '/admin/dashboard',
    desc: 'Full executive oversight, early warning & reports',
  },
  {
    role: 'faculty',
    title: 'Faculty / Mentor',
    email: 'faculty.cse@campus.edu.in',
    password: 'Faculty@123',
    icon: UserCheck,
    path: '/faculty/dashboard',
    desc: 'Assigned CSE cohort mentees & intervention logging',
  },
  {
    role: 'student',
    title: 'Enrolled Student',
    email: 'student.aarav@campus.edu.in',
    password: 'Student@123',
    icon: GraduationCap,
    path: '/student/dashboard',
    desc: 'Personal academics & Hindsight Career Mentor',
  },
];

export default function Navbar() {
  const { user, currentRole, login, logout } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSwitchPersona = async (account) => {
    setSwitching(true);
    setRoleDropdownOpen(false);
    const res = await login(account.email, account.password);
    setSwitching(false);
    if (res.success) {
      navigate(res.dashboardPath || account.path);
    }
  };

  const isHindsightOnline = status?.hindsight?.configured && status?.hindsight?.connected;

  const roleBadgeColors = {
    admin: { bg: 'rgba(167, 25, 48, 0.25)', text: '#ff8a80', border: 'rgba(167, 25, 48, 0.5)' },
    faculty: { bg: 'rgba(59, 130, 246, 0.2)', text: '#93c5fd', border: 'rgba(59, 130, 246, 0.4)' },
    student: { bg: 'rgba(16, 185, 129, 0.2)', text: '#6ee7b7', border: 'rgba(16, 185, 129, 0.4)' },
  };

  const badgeStyle = roleBadgeColors[currentRole] || roleBadgeColors.student;

  return (
    <header
      style={{
        height: '70px',
        borderBottom: '1px solid var(--border-card)',
        background: 'var(--bg-navbar)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}
    >
      {/* Left: Institutional Title & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              CampusIQ Enterprise
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '4px',
                backgroundColor: badgeStyle.bg,
                color: badgeStyle.text,
                border: `1px solid ${badgeStyle.border}`,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {currentRole}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
            KPMG in India Student Success Prototype
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Switch Persona Dropdown (Real Authenticated Sign-In) */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            disabled={switching}
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
              cursor: switching ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-hover)' }} />
            <span>Persona: <strong style={{ color: badgeStyle.text, textTransform: 'capitalize' }}>{currentRole}</strong></span>
            <ChevronDown size={14} color="var(--text-dim)" />
          </button>

          {roleDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '300px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-card)',
                borderRadius: '12px',
                boxShadow: '0 16px 36px rgba(0,0,0,0.85)',
                padding: '8px',
                zIndex: 100,
              }}
            >
              <div style={{ padding: '8px 10px', fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Authenticate Demo Persona (Server Verified)
              </div>
              {SWITCH_ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                const isSelected = acc.role === currentRole;
                return (
                  <div
                    key={acc.role}
                    onClick={() => handleSwitchPersona(acc)}
                    style={{
                      padding: '9px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--primary-light)' : 'transparent',
                      borderLeft: isSelected ? '3px solid var(--primary-hover)' : '3px solid transparent',
                      transition: 'background 0.15s ease',
                      marginBottom: '3px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon size={14} style={{ color: isSelected ? 'var(--primary-hover)' : 'var(--text-dim)' }} />
                        <span style={{ fontSize: '12.5px', fontWeight: 700, color: isSelected ? '#ffffff' : 'var(--text-main)' }}>
                          {acc.title}
                        </span>
                      </div>
                      <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
                        {acc.role}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '3px', paddingLeft: '22px' }}>
                      {acc.desc}
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
          title="Hindsight Memory Layer Telemetry"
        >
          <div className={isHindsightOnline ? 'pulse-indicator-green' : 'pulse-indicator'} />
          <span style={{ fontSize: '11.5px', fontWeight: 600 }}>
            {isHindsightOnline ? 'Hindsight Memory' : 'Hindsight Active'}
          </span>
        </Link>

        {/* User Profile Pill */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: 'rgba(167, 25, 48, 0.25)',
                color: 'var(--primary-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 800,
              }}
            >
              {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                {user.firstName} {user.lastName}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                {user.email}
              </div>
            </div>
          </div>
        )}

        {/* Real Logout Button */}
        <button
          onClick={handleLogout}
          title="Sign out & invalidate session"
          style={{
            background: 'none',
            border: '1px solid var(--border-card)',
            borderRadius: '8px',
            padding: '7px 10px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#EF4444';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.borderColor = 'var(--border-card)';
          }}
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
