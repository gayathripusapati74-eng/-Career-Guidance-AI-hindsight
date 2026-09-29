import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Award,
  FileText,
  Map,
  HelpCircle,
  Video,
  Briefcase,
  TrendingUp,
  Activity,
  BrainCircuit,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/chat', label: 'AI Career Chat', icon: MessageSquare, badge: 'Hindsight' },
  { path: '/skills', label: 'Skill Assessment', icon: Award },
  { path: '/resume', label: 'Resume Evaluation', icon: FileText },
  { path: '/roadmap', label: 'Career Roadmap', icon: Map },
  { path: '/quiz', label: 'AI Quiz', icon: HelpCircle },
  { path: '/interview', label: 'Mock Interview', icon: Video },
  { path: '/jobs', label: 'Job Matches', icon: Briefcase, badge: 'Demo' },
  { path: '/progress', label: 'Progress & Reflect', icon: TrendingUp },
  { path: '/status', label: 'API Test & Status', icon: Activity },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ padding: '0 8px 24px 8px', borderBottom: '1px solid var(--border-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <BrainCircuit size={18} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc' }}>
              CAREER <span className="gradient-text">GUIDANCE</span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>AI Mentor Suite</div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '20px', flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                color: isActive ? '#ffffff' : '#94a3b8',
                background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0.08) 100%)' : 'transparent',
                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                transition: 'all 0.2s ease',
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: item.badge === 'Hindsight' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(6, 182, 212, 0.2)',
                    color: item.badge === 'Hindsight' ? '#a5b4fc' : '#67e8f9',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div
        style={{
          padding: '16px',
          background: 'rgba(30, 41, 59, 0.4)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
          🧠 Memory Subsystem
        </div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Hindsight Cloud SDK</span>
        </div>
        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
          Biomimetic Retain • Recall • Reflect
        </div>
      </div>
    </aside>
  );
}
