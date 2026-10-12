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
  BarChart3,
  Radio,
  Users,
  Layers,
  Sliders,
  Target,
  Database,
  FileSpreadsheet,
} from 'lucide-react';

const CAREER_NAV_ITEMS = [
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

const CAMPUSIQ_NAV_ITEMS = [
  { path: '/campusiq/dashboard', label: 'Campus Overview', icon: BarChart3 },
  { path: '/campusiq/early-warning', label: 'Early-Warning Radar', icon: Radio, badge: 'Radar' },
  { path: '/campusiq/students', label: 'Student Directory', icon: Users },
  { path: '/campusiq/segments', label: '4-Quadrant Matrix', icon: Layers },
  { path: '/campusiq/simulator', label: 'What-If Simulator', icon: Sliders, badge: 'Sim' },
  { path: '/campusiq/interventions', label: 'Action Intelligence', icon: Target },
  { path: '/campusiq/data-hub', label: 'Data Ingestion Hub', icon: Database },
  { path: '/campusiq/reports', label: 'Reports & Export', icon: FileSpreadsheet },
];

export default function Sidebar() {
  return (
    <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxHeight: '100vh' }}>
      {/* Brand Header */}
      <div style={{ padding: '0 8px 18px 8px', borderBottom: '1px solid var(--border-card)', flexShrink: 0 }}>
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
              flexShrink: 0,
            }}
          >
            <BrainCircuit size={18} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc' }}>
              CAMPUS<span className="gradient-text">IQ</span>
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>Predict • Explain • Intervene</div>
          </div>
        </div>
      </div>

      {/* Scrollable Navigation Links */}
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          marginTop: '14px',
          flex: 1,
          overflowY: 'auto',
          paddingRight: '4px',
        }}
      >
        {/* Section Header: CampusIQ */}
        <div style={{ padding: '6px 12px', fontSize: '10px', fontWeight: 800, color: '#818cf8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          CampusIQ Analytics
        </div>

        {CAMPUSIQ_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: isActive ? '#ffffff' : '#94a3b8',
                background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0.08) 100%)' : 'transparent',
                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                transition: 'all 0.15s ease',
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={16} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '2px 5px',
                    borderRadius: '4px',
                    background: item.badge === 'Radar' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(6, 182, 212, 0.2)',
                    color: item.badge === 'Radar' ? '#f87171' : '#67e8f9',
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

        {/* Section Divider & Header: Career Guidance */}
        <div style={{ margin: '12px 0 6px 0', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }} />
        <div style={{ padding: '4px 12px', fontSize: '10px', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Career Guidance & AI
        </div>

        {CAREER_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: isActive ? '#ffffff' : '#94a3b8',
                background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0.08) 100%)' : 'transparent',
                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                transition: 'all 0.15s ease',
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={16} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '2px 5px',
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
          marginTop: 'auto',
          padding: '12px 14px',
          background: 'rgba(30, 41, 59, 0.4)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>
          🧠 Dual Engine Architecture
        </div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Hindsight Cloud • CampusIQ</span>
        </div>
        <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>
          Biomimetic Memory & Analytics
        </div>
      </div>
    </aside>
  );
}
