import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  Shield,
  Search,
  Filter,
  UserCheck,
} from 'lucide-react';
import { getFacultyDashboard, createIntervention } from '../../services/campusiqApi';
import SkeletonPage from '../../components/SkeletonLoader';

export default function FacultyDashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Intervention modal form
  const [concernTitle, setConcernTitle] = useState('');
  const [actionCategory, setActionCategory] = useState('Academic Remedial');
  const [recommendedAction, setRecommendedAction] = useState('');
  const [priority, setPriority] = useState('High');
  const [submitting, setSubmitting] = useState(false);

  const loadFacultyData = async () => {
    setLoading(true);
    try {
      const res = await getFacultyDashboard();
      if (res.data?.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Failed to load faculty dashboard:', err);
      setError('Unable to load faculty cohort data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacultyData();
  }, []);

  const handleOpenInterventionModal = (student) => {
    setSelectedStudent(student);
    setConcernTitle(`Academic Support Plan for ${student.name}`);
    setRecommendedAction(student.recommendedIntervention || `Schedule 2x weekly 1-on-1 tutoring sessions to recover attendance and review key semester topics.`);
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
        mentorAssigned: dashboardData?.facultyProfile?.assignedMentorTitle || 'Dr. S. Sharma (Prof. CSE)',
      });

      if (res.data?.success) {
        setShowModal(false);
        // Refresh faculty dashboard
        await loadFacultyData();
      }
    } catch (err) {
      console.error('Error creating faculty intervention:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <SkeletonPage title="Loading Faculty Caseload & Mentee Alerts..." />;
  }

  const profile = dashboardData?.facultyProfile || {};
  const summary = dashboardData?.cohortSummary || {};
  const urgentMentees = dashboardData?.urgentMentees || [];
  const assignedMentees = dashboardData?.assignedMentees || [];
  const activeInterventions = dashboardData?.activeInterventions || [];

  const filteredMentees = assignedMentees.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{profile.department}</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Faculty Mentorship & Advising Center
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Advisor: <strong>{profile.name}</strong> • Caseload: {summary.totalMentees} Assigned Mentees • Restricted to authorized department
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/campusiq/early-warning" className="btn btn-secondary" style={{ fontSize: '12.5px' }}>
            <AlertTriangle size={14} style={{ color: 'var(--primary-hover)' }} />
            <span>Early Warning Radar</span>
          </Link>
          <Link to="/campusiq/interventions" className="btn btn-primary" style={{ fontSize: '12.5px' }}>
            <Target size={14} />
            <span>All Interventions ({summary.activeInterventionsCount})</span>
          </Link>
        </div>
      </div>

      {/* Faculty Caseload Metric Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Assigned Cohort Mentees</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)' }}>{summary.totalMentees}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>{profile.department}</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Attention Needed</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary-hover)' }}>{summary.criticalAlertCount}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Urgency score ≥ 50 or Critical risk</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Cohort Average GPA</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)' }}>{summary.avgGpa} / 10</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Across all semesters</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Cohort Average Attendance</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: summary.avgAttendance >= 75 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
            {summary.avgAttendance}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>75% Institutional Threshold</div>
        </div>
      </div>

      {/* Priority 1: Mentees Requiring Immediate Attention */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} style={{ color: 'var(--primary-hover)' }} />
              <span>Priority Mentee Attention Queue</span>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              AI early-warning radar ranked by multi-factorial urgency score with transparent evidence
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Sem</th>
                <th>Success Score</th>
                <th>Attendance</th>
                <th>GPA</th>
                <th>Urgency</th>
                <th>Primary Contributing Factors</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {urgentMentees.map((s) => (
                <tr key={s.studentId}>
                  <td>
                    <div>
                      <Link to={`/campusiq/students/${s.studentId}`} style={{ fontWeight: 700, color: 'var(--text-main)', textDecoration: 'none' }}>
                        {s.name}
                      </Link>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{s.studentId}</div>
                    </div>
                  </td>
                  <td>Sem {s.semester}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: s.successScore < 60 ? '#ff8a80' : 'var(--text-main)' }}>
                      {s.successScore}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: s.attendance < 75 ? '#ff8a80' : 'var(--accent-emerald)', fontWeight: 600 }}>
                      {s.attendance}%
                    </span>
                  </td>
                  <td>{s.gpa}</td>
                  <td>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: 'rgba(167, 25, 48, 0.25)',
                        color: '#ff8a80',
                        fontWeight: 800,
                        fontSize: '11px',
                      }}
                    >
                      {s.urgencyScore}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', maxWidth: '300px' }}>
                      {s.primaryFactors.slice(0, 2).join(' • ')}
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: '11.5px', padding: '5px 10px' }}
                      onClick={() => handleOpenInterventionModal(s)}
                    >
                      <Plus size={13} />
                      <span>Record Intervention</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: All Assigned Mentees Directory & Active Interventions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        {/* Left: Searchable Assigned Mentees */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Assigned Cohort Students ({assignedMentees.length})
            </h3>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                className="input"
                placeholder="Search mentee name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px', fontSize: '12px', padding: '6px 10px 6px 32px' }}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Attendance</th>
                  <th>GPA</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMentees.slice(0, 8).map((s) => (
                  <tr key={s.studentId}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '11.5px', color: 'var(--text-dim)' }}>
                        {s.studentId}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.name}</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>Sem {s.semester}</div>
                    </td>
                    <td>{s.academic?.attendancePercentage}%</td>
                    <td>{s.academic?.gpa}</td>
                    <td>
                      <Link
                        to={`/campusiq/students/${s.studentId}`}
                        style={{ fontSize: '11.5px', color: 'var(--primary-hover)', fontWeight: 600, textDecoration: 'none' }}
                      >
                        View Profile →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Active Interventions Managed by this Faculty */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={17} style={{ color: 'var(--primary-hover)' }} />
            <span>Active Interventions ({activeInterventions.length})</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeInterventions.slice(0, 5).map((inv) => (
              <div
                key={inv.interventionId}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-card)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-main)' }}>{inv.studentName}</div>
                  <span
                    style={{
                      fontSize: '9.5px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: '#F59E0B',
                      fontWeight: 700,
                    }}
                  >
                    {inv.status}
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{inv.concernTitle}</div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Category: <strong>{inv.actionCategory}</strong> • Due: {new Date(inv.dueDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Record Intervention Modal */}
      {showModal && selectedStudent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '560px',
              width: '100%',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: '16px',
              padding: '28px',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
              Record Faculty Intervention
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 18px 0' }}>
              Assigning support action for <strong>{selectedStudent.name}</strong> ({selectedStudent.studentId})
            </p>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Concern Title
                </label>
                <input
                  type="text"
                  className="input"
                  value={concernTitle}
                  onChange={(e) => setConcernTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Category
                  </label>
                  <select
                    className="select"
                    value={actionCategory}
                    onChange={(e) => setActionCategory(e.target.value)}
                  >
                    <option value="Academic Remedial">Academic Remedial</option>
                    <option value="Attendance Recovery">Attendance Recovery</option>
                    <option value="Peer Mentorship">Peer Mentorship</option>
                    <option value="Counseling & Wellness">Counseling & Wellness</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Priority
                  </label>
                  <select
                    className="select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Recommended Action Plan
                </label>
                <textarea
                  className="textarea"
                  rows={3}
                  value={recommendedAction}
                  onChange={(e) => setRecommendedAction(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Recording Action...' : 'Save & Assign Intervention'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
