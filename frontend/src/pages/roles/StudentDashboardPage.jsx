import React from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';

export default function StudentDashboardPage() {
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
            Welcome back, Gayathri!
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Computer Science & Engineering • 3rd Year, Semester 5 • Roll No: STU2026-077
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
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-emerald)' }}>81%</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>✓ Compliant with 75% exam cutoff</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Cumulative Grade Point</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)' }}>8.4 / 10</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>First Class with Distinction</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Placement Coding Readiness</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-cyan)' }}>74 / 100</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Eligible for Tier-1 Hiring Track</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Earned Degree Credits</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)' }}>96 / 160</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Zero active backlogs</div>
        </div>
      </div>

      {/* Main Grid: Subject Attendance & AI Revision Recommendations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', marginBottom: '28px' }}>
        {/* Left: Subject-wise Attendance & Published Marks */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 16px 0' }}>
            Current Semester Subject Attendance & Assessment Status
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { code: 'CS301', name: 'Data Structures & Algorithms', attendance: 88, marks: '44 / 50', status: 'Safe' },
              { code: 'CS302', name: 'Database Management Systems', attendance: 74, marks: '39 / 50', status: 'Attention Needed' },
              { code: 'CS303', name: 'Computer Networks', attendance: 82, marks: '41 / 50', status: 'Safe' },
              { code: 'CS304', name: 'Operating Systems & Concurrency', attendance: 79, marks: '38 / 50', status: 'Safe' },
            ].map((sub) => (
              <div
                key={sub.code}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-hover)', background: 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px' }}>
                      {sub.code}
                    </span>
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {sub.name}
                    </span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Midterm Internal Assessment: <strong style={{ color: 'var(--text-main)' }}>{sub.marks}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Attendance</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: sub.attendance >= 75 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                      {sub.attendance}%
                    </div>
                  </div>

                  <span className={`badge ${sub.status === 'Safe' ? 'badge-success' : 'badge-warning'}`}>
                    {sub.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI Revision Advice & Upcoming Tasks */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-hover)' }}>
              <Sparkles size={16} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Personalized Learning Gaps & Advice
            </h3>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-card)', marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#ff8a80', textTransform: 'uppercase', marginBottom: '4px' }}>
              Database Systems • Recommended Focus
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Your recent quiz performance indicates reviewing <strong>B+ Tree Indexing</strong> and <strong>Transaction Isolation Levels</strong>. Attending next Tuesday’s revision lab will also comfortably boost your attendance above 75%.
            </p>
          </div>

          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', margin: '14px 0 8px 0' }}>
            Upcoming Academic Deadlines
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
              <Clock size={16} color="var(--accent-amber)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>DBMS Lab Submission #4</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Due Tomorrow, 5:00 PM</div>
              </div>
              <span className="badge badge-warning">Pending</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
              <Calendar size={16} color="var(--primary-hover)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>DSA Midterm Continuous Quiz</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Friday, 10:00 AM</div>
              </div>
              <span className="badge badge-primary">Scheduled</span>
            </div>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-card)' }}>
            <Link to="/roadmap" className="btn btn-primary" style={{ width: '100%', fontSize: '12.5px', justifyContent: 'center' }}>
              <span>View Your 6-Phase Career Roadmap</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
