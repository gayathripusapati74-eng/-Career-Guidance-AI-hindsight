import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  Building,
  GraduationCap,
  Users,
  UserCheck,
  Server,
  BarChart3,
  Radio,
  Layers,
  Sliders,
  Target,
  TrendingUp,
  Database,
  FileSpreadsheet,
  MessageSquare,
  Award,
  FileText,
  Map,
  HelpCircle,
  Video,
  Activity,
  BrainCircuit,
} from 'lucide-react';

const ROLE_NAV_ITEMS = [
  { path: '/management', label: 'Management', icon: Building, badge: 'Exec' },
  { path: '/admin', label: 'College Admin', icon: Shield },
  { path: '/hod', label: 'HOD Analytics', icon: GraduationCap },
  { path: '/faculty', label: 'Faculty Mentor', icon: UserCheck },
  { path: '/student', label: 'Student Portal', icon: Users },
  { path: '/system-admin', label: 'System Admin', icon: Server },
];

const ANALYTICS_NAV_ITEMS = [
  { path: '/campusiq/dashboard', label: 'Campus Overview', icon: BarChart3 },
  { path: '/student-success', label: 'Success Intelligence', icon: Radio, badge: 'Radar' },
  { path: '/campusiq/students', label: 'Student Directory', icon: Users },
  { path: '/campusiq/segments', label: '4-Quadrant Matrix', icon: Layers },
  { path: '/campusiq/simulator', label: 'What-If Simulator', icon: Sliders, badge: 'Sim' },
  { path: '/interventions', label: 'Action Intelligence', icon: Target },
  { path: '/impact-analytics', label: 'Impact Analytics', icon: TrendingUp, badge: 'ROI' },
  { path: '/campusiq/data-hub', label: 'Data Ingestion Hub', icon: Database },
  { path: '/reports', label: 'Reports & Export', icon: FileSpreadsheet },
];

const CAREER_NAV_ITEMS = [
  { path: '/chat', label: 'AI Career Chat', icon: MessageSquare, badge: 'Hindsight' },
  { path: '/skills', label: 'Skill Assessment', icon: Award },
  { path: '/resume', label: 'Resume Evaluation', icon: FileText },
  { path: '/roadmap', label: 'Career Roadmap', icon: Map },
  { path: '/quiz', label: 'AI Quiz', icon: HelpCircle },
  { path: '/interview', label: 'Mock Interview', icon: Video },
  { path: '/status', label: 'API Diagnostics', icon: Activity },
];

export default function Sidebar() {
  return (
    <aside className="sidebar" style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-card)', display: 'flex', flexDirection: 'column', height: '100vh', maxHeight: '100vh' }}>
      {/* Brand Header */}
      <div style={{ padding: '0 6px 16px 6px', borderBottom: '1px solid var(--border-card)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-secondary) 100%)',
              border: '1px solid rgba(198, 40, 40, 0.4)',
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
            <div style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              CAMPUS<span style={{ color: 'var(--primary-hover)' }}>IQ</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Predict • Optimize • Intervene</div>
          </div>
        </div>
      </div>

      {/* Scrollable Navigation */}
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
          marginTop: '12px',
          flex: 1,
          overflowY: 'auto',
          paddingRight: '4px',
        }}
      >
        {/* Section 1: Role-Based Dashboards */}
        <div style={{ padding: '6px 10px', fontSize: '10px', fontWeight: 800, color: '#ff8a80', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Role Dashboards
        </div>

        {ROLE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary-hover)' : '3px solid transparent',
                transition: 'all 0.15s ease',
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <Icon size={15} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '2px 5px',
                    borderRadius: '4px',
                    background: 'rgba(198, 40, 40, 0.25)',
                    color: '#ff8a80',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        {/* Section 2: Student Success Analytics */}
        <div style={{ margin: '10px 0 4px 0', borderTop: '1px solid var(--border-card)' }} />
        <div style={{ padding: '4px 10px', fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Success Intelligence
        </div>

        {ANALYTICS_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary-hover)' : '3px solid transparent',
                transition: 'all 0.15s ease',
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <Icon size={15} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '2px 5px',
                    borderRadius: '4px',
                    background: item.badge === 'Radar' ? 'rgba(198, 40, 40, 0.25)' : 'rgba(6, 182, 212, 0.2)',
                    color: item.badge === 'Radar' ? '#ff8a80' : '#67e8f9',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        {/* Section 3: AI Career Suite */}
        <div style={{ margin: '10px 0 4px 0', borderTop: '1px solid var(--border-card)' }} />
        <div style={{ padding: '4px 10px', fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          AI Career & Hindsight
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
                padding: '7px 10px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary-hover)' : '3px solid transparent',
                transition: 'all 0.15s ease',
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <Icon size={15} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '2px 5px',
                    borderRadius: '4px',
                    background: 'rgba(139, 0, 0, 0.25)',
                    color: '#ff8a80',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div
        style={{
          marginTop: 'auto',
          padding: '10px 12px',
          background: 'var(--bg-surface)',
          borderRadius: '8px',
          border: '1px solid var(--border-card)',
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '2px' }}>
          Enterprise Core
        </div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)' }}>
          CampusIQ • Hindsight Cloud
        </div>
      </div>
    </aside>
  );
}
