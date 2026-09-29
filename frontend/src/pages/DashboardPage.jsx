import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Brain,
  MessageSquare,
  Award,
  FileText,
  Map,
  HelpCircle,
  Video,
  Briefcase,
  TrendingUp,
  Activity,
  LogOut,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Target,
  Clock,
  ChevronRight,
} from 'lucide-react';
import StatusIndicator from '../components/StatusIndicator';
import api from '../services/api';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await api.get('/progress');
        if (res.data?.success) {
          setDashboardData(res.data);
        }
      } catch (e) {
        console.warn('Failed to load dashboard progress data');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = dashboardData?.stats;
  const skills = dashboardData?.currentSkills || user?.currentSkills || [];
  const milestones = dashboardData?.milestones || [];

  const CARDS = [
    {
      title: 'AI Career Chat',
      desc: 'Ask our mentor questions with memory of your past assessments and goals.',
      icon: MessageSquare,
      path: '/chat',
      badge: 'Hindsight Memory',
      color: '#6366f1',
    },
    {
      title: 'Skill Assessment',
      desc: 'Assess proficiency in React, Node.js, SQL, and DSA to establish baselines.',
      icon: Award,
      path: '/skills',
      badge: 'Adaptive Scoring',
      color: '#06b6d4',
    },
    {
      title: 'Resume Evaluation',
      desc: 'Upload your resume for deep ATS compatibility scoring and skill gap analysis.',
      icon: FileText,
      path: '/resume',
      badge: 'ATS Parser',
      color: '#10b981',
    },
    {
      title: 'Career Roadmap',
      desc: 'Explore your customized 6-phase learning journey tailored to your background.',
      icon: Map,
      path: '/roadmap',
      badge: 'Personalized',
      color: '#8b5cf6',
    },
    {
      title: 'AI Quiz',
      desc: 'Test knowledge with dynamic questions tailored to your experience level.',
      icon: HelpCircle,
      path: '/quiz',
      badge: 'Skill Drill',
      color: '#f59e0b',
    },
    {
      title: 'Mock Interview',
      desc: 'Simulate high-stakes technical, behavioral, or system design interviews.',
      icon: Video,
      path: '/interview',
      badge: 'Question-by-Question',
      color: '#ec4899',
    },
    {
      title: 'Job Recommendations',
      desc: 'Browse curated job listings matched to your assessed skills with gap highlights.',
      icon: Briefcase,
      path: '/jobs',
      badge: 'DEMO Matches',
      color: '#3b82f6',
    },
    {
      title: 'Progress & Reflect',
      desc: 'Track scores over time and run Hindsight Reflect to synthesize your growth.',
      icon: TrendingUp,
      path: '/progress',
      badge: 'Hindsight Reflect',
      color: '#14b8a6',
    },
    {
      title: 'API Test & Health',
      desc: 'Verify live connectivity for MongoDB, AI LLM, and Hindsight Cloud.',
      icon: Activity,
      path: '/status',
      badge: 'Diagnostics',
      color: '#a855f7',
    },
    {
      title: 'Logout',
      desc: 'Securely sign out of your Career Guidance AI workspace.',
      icon: LogOut,
      onClick: handleLogout,
      badge: 'Security',
      color: '#ef4444',
      isDanger: true,
    },
  ];

  return (
    <div className="page-wrapper">
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          marginBottom: '28px',
          padding: '32px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-primary">
                <Brain size={13} />
                <span>Memory Bank: {user?.hindsightBankId || `career-bank-${user?.id || 'candidate'}`}</span>
              </span>
              <span className="badge badge-info">
                <Target size={13} />
                <span>Goal: {user?.careerGoal || 'Full Stack Developer'}</span>
              </span>
            </div>

            <h1 style={{ fontSize: '32px', fontWeight: 800 }}>
              Welcome, <span className="gradient-text">{user?.firstName || 'Candidate'}</span>! 👋
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '6px', maxWidth: '640px' }}>
              Your intelligent career co-pilot is tracking your technical skill trajectory and interview readiness
              using Hindsight long-term memory.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/chat" className="btn btn-primary" style={{ padding: '12px 20px' }}>
              <MessageSquare size={16} />
              <span>Ask AI Mentor</span>
            </Link>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginTop: '28px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Overall Readiness
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#67e8f9', marginTop: '4px' }}>
              {stats?.overallReadiness || 0}%
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Skills Assessed
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#a5b4fc', marginTop: '4px' }}>
              {skills.length} Skills
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Roadmap Progress
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
              {stats?.roadmapProgressPercentage || 0}%
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Interview Score
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
              {stats?.interviewAverage ? `${stats.interviewAverage}%` : 'Pending'}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Next Steps & Achievements Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Recommended Next Steps */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sparkles size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '16px', margin: 0 }}>Recommended Next Steps</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>1. Complete Full Skill Assessment</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Evaluate React & SQL to seed Hindsight memory</div>
              </div>
              <Link to="/skills" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                Start
              </Link>
            </div>

            <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>2. Run ATS Resume Evaluation</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Identify missing technologies and keyword gaps</div>
              </div>
              <Link to="/resume" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                Upload
              </Link>
            </div>

            <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>3. AI Mock Technical Interview</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Practice real question-by-question interview flow</div>
              </div>
              <Link to="/interview" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                Practice
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Achievements & Milestones */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Award size={18} color="#6366f1" />
            <h3 style={{ fontSize: '16px', margin: 0 }}>Recent Achievements & Milestones</h3>
          </div>
          {milestones.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '13px' }}>
              No milestones recorded yet. Take an assessment or quiz to earn milestones!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {milestones.slice(-3).reverse().map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <CheckCircle2 size={16} color="#10b981" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{m.title}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {new Date(m.date).toLocaleDateString()} • {m.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 10 Dashboard Action Cards Grid */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
          Explore Modules & Capabilities
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {CARDS.map((card, idx) => {
            const Icon = card.icon;
            const content = (
              <div
                className={`card card-interactive ${card.isDanger ? 'card-danger' : ''}`}
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '22px',
                  border: card.isDanger ? '1px solid rgba(244, 63, 94, 0.2)' : '1px solid var(--border-card)',
                }}
                onClick={card.onClick}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: `${card.color}22`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: card.color,
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: '#94a3b8',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {card.badge}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
                    {card.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                    {card.desc}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: card.isDanger ? '#fb7185' : '#818cf8',
                    marginTop: '16px',
                  }}
                >
                  <span>{card.isDanger ? 'End Session' : 'Launch Module'}</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            );

            return card.path ? (
              <Link key={idx} to={card.path} style={{ textDecoration: 'none' }}>
                {content}
              </Link>
            ) : (
              <div key={idx} style={{ cursor: 'pointer' }}>
                {content}
              </div>
            );
          })}
        </div>
      </div>

      {/* System Health / Status Section */}
      <div style={{ marginTop: '32px' }}>
        <StatusIndicator />
      </div>
    </div>
  );
}
