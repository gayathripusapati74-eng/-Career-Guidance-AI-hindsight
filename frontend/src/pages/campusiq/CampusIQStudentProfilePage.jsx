import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  Award,
  AlertTriangle,
  Briefcase,
  Clock,
  BookOpen,
  TrendingDown,
  TrendingUp,
  Sliders,
  PlusCircle,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
} from 'lucide-react';
import { getStudentById } from '../../services/campusiqApi';

export default function CampusIQStudentProfilePage() {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const res = await getStudentById(studentId);
        if (res.data.success) {
          setStudent(res.data.student);
          setInterventions(res.data.interventions || []);
        } else {
          setError(res.data.message || 'Student not found');
        }
      } catch (err) {
        console.error('Error fetching student profile:', err);
        setError('Failed to load profile. Please verify student ID.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [studentId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
        <RefreshCw size={28} className="spin" style={{ marginBottom: '12px', color: 'var(--primary-hover)' }} />
        <div>Compiling unified student record...</div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ color: 'var(--primary-hover)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
          {error || 'Student Not Found'}
        </div>
        <Link to="/campusiq/students" className="btn btn-primary">
          <ArrowLeft size={16} /> Back to Student Directory
        </Link>
      </div>
    );
  }

  const computed = student.computed || {};
  const score = computed.successScore ?? 0;
  const breakdown = computed.scoreBreakdown || {};
  const acadRisk = computed.academicRisk || {};
  const placeRisk = computed.placementRisk || {};

  return (
    <div className="page-container" style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', backgroundColor: 'var(--bg-primary)' }}>
      {/* Top Breadcrumb & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <Link to="/campusiq/students" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Directory
        </Link>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link
            to={`/campusiq/simulator?studentId=${student.studentId}`}
            className="btn"
            style={{ padding: '8px 14px', fontSize: '13px', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-card)', borderRadius: '8px' }}
          >
            <Sliders size={15} style={{ color: 'var(--primary-hover)' }} /> Simulate Scenarios
          </Link>

          <Link
            to={`/campusiq/interventions?studentId=${student.studentId}&name=${encodeURIComponent(student.name)}`}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}
          >
            <PlusCircle size={15} /> Assign Support Action
          </Link>
        </div>
      </div>

      {/* Student Banner Card */}
      <div
        className="card"
        style={{
          padding: '24px',
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border-card)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #352020 100%)',
              border: '1px solid var(--border-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              fontSize: '24px',
              fontWeight: 800,
            }}
          >
            {student.name.charAt(0)}
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              {student.name}
            </h1>
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-muted)' }}>
              <span>ID: <strong style={{ color: 'var(--text-main)' }}>{student.studentId}</strong></span>
              <span>•</span>
              <span>{student.department}</span>
              <span>•</span>
              <span>Year {student.year} (Semester {student.semester})</span>
              <span>•</span>
              <span>Mentor: <strong style={{ color: 'var(--text-main)' }}>{student.assignedMentor}</strong></span>
            </div>
          </div>
        </div>

        {/* Success Score Badge Box */}
        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Student Success Score
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: score >= 70 ? '#34d399' : score >= 55 ? '#fbbf24' : 'var(--primary-hover)' }}>
              {score}<span style={{ fontSize: '18px', color: 'var(--text-dim)' }}>/100</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Coverage: {computed.dataCoverage}% {computed.isProvisional && <span style={{ color: '#fbbf24' }}>(Provisional)</span>}
            </div>
          </div>

          <div style={{ padding: '8px 14px', borderRadius: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-card)', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dynamic Segment</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
              {computed.segment}
            </div>
          </div>
        </div>
      </div>

      {/* Dual Risk Assessment Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Academic Risk Card */}
        <div className="card" style={{ padding: '22px', background: 'var(--bg-card)', borderRadius: '16px', border: acadRisk.level === 'Critical' ? '1px solid rgba(198, 40, 40, 0.5)' : '1px solid var(--border-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} color="var(--primary-hover)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Academic Risk Assessment</h3>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '4px',
                background: acadRisk.level === 'Critical' ? 'rgba(139, 0, 0, 0.25)' : acadRisk.level === 'High' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                color: acadRisk.level === 'Critical' ? 'var(--primary-hover)' : acadRisk.level === 'High' ? '#fbbf24' : '#34d399',
                border: `1px solid ${acadRisk.level === 'Critical' ? 'rgba(198, 40, 40, 0.4)' : acadRisk.level === 'High' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
              }}
            >
              {acadRisk.level} Risk ({acadRisk.score} pts)
            </span>
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text-main)' }}>Evidence Points:</strong>
            <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px' }}>
              {(acadRisk.reasons || []).map((r, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>{r}</li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-card)', paddingTop: '10px' }}>
            <span>Attendance: <strong style={{ color: 'var(--text-main)' }}>{student.academic?.attendancePercentage ?? 'N/A'}%</strong></span>
            <span>GPA: <strong style={{ color: 'var(--text-main)' }}>{student.academic?.gpa ?? 'N/A'}/10</strong></span>
            <span>Backlogs: <strong style={{ color: student.academic?.backlogs > 0 ? 'var(--primary-hover)' : '#34d399' }}>{student.academic?.backlogs ?? 0}</strong></span>
            <span>Trend: <strong style={{ color: acadRisk.trend === 'declining' ? 'var(--primary-hover)' : '#34d399', textTransform: 'capitalize' }}>{acadRisk.trend || 'Stable'}</strong></span>
          </div>
        </div>

        {/* Placement Readiness Risk Card */}
        <div className="card" style={{ padding: '22px', background: 'var(--bg-card)', borderRadius: '16px', border: placeRisk.level === 'Critical' ? '1px solid rgba(198, 40, 40, 0.5)' : '1px solid var(--border-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={18} color="var(--primary-hover)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Placement Readiness Assessment</h3>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '4px',
                background: placeRisk.level === 'Critical' ? 'rgba(139, 0, 0, 0.25)' : placeRisk.level === 'High' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                color: placeRisk.level === 'Critical' ? 'var(--primary-hover)' : placeRisk.level === 'High' ? '#fbbf24' : '#34d399',
                border: `1px solid ${placeRisk.level === 'Critical' ? 'rgba(198, 40, 40, 0.4)' : placeRisk.level === 'High' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
              }}
            >
              {placeRisk.level} Risk ({placeRisk.score} pts)
            </span>
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text-main)' }}>Evidence Points:</strong>
            <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px' }}>
              {(placeRisk.reasons || []).map((r, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>{r}</li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-card)', paddingTop: '10px' }}>
            <span>Coding Benchmark: <strong style={{ color: 'var(--text-main)' }}>{student.placement?.codingScore ?? 'N/A'}/100</strong></span>
            <span>Aptitude: <strong style={{ color: 'var(--text-main)' }}>{student.placement?.aptitudeScore ?? 'N/A'}/100</strong></span>
            <span>Mock Interview: <strong style={{ color: 'var(--text-main)' }}>{student.placement?.mockInterviewScore ?? 'N/A'}/100</strong></span>
            <span>Milestones: <strong style={{ color: 'var(--text-main)' }}>{student.placement?.milestonesCompleted ?? 0}/5</strong></span>
          </div>
        </div>
      </div>

      {/* Score Breakdown Transparency Table */}
      <div className="card" style={{ padding: '22px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-card)', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 14px 0', color: 'var(--text-main)' }}>
          Success Score Mathematical Breakdown
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
          Full visibility into raw indicators, normalization functions, institutional weights, and weighted point contributions.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 14px' }}>DIMENSION</th>
                <th style={{ padding: '10px 14px' }}>RAW VALUE</th>
                <th style={{ padding: '10px 14px' }}>NORMALIZED (0-100)</th>
                <th style={{ padding: '10px 14px' }}>INSTITUTIONAL WEIGHT</th>
                <th style={{ padding: '10px 14px' }}>CONTRIBUTION PTS</th>
                <th style={{ padding: '10px 14px' }}>COVERAGE STATUS</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(breakdown).map(([dim, data]) => (
                <tr key={dim} style={{ borderBottom: '1px solid #201515', color: 'var(--text-main)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, textTransform: 'capitalize' }}>{dim}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{data.value !== null ? data.value : '—'}</td>
                  <td style={{ padding: '12px 14px' }}>{data.normalized !== null ? `${data.normalized}%` : 'Missing'}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{Math.round(data.weight * 100)}%</td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: data.coverage ? 'var(--primary-hover)' : 'var(--text-dim)' }}>
                    +{data.contribution} pts
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: data.coverage ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: data.coverage ? '#34d399' : '#fbbf24', border: `1px solid ${data.coverage ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}` }}>
                      {data.coverage ? 'Recorded' : 'Provisional Scaled'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Academic Marks & Subjects History */}
      <div className="card" style={{ padding: '22px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-card)', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 14px 0', color: 'var(--text-main)' }}>
          Coursework & Subject-Level Performance
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {(student.academic?.subjectScores || []).map((sub, idx) => (
            <div
              key={idx}
              style={{
                padding: '14px',
                borderRadius: '10px',
                background: sub.hasBacklog ? 'rgba(139, 0, 0, 0.15)' : 'var(--bg-surface)',
                border: sub.hasBacklog ? '1px solid rgba(198, 40, 40, 0.4)' : '1px solid var(--border-card)',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                {sub.subject}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: sub.hasBacklog ? 'var(--primary-hover)' : '#34d399' }}>
                  {sub.score}%
                </span>
                <span style={{ fontSize: '11px', color: sub.hasBacklog ? '#fca5a5' : 'var(--text-muted)' }}>
                  {sub.hasBacklog ? 'Backlog / Uncleared' : 'Cleared'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Intelligence History */}
      <div className="card" style={{ padding: '22px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Action Intelligence & Support History
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Assigned interventions, mentor observations, and measured outcome deltas
            </p>
          </div>

          <Link
            to={`/campusiq/interventions?studentId=${student.studentId}&name=${encodeURIComponent(student.name)}`}
            className="btn btn-primary"
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            <PlusCircle size={14} /> New Action
          </Link>
        </div>

        {interventions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
            No interventions currently active for this student.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {interventions.map((inv) => (
              <div
                key={inv.interventionId}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-card)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--primary-hover)', fontWeight: 700, marginRight: '8px' }}>{inv.interventionId}</span>
                    <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>{inv.concernTitle}</strong>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: inv.status === 'Completed' ? 'rgba(16, 185, 129, 0.2)' : 'var(--primary-light)',
                      color: inv.status === 'Completed' ? '#34d399' : 'var(--primary-hover)',
                      border: `1px solid ${inv.status === 'Completed' ? 'rgba(16, 185, 129, 0.3)' : 'var(--primary-border)'}`,
                    }}
                  >
                    {inv.status}
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-main)' }}>Action:</strong> {inv.recommendedAction} ({inv.actionCategory})
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <span>Assigned: <strong style={{ color: 'var(--text-muted)' }}>{new Date(inv.dateAssigned).toLocaleDateString()}</strong></span>
                  <span>Mentor: <strong style={{ color: 'var(--text-muted)' }}>{inv.mentorAssigned}</strong></span>
                  {inv.observedChanges?.qualitativeSummary && (
                    <span style={{ color: '#34d399' }}>Measured: <strong>{inv.observedChanges.qualitativeSummary}</strong></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
