import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  PlusCircle,
  Clock,
  Search,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import { getAtRiskStudents, reviewAtRiskAlert } from '../../services/campusiqApi';

export default function CampusIQEarlyWarningPage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  const [reviewModalStudent, setReviewModalStudent] = useState(null);
  const [reviewStatusChoice, setReviewStatusChoice] = useState('Reviewed');
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
      if (res.data.success) {
        setQueue(res.data.queue);
      }
    } catch (err) {
      console.error('Error fetching at-risk queue:', err);
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
    <div className="page-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', textTransform: 'uppercase' }}>
              Phase 8 • Early-Warning Radar
            </span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Early-Warning Radar & Priority Review Queue
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px', margin: 0 }}>
            Ranked by multi-factor urgency: detects attendance deficits, score degradation trends, and placement skill gaps before critical thresholds are breached.
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(30, 41, 59, 0.6)', padding: '8px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', flexWrap: 'wrap' }}>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{ background: 'transparent', color: '#f8fafc', border: 'none', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="All" style={{ background: '#0f172a' }}>All Depts</option>
            <option value="Computer Science & Engineering" style={{ background: '#0f172a' }}>CSE</option>
            <option value="Information Technology" style={{ background: '#0f172a' }}>IT</option>
            <option value="Electronics & Communication Engineering" style={{ background: '#0f172a' }}>ECE</option>
            <option value="Mechanical Engineering" style={{ background: '#0f172a' }}>MECH</option>
          </select>

          <span style={{ color: '#475569' }}>|</span>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            style={{ background: 'transparent', color: '#f8fafc', border: 'none', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="All" style={{ background: '#0f172a' }}>All Risk Levels</option>
            <option value="Critical" style={{ background: '#0f172a' }}>Critical Only</option>
            <option value="High" style={{ background: '#0f172a' }}>High Only</option>
            <option value="Medium" style={{ background: '#0f172a' }}>Medium Only</option>
          </select>

          <span style={{ color: '#475569' }}>|</span>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ background: 'transparent', color: '#f8fafc', border: 'none', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="Pending" style={{ background: '#0f172a' }}>Pending Review</option>
            <option value="Reviewed" style={{ background: '#0f172a' }}>Reviewed</option>
            <option value="Dismissed" style={{ background: '#0f172a' }}>Dismissed</option>
            <option value="All" style={{ background: '#0f172a' }}>All Statuses</option>
          </select>

          <button
            onClick={fetchQueue}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Urgency Explanation Banner */}
      <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldAlert size={20} color="#f59e0b" />
          <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
            <strong>Human-in-the-Loop Decision Support:</strong> Risk flags are diagnostic indicators, not punitive evaluations. Authorized faculty can review, annotate, or dismiss alerts with a permanent audit trail.
          </div>
        </div>
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
          Queue size: <strong>{queue.length}</strong> students
        </div>
      </div>

      {/* Priority Queue Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <RefreshCw size={24} className="spin" style={{ marginBottom: '10px' }} />
          <div>Evaluating multi-source risk criteria...</div>
        </div>
      ) : queue.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <CheckCircle2 size={36} color="#34d399" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '18px', color: '#f8fafc', margin: 0 }}>No At-Risk Alerts Found</h3>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>
            All students in the selected filter meet institutional academic and placement thresholds.
          </p>
        </div>
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
                  background: 'rgba(30, 41, 59, 0.7)',
                  borderRadius: '14px',
                  border: isCritical ? '1px solid rgba(239, 68, 68, 0.4)' : isHigh ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
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
                        background: isCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: isCritical ? '#f87171' : '#fbbf24',
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
                        <Link to={`/campusiq/students/${student.studentId}`} style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', textDecoration: 'none' }}>
                          {student.name}
                        </Link>
                        <span style={{ fontSize: '12px', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                          {student.studentId}
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          {student.department} • Year {student.year}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Urgency Score</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: isCritical ? '#f87171' : '#fbbf24' }}>
                        {student.urgencyScore}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', paddingLeft: '8px', borderLeft: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Success Score</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: student.successScore >= 70 ? '#34d399' : student.successScore >= 55 ? '#fbbf24' : '#f87171' }}>
                        {student.successScore}/100
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setReviewModalStudent(student);
                        setReviewStatusChoice(student.reviewStatus || 'Reviewed');
                        setReviewNotes(student.reviewNotes || '');
                      }}
                      className="btn"
                      style={{ padding: '7px 12px', fontSize: '12px', background: 'rgba(255, 255, 255, 0.08)', color: '#e2e8f0', borderRadius: '8px' }}
                    >
                      {student.reviewStatus === 'Reviewed' ? 'Reviewed ✓' : student.reviewStatus === 'Dismissed' ? 'Dismissed ✗' : 'Review Alert'}
                    </button>

                    <Link
                      to={`/campusiq/interventions?studentId=${student.studentId}&name=${encodeURIComponent(student.name)}`}
                      className="btn btn-primary"
                      style={{ padding: '7px 14px', fontSize: '12px', borderRadius: '8px' }}
                    >
                      <PlusCircle size={14} /> Assign Action
                    </Link>
                  </div>
                </div>

                {/* Dual Risk Evidence Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  {/* Academic Risk Card */}
                  <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.45)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>ACADEMIC RISK</span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: student.academicRisk?.level === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : student.academicRisk?.level === 'High' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                          color: student.academicRisk?.level === 'Critical' ? '#f87171' : student.academicRisk?.level === 'High' ? '#fbbf24' : '#38bdf8',
                        }}
                      >
                        {student.academicRisk?.level} Level
                      </span>
                    </div>

                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#cbd5e1' }}>
                      {(student.academicRisk?.reasons || []).map((r, i) => (
                        <li key={i} style={{ marginBottom: '3px' }}>{r}</li>
                      ))}
                    </ul>

                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                      Attendance: <strong>{student.indicators.attendance ?? 'N/A'}%</strong> • GPA: <strong>{student.indicators.gpa ?? 'N/A'}</strong> • Backlogs: <strong>{student.indicators.backlogs ?? 0}</strong>
                    </div>
                  </div>

                  {/* Placement Risk Card */}
                  <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.45)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>PLACEMENT READINESS RISK</span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: student.placementRisk?.level === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : student.placementRisk?.level === 'High' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                          color: student.placementRisk?.level === 'Critical' ? '#f87171' : student.placementRisk?.level === 'High' ? '#fbbf24' : '#38bdf8',
                        }}
                      >
                        {student.placementRisk?.level} Level
                      </span>
                    </div>

                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#cbd5e1' }}>
                      {(student.placementRisk?.reasons || []).map((r, i) => (
                        <li key={i} style={{ marginBottom: '3px' }}>{r}</li>
                      ))}
                    </ul>

                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                      Coding Score: <strong>{student.indicators.coding ?? 'N/A'}/100</strong>
                    </div>
                  </div>
                </div>

                {/* Audit footnote if reviewed */}
                {student.reviewStatus !== 'Pending' && (
                  <div style={{ fontSize: '11px', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.03)', padding: '6px 10px', borderRadius: '6px' }}>
                    Audit: Marked as <strong>{student.reviewStatus}</strong> by {student.reviewedBy || 'Faculty'} on {new Date(student.lastReviewedAt || Date.now()).toLocaleDateString()}
                    {student.reviewNotes && ` — "${student.reviewNotes}"`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal Dialog */}
      {reviewModalStudent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '100%' }}>
            <h3 style={{ fontSize: '18px', color: '#f8fafc', margin: '0 0 10px 0' }}>
              Review Risk Alert for {reviewModalStudent.name}
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 16px 0' }}>
              Student ID: <strong>{reviewModalStudent.studentId}</strong> • Urgency Score: <strong>{reviewModalStudent.urgencyScore}</strong>
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>Action Decision</label>
              <select
                value={reviewStatusChoice}
                onChange={(e) => setReviewStatusChoice(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#f8fafc', fontSize: '13px' }}
              >
                <option value="Reviewed">Reviewed & Action Pending (Keeps in queue with verified badge)</option>
                <option value="Dismissed">Dismiss Alert (False positive or acceptable extenuating circumstance)</option>
                <option value="Pending">Reset to Pending Review</option>
              </select>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>Faculty / Mentor Notes (Audit Log)</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Document your reason or extenuating circumstance..."
                rows={3}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#f8fafc', fontSize: '13px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setReviewModalStudent(null)}
                className="btn"
                style={{ padding: '8px 16px', background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={submittingReview}
                className="btn btn-primary"
                style={{ padding: '8px 18px' }}
              >
                {submittingReview ? 'Saving...' : 'Confirm Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
