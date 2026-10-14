import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  TrendingUp,
  Brain,
  FileText,
  Video,
  ChevronRight,
  ArrowRight,
  HelpCircle,
  GraduationCap,
  HeartHandshake,
  ShieldAlert,
} from 'lucide-react';
import { getStudentDashboard } from '../../services/campusiqApi';
import SkeletonPage from '../../components/SkeletonLoader';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        const res = await getStudentDashboard();
        if (res.data?.success) {
          setDashboardData(res.data);
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
        setError('Unable to load personalized student academic records');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return <SkeletonPage title="Loading Your Personalized Academic Hub..." />;
  }

  const student = dashboardData?.student || {};
  const computed = student.computed || {};
  const academic = student.academic || {};
  const placement = student.placement || {};
  const recommendations = dashboardData?.recommendations || [];
  const upcomingTasks = dashboardData?.upcomingTasks || [];
  const supportResources = dashboardData?.supportResources || [];
  const interventions = dashboardData?.interventions || [];

  return (
    <div className="page-container" style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', backgroundColor: 'var(--bg-primary)' }}>
      {/* Welcome Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--primary-hover)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              CampusIQ • Student Success Portal
            </span>
            <span style={{ color: 'var(--border-card)' }}>/</span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Undergraduate Academic Hub</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Welcome back, {student.name || user?.firstName || 'Student'}!
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            {student.department || 'Computer Science & Engineering'} • Semester {student.semester || 1} • Roll No: {student.studentId || user?.studentId || 'STU2026-001'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/chat" className="btn btn-primary" style={{ fontSize: '12.5px' }}>
            <Brain size={14} />
            <span>Chat with AI Career Mentor</span>
          </Link>
          <Link to="/quiz" className="btn btn-secondary" style={{ fontSize: '12.5px' }}>
            <HelpCircle size={14} />
            <span>Practice Technical Quiz</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Overall Attendance</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: (academic.attendancePercentage || 85) >= 75 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
            {academic.attendancePercentage || 85}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
            {(academic.attendancePercentage || 85) >= 75 ? '✓ Compliant with 75% exam cutoff' : '⚠ Below 75% examination threshold'}
          </div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Cumulative Grade Point (GPA)</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)' }}>
            {academic.gpa || 7.5} / 10
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
            {(academic.gpa || 7.5) >= 8.0 ? 'First Class with Distinction' : 'First Class Academic Standing'}
          </div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Placement Coding Readiness</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
            {placement.codingScore || 65} / 100
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
            {(placement.codingScore || 65) >= 70 ? 'Eligible for Tier-1 Placement Track' : 'Core Placement Eligible'}
          </div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Academic Health Score</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)' }}>
            {computed.academicHealthScore || 78} / 100
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
            Active Backlogs: {academic.backlogs || 0}
          </div>
        </div>
      </div>

      {/* Main Grid: Subject Status & Personalized Recommendations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px', marginBottom: '28px' }}>
        {/* Left: Personalized Study Guidance & Recommendations */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--primary-hover)' }} />
              <span>Personalized Academic Recommendations</span>
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Curated for Your Semester</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>{rec.title}</span>
                    <span
                      style={{
                        fontSize: '9.5px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: rec.priority === 'High' ? 'rgba(167, 25, 48, 0.25)' : 'rgba(255,255,255,0.06)',
                        color: rec.priority === 'High' ? '#ff8a80' : 'var(--text-muted)',
                        fontWeight: 700,
                      }}
                    >
                      {rec.category}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{rec.description}</p>
                </div>

                <Link
                  to={rec.actionUrl}
                  className="btn btn-secondary"
                  style={{
                    fontSize: '11.5px',
                    padding: '6px 12px',
                    flexShrink: 0,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{rec.actionLabel}</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            ))}
          </div>

          {/* Upcoming Academic Tasks */}
          <div style={{ marginTop: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
              Upcoming Assessments & Practical Deadlines
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar size={14} style={{ color: 'var(--text-dim)' }} />
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)' }}>{task.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{task.subject}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--primary-hover)' }}>{task.dueDate}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{task.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Academic Mentorship & Campus Resources */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Mentorship Connections */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HeartHandshake size={17} style={{ color: 'var(--accent-emerald)' }} />
              <span>Assigned Faculty Mentor</span>
            </h3>
            <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                {student.assignedMentor || 'Dr. S. Sharma (Prof. CSE)'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                Academic Advisory & Course Counselling
              </div>
              <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                <Link to="/chat" className="btn btn-secondary" style={{ fontSize: '11px', padding: '5px 10px' }}>
                  Schedule 1-on-1 Office Hours
                </Link>
              </div>
            </div>

            {interventions.length > 0 && (
              <div style={{ marginTop: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Active Academic Support Actions
                </div>
                {interventions.map((inv) => (
                  <div
                    key={inv.interventionId}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      background: 'rgba(167, 25, 48, 0.1)',
                      border: '1px solid rgba(167, 25, 48, 0.25)',
                      marginBottom: '6px',
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#ff8a80' }}>{inv.concernTitle}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{inv.recommendedAction}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>
                      Status: <strong>{inv.status}</strong> • Mentor: {inv.mentorAssigned}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Campus Support Ecosystem */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 14px 0' }}>
              Campus Support Directory
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {supportResources.map((res, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-card)',
                  }}
                >
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-main)' }}>{res.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{res.location} • {res.timings}</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--primary-hover)', marginTop: '4px' }}>{res.contact}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
