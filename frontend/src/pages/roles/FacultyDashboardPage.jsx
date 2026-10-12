import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Target,
  Calendar,
  FileText,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { getStudents, getInterventions, createIntervention } from '../../services/campusiqApi';

export default function FacultyDashboardPage() {
  const [students, setStudents] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form
  const [concernTitle, setConcernTitle] = useState('');
  const [actionCategory, setActionCategory] = useState('Academic Remedial');
  const [recommendedAction, setRecommendedAction] = useState('');
  const [priority, setPriority] = useState('High');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadFacultyData() {
      setLoading(true);
      try {
        const [stuRes, invRes] = await Promise.all([
          getStudents({ limit: 12 }),
          getInterventions({ status: 'In-Progress' }),
        ]);
        if (stuRes.data?.students) setStudents(stuRes.data.students);
        if (invRes.data?.interventions) setInterventions(invRes.data.interventions.slice(0, 6));
      } catch (err) {
        console.error('Error loading faculty dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFacultyData();
  }, []);

  const handleOpenInterventionModal = (student) => {
    setSelectedStudent(student);
    setConcernTitle(`Academic Support Plan for ${student.name}`);
    setRecommendedAction(`Schedule 2x weekly 1-on-1 tutoring sessions to recover attendance and review key semester topics.`);
    setShowModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !concernTitle || !recommendedAction) return;

    setSubmitting(true);
    try {
      const res = await createIntervention({
        studentId: selectedStudent.studentId,
        concernTitle,
        actionCategory,
        recommendedAction,
        priority,
        mentorAssigned: 'Dr. Faculty Mentor (You)',
      });

      if (res.data?.success) {
        setShowModal(false);
        // Refresh interventions
        const updated = await getInterventions({ status: 'In-Progress' });
        if (updated.data?.interventions) setInterventions(updated.data.interventions.slice(0, 6));
      }
    } catch (err) {
      console.error('Error creating faculty intervention:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--primary-hover)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              CampusIQ • Faculty Mentorship
            </span>
            <span style={{ color: 'var(--border-card)' }}>/</span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Assigned Student Caseload</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Faculty Mentorship & Advising Center
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Assigned student cohort tracking, explainable evidence warnings, and 1-on-1 intervention follow-ups
          </p>
        </div>

        <Link to="/campusiq/interventions" className="btn btn-primary" style={{ fontSize: '12.5px' }}>
          <Target size={14} />
          <span>All Interventions Roster</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Assigned Mentees</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>24 Students</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Active Section 3A Cohort</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Mentees Needing Support</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-hover)' }}>5 Students</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Attendance &lt; 75% or backlog alerts</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Pending Follow-Ups This Week</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-amber)' }}>{interventions.length} Tasks</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Scheduled progress reviews</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Resolved Interventions</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-emerald)' }}>8 Closed</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Average outcome: +9.2% attendance</div>
        </div>
      </div>

      {/* Main Grid: Mentees List & Active Action Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', marginBottom: '28px' }}>
        {/* Left: Assigned Student Caseload */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Assigned Mentee Caseload & Risk Indicators
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Inspect indicators and initiate personalized mentoring actions
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {students.map((stu) => {
              const isAtRisk = stu.computed?.academicRisk?.level !== 'Low' || (stu.academic?.attendancePercentage ?? 100) < 75;

              return (
                <div
                  key={stu.studentId}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '13.5px' }}>
                        {stu.name}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                        {stu.studentId}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      <span>Att: <strong style={{ color: (stu.academic?.attendancePercentage ?? 100) >= 75 ? 'var(--text-main)' : 'var(--accent-amber)' }}>{stu.academic?.attendancePercentage ?? '—'}%</strong></span>
                      <span>•</span>
                      <span>CGPA: <strong>{stu.academic?.gpa ?? '—'}</strong></span>
                      <span>•</span>
                      <span>Coding: <strong>{stu.placement?.codingScore ?? '—'}</strong></span>
                    </div>

                    {/* Explainable factor if at risk */}
                    {isAtRisk && (
                      <div style={{ fontSize: '11px', color: 'var(--primary-hover)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={12} />
                        <span>Attendance below 75% minimum statutory cutoff</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleOpenInterventionModal(stu)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <Plus size={13} />
                      <span>Intervene</span>
                    </button>
                    <Link
                      to={`/campusiq/students/${stu.studentId}`}
                      className="btn btn-outline"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                    >
                      <span>Profile</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Interventions & Deadlines */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Active Remedial Action Plans
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Follow-ups requiring your mentoring review
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {interventions.map((inv) => (
              <div
                key={inv.interventionId}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '10px',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-hover)', fontFamily: 'monospace' }}>
                    {inv.interventionId}
                  </span>
                  <span className="badge badge-primary">{inv.actionCategory}</span>
                </div>

                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '13px', marginBottom: '2px' }}>
                  {inv.studentName}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '8px' }}>
                  {inv.recommendedAction}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-dim)', borderTop: '1px solid var(--border-card)', paddingTop: '8px' }}>
                  <span>Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                  <Link to="/campusiq/interventions" style={{ color: '#ff8a80', fontWeight: 600 }}>
                    Log Follow-up →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Modal: Assign Intervention */}
      {showModal && selectedStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
              Assign Faculty Mentoring Action
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
              Assigning support for {selectedStudent.name} ({selectedStudent.studentId})
            </p>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Concern Title</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={concernTitle}
                  onChange={(e) => setConcernTitle(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Intervention Category</label>
                <select
                  className="form-select"
                  value={actionCategory}
                  onChange={(e) => setActionCategory(e.target.value)}
                >
                  <option value="Academic Remedial">Academic Remedial</option>
                  <option value="Placement Accelerator">Placement Accelerator</option>
                  <option value="Attendance Recovery">Attendance Recovery</option>
                  <option value="1-on-1 Mentorship">1-on-1 Mentorship</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Action Plan & Milestones</label>
                <textarea
                  required
                  rows={3}
                  className="form-textarea"
                  value={recommendedAction}
                  onChange={(e) => setRecommendedAction(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                  style={{ fontSize: '12.5px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ fontSize: '12.5px' }}
                >
                  {submitting ? 'Assigning...' : 'Confirm Intervention'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
