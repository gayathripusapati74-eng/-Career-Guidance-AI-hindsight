import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  GraduationCap,
  Users,
  UserCheck,
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
  Lock,
} from 'lucide-react';

export default function Sidebar() {
  const { currentRole, isAdmin, isFaculty, isStudent } = useAuth();

  // Role-specific navigation definitions
  let primaryDashboardItem = null;
  let analyticsItems = [];
  let careerItems = [];

  if (isAdmin) {
    primaryDashboardItem = { path: '/admin/dashboard', label: 'Executive Admin', icon: Shield, badge: 'Full Access' };
    analyticsItems = [
      { path: '/campusiq/dashboard', label: 'Campus Overview', icon: BarChart3 },
      { path: '/campusiq/early-warning', label: 'Early-Warning Radar', icon: Radio, badge: 'Radar' },
      { path: '/campusiq/students', label: 'Student Directory', icon: Users },
      { path: '/campusiq/segments', label: '4-Quadrant Matrix', icon: Layers },
      { path: '/campusiq/simulator', label: 'What-If Simulator', icon: Sliders, badge: 'Sim' },
      { path: '/campusiq/interventions', label: 'Action Interventions', icon: Target },
      { path: '/impact-analytics', label: 'Impact Analytics', icon: TrendingUp, badge: 'ROI' },
      { path: '/campusiq/data-hub', label: 'Data Ingestion Hub', icon: Database },
      { path: '/campusiq/reports', label: 'Reports & Export', icon: FileSpreadsheet },
    ];
    careerItems = []; // Career Guidance AI removed from Administrative interface
  } else if (isFaculty) {
    primaryDashboardItem = { path: '/faculty/dashboard', label: 'Faculty Dashboard', icon: UserCheck, badge: 'Advisor' };
    analyticsItems = [
      { path: '/campusiq/students', label: 'Assigned Mentees', icon: Users },
      { path: '/campusiq/early-warning', label: 'Mentee Alerts', icon: Radio, badge: 'Alerts' },
      { path: '/campusiq/interventions', label: 'Interventions & Logs', icon: Target },
      { path: '/campusiq/segments', label: 'Quadrant Strategy', icon: Layers },
      { path: '/campusiq/simulator', label: 'What-If Simulator', icon: Sliders },
    ];
    careerItems = []; // Career Guidance AI removed from Faculty interface
  } else {
    // Student Role: strictly personalized, non-stigmatizing view
    primaryDashboardItem = { path: '/student/dashboard', label: 'Student Dashboard', icon: GraduationCap, badge: 'My Portal' };
    analyticsItems = []; // Students cannot browse administrative analytics or at-risk lists
    careerItems = [
      { path: '/chat', label: 'AI Career Mentor', icon: MessageSquare, badge: 'Hindsight' },
      { path: '/skills', label: 'Skill Assessment', icon: Award },
      { path: '/resume', label: 'Resume Review', icon: FileText },
      { path: '/roadmap', label: 'My Career Roadmap', icon: Map },
      { path: '/quiz', label: 'Practice Quiz', icon: HelpCircle },
      { path: '/interview', label: 'Mock Interview Prep', icon: Video },
      { path: '/status', label: 'System Status', icon: Activity },
    ];
  }

  const renderNavLinks = (items) => {
    return items.map((item) => {
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
            textDecoration: 'none',
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
                background: 'rgba(167, 25, 48, 0.25)',
                color: '#ff8a80',
              }}
            >
              {item.badge}
            </span>
          )}
        </NavLink>
      );
    });
  };

  return (
    <aside
      className="sidebar"
      style={{
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-card)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxHeight: '100vh',
      }}
    >
      {/* Brand Header */}
      <div style={{ padding: '0 6px 16px 6px', borderBottom: '1px solid var(--border-card)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-secondary) 100%)',
              border: '1px solid rgba(198, 40, 61, 0.4)',
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

      {/* Role Badge Indicator */}
      <div
        style={{
          margin: '12px 6px 4px 6px',
          padding: '8px 10px',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>Active Role</span>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 800,
            color: '#FFFFFF',
            backgroundColor: 'var(--primary)',
            padding: '2px 7px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {currentRole}
        </span>
      </div>

      {/* Scrollable Navigation */}
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
          marginTop: '8px',
          flex: 1,
          overflowY: 'auto',
          paddingRight: '4px',
        }}
      >
        {/* Section 1: Role Dashboard */}
        <div style={{ padding: '6px 10px', fontSize: '10px', fontWeight: 800, color: '#ff8a80', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          My Dashboard
        </div>
        {primaryDashboardItem && renderNavLinks([primaryDashboardItem])}

        {/* Section 2: Student Success Intelligence (Admin & Faculty Only) */}
        {analyticsItems.length > 0 && (
          <>
            <div style={{ margin: '10px 0 4px 0', borderTop: '1px solid var(--border-card)' }} />
            <div style={{ padding: '4px 10px', fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Success Intelligence
            </div>
            {renderNavLinks(analyticsItems)}
          </>
        )}

        {/* Section 3: AI Career & Mentorship Suite */}
        {careerItems.length > 0 && (
          <>
            <div style={{ margin: '10px 0 4px 0', borderTop: '1px solid var(--border-card)' }} />
            <div style={{ padding: '4px 10px', fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Career & Mentorship
            </div>
            {renderNavLinks(careerItems)}
          </>
        )}
      </nav>

      {/* Footer System Indicator */}
      <div style={{ padding: '10px', borderTop: '1px solid var(--border-card)', flexShrink: 0, fontSize: '10px', color: 'var(--text-dim)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Lock size={11} style={{ color: 'var(--primary-hover)' }} />
          <span>RBAC Enforced • KPMG India</span>
        </div>
      </div>
    </aside>
  );
}
