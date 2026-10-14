import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Filter,
  RefreshCw,
  Search,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { getAtRiskStudents, reviewAtRiskAlert } from '../../services/campusiqApi';
import EmptyState from '../../components/EmptyState';
import { SkeletonCards } from '../../components/SkeletonLoader';

export default function CampusIQEarlyWarningPage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  const [reviewModalStudent, setReviewModalStudent] = useState(null);
  const [reviewStatusChoice, setReviewStatusChoice] = useState('Under Review');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await getAtRiskStudents({
        department: selectedDept,
        year: selectedYear,
        level: selectedLevel,
        status: selectedStatus,
      });
      if (res.data?.success) {
        setQueue(res.data.queue || []);
      }
    } catch (err) {
      console.error('Error fetching priority queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [selectedDept, selectedYear, selectedLevel, selectedStatus]);

  const handleReviewSubmit = async () => {
    if (!reviewModalStudent) return;
    setSubmittingReview(true);
    try {
      const res = await reviewAtRiskAlert({
        studentId: reviewModalStudent.studentId,
        reviewStatus: reviewStatusChoice,
        reviewNotes,
      });
      if (res.data.success) {
        setReviewModalStudent(null);
        setReviewNotes('');
        fetchQueue();
      }
    } catch (err) {
      console.error('Error reviewing alert:', err);
      alert('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', background: 'var(--primary-light)', color: 'var(--primary-hover)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              CampusIQ • Early-Warning Radar
            </span>
            <span style={{ color: 'var(--border-card)' }}>/</span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Priority Review Queue</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Early-Warning Radar & Priority Review Queue
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px', margin: 0 }}>
            Ranked by multi-factor urgency: detects attendance deficits, score degradation trends, and placement skill gaps before critical thresholds are breached.
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-card)', padding: '8px 14px', borderRadius: '12px', border: '1px solid var(--border-card)', flexWrap: 'wrap' }}>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{ background: 'transparent', color: 'var(--text-main)', border: 'none', fontSize: '12.5px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="All" style={{ background: '#0D0D0D' }}>All Depts</option>
            <option value="Computer Science & Engineering" style={{ background: '#0D0D0D' }}>CSE</option>
            <option value="Information Technology" style={{ background: '#0D0D0D' }}>IT</option>
            <option value="Electronics & Communication Engineering" style={{ background: '#0D0D0D' }}>ECE</option>
            <option value="Mechanical Engineering" style={{ background: '#0D0D0D' }}>MECH</option>
          </select>

          <span style={{ color: 'var(--border-card)' }}>|</span>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            style={{ background: 'transparent', color: 'var(--text-main)', border: 'none', fontSize: '12.5px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="All" style={{ background: '#0D0D0D' }}>All Risk Levels</option>
            <option value="Critical" style={{ background: '#0D0D0D' }}>Critical Only</option>
            <option value="High" style={{ background: '#0D0D0D' }}>High Only</option>
            <option value="Medium" style={{ background: '#0D0D0D' }}>Medium Only</option>
          </select>

          <span style={{ color: 'var(--border-card)' }}>|</span>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ background: 'transparent', color: 'var(--text-main)', border: 'none', fontSize: '12.5px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="Pending" style={{ background: '#0D0D0D' }}>Pending Review</option>
            <option value="Under Review" style={{ background: '#0D0D0D' }}>Under Review</option>
            <option value="Dismissed" style={{ background: '#0D0D0D' }}>Dismissed</option>
            <option value="All" style={{ background: '#0D0D0D' }}>All Statuses</option>
          </select>

          <button
            onClick={fetchQueue}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Urgency Explanation Banner */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldAlert size={20} color="var(--primary-hover)" />
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-main)' }}>Human-in-the-Loop Decision Support:</strong> Risk flags are diagnostic indicators, not punitive evaluations. Authorized faculty can review, annotate, or dismiss alerts with a permanent audit trail.
          </div>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
          Queue size: <strong style={{ color: 'var(--text-main)' }}>{queue.length}</strong> students
        </div>
      </div>

      {/* Priority Queue Cards */}
      {loading ? (
        <SkeletonCards count={3} />
      ) : queue.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No At-Risk Alerts Found"
          description="All students in the selected department, year, and risk filter meet institutional benchmarks."
          actionLabel="Reset Filter Scope"
          onAction={() => {
            setSelectedDept('All');
            setSelectedYear('All');
            setSelectedLevel('All');
            setSelectedStatus('All');
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {queue.map((student, idx) => {
            const isCritical = student.academicRisk?.level === 'Critical' || student.placementRisk?.level === 'Critical';
            const isHigh = student.academicRisk?.level === 'High' || student.placementRisk?.level === 'High';

            return (
              <div
                key={student.studentId}
                className="card"
                style={{
                  padding: '20px',
                  borderLeft: isCritical ? '3px solid var(--primary-hover)' : isHigh ? '3px solid var(--accent-amber)' : '3px solid var(--border-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isCritical ? 'rgba(198, 40, 40, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: isCritical ? 'var(--primary-hover)' : 'var(--accent-amber)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '13px',
                      }}
                    >
                      #{idx + 1}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Link to={`/campusiq/students/${student.studentId}`} style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', textDecoration: 'none' }}>
                          {student.name}
                        </Link>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                          {student.studentId}
                        </span>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>
                          {student.department} • Year {student.year}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Urgency Score</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: isCritical ? 'var(--primary-hover)' : 'var(--accent-amber)' }}>
                        {student.urgencyScore}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', paddingLeft: '10px', borderLeft: '1px solid var(--border-card)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Success Score</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: student.successScore >= 70 ? 'var(--accent-emerald)' : student.successScore >= 55 ? 'var(--accent-amber)' : 'var(--primary-hover)' }}>
                        {student.successScore}/100
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setReviewModalStudent(student);
                        setReviewStatusChoice(student.reviewStatus || 'Under Review');
                        setReviewNotes(student.reviewNotes || '');
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <span>Review Alert</span>
                    </button>

                    <Link
                      to={`/campusiq/students/${student.studentId}`}
                      className="btn btn-outline"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <span>Profile →</span>
                    </Link>
                  </div>
                </div>

                {/* Evidence & Indicator Badges */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                  {/* Academic Risk Evidence */}
                  <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-main)' }}>ACADEMIC RISK</span>
                      <span className={`badge ${student.academicRisk?.level === 'Critical' ? 'badge-danger' : student.academicRisk?.level === 'High' ? 'badge-warning' : 'badge-primary'}`}>
                        {student.academicRisk?.level || 'Low'}
                      </span>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      {(student.academicRisk?.reasons || ['No critical factors']).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Placement Risk Evidence */}
                  <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-main)' }}>PLACEMENT READINESS</span>
                      <span className={`badge ${student.placementRisk?.level === 'Critical' ? 'badge-danger' : student.placementRisk?.level === 'High' ? 'badge-warning' : 'badge-primary'}`}>
                        {student.placementRisk?.level || 'Low'}
                      </span>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      {(student.placementRisk?.reasons || ['Benchmarks met']).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewModalStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
              Faculty Audit: Review Alert for {reviewModalStudent.name}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
              {reviewModalStudent.studentId} • {reviewModalStudent.department}
            </p>

            <div className="form-group">
              <label className="form-label">Review Status Action</label>
              <select
                className="form-select"
                value={reviewStatusChoice}
                onChange={(e) => setReviewStatusChoice(e.target.value)}
              >
                <option value="Under Review">Under Review (Assigned to Faculty Advisor)</option>
                <option value="Reviewed">Reviewed & Action Initiated</option>
                <option value="Dismissed">Dismissed (False Positive / Approved Medical Leave)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Audit Notes & Mentoring Observations</label>
              <textarea
                rows={3}
                className="form-textarea"
                placeholder="Document cause of attendance drop or specific remedial plan agreed with student..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setReviewModalStudent(null)}
                className="btn btn-secondary"
                style={{ fontSize: '12.5px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingReview}
                onClick={handleReviewSubmit}
                className="btn btn-primary"
                style={{ fontSize: '12.5px' }}
              >
                {submittingReview ? 'Recording...' : 'Save Audit Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
