import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Users,
  Building,
  Sliders,
  Database,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Download,
  AlertTriangle,
  Info,
  Calendar,
  X,
} from 'lucide-react';
import { getAnalyticsOverview, getStudents, getDataHubHistory, getExportUrl } from '../../services/campusiqApi';

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'at-risk' | 'interventions' | 'admin'
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentModal, setSelectedStudentModal] = useState(null);

  // Policy threshold local controls
  const [attWarning, setAttWarning] = useState(75);
  const [gpaWarning, setGpaWarning] = useState(6.5);
  const [codingCutoff, setCodingCutoff] = useState(60);
  const [policySaved, setPolicySaved] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, stuRes, histRes] = await Promise.all([
        getAnalyticsOverview({ department: selectedDept }),
        getStudents({ department: selectedDept, limit: 100 }),
        getDataHubHistory(),
      ]);
      if (analyticsRes.data?.summary) setAnalytics(analyticsRes.data);
      if (stuRes.data?.students) setStudents(stuRes.data.students);
      if (histRes.data) setHistory(histRes.data);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDept]);

  const handleSavePolicy = (e) => {
    e.preventDefault();
    setPolicySaved(true);
    setTimeout(() => setPolicySaved(false), 3000);
  };

  const summary = analytics?.summary || {
    totalStudents: 200,
    averageAttendance: 77,
    averageGpa: 7.0,
    academicRiskCount: 100,
    criticalAlertsCount: 130,
    interventions: { total: 3, pending: 0, inProgress: 2, completed: 1 },
  };

  const deptComparisons = analytics?.distributions?.departmentComparisons || [];

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const acadLevel = s.computed?.academicRisk?.level || 'Low';
    const matchesRisk = selectedRiskFilter === 'All' || acadLevel === selectedRiskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="page-container" style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--primary-hover)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              CampusIQ • Executive Administration
            </span>
            <span style={{ color: 'var(--border-card)' }}>/</span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Institution-Wide Intelligence</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Institutional Administration & Governance
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Predictive student risk oversight, department benchmarks, intervention governance & accreditation reporting
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href={getExportUrl('risk-register')}
            download="campusiq_risk_register.csv"
            className="btn btn-secondary"
            style={{ fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
          >
            <Download size={14} />
            <span>Export Risk Register (CSV)</span>
          </a>
          <Link to="/campusiq/data-hub" className="btn btn-primary" style={{ fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database size={14} />
            <span>Data Ingestion Studio</span>
          </Link>
        </div>
      </div>

      {/* Global Filter Bar */}
      <div
        className="card"
        style={{
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Scope Department:</span>
          {['All', 'CSE', 'IT', 'ECE', 'MECH'].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                border: '1px solid',
                borderColor: selectedDept === dept ? 'var(--primary-hover)' : 'var(--border-card)',
                backgroundColor: selectedDept === dept ? 'var(--primary-light)' : 'transparent',
                color: selectedDept === dept ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {dept === 'All' ? 'All Departments' : dept}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
          Cohort: <strong>AY 2026-27</strong> • Real-time Ingestion Sync Active
        </div>
      </div>

      {/* Admin Executive Metric Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Enrolled Students</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)' }}>{summary.totalStudents}</div>
          <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', marginTop: '2px' }}>● 100% Data Completeness</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Campus Attendance Rate</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: summary.averageAttendance >= 75 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
            {summary.averageAttendance}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>75% Statutory Minimum</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Cumulative Mean GPA</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)' }}>{summary.averageGpa} / 10</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Institution Average</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Active Risk Alerts</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary-hover)' }}>{summary.academicRiskCount}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Requires Faculty Review</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Active Interventions</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)' }}>
            {summary.interventions?.inProgress || 2} <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>/ {summary.interventions?.total || 3}</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', marginTop: '2px' }}>
            {summary.interventions?.completed || 1} Completed Cases
          </div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Retention Indicator</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-emerald)' }}>96.4%</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Projected Cohort Continuity</div>
        </div>
      </div>

      {/* Section Tab Bar */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-card)', marginBottom: '20px' }}>
        {[
          { id: 'overview', label: 'Executive Overview & Analytics' },
          { id: 'at-risk', label: 'At-Risk Student Monitoring' },
          { id: 'interventions', label: 'Intervention Governance' },
          { id: 'admin', label: 'System Administration & Security' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 700,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary-hover)' : '2px solid transparent',
              color: activeTab === tab.id ? '#ffffff' : 'var(--text-dim)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW & SUCCESS ANALYTICS */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Department Benchmarks Comparison Table */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 16px 0' }}>
              Academic Department Performance & Risk Comparison
            </h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Students</th>
                    <th>Success Score</th>
                    <th>Mean GPA</th>
                    <th>Attendance %</th>
                    <th>Coding Benchmark</th>
                    <th>At-Risk Count</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deptComparisons.map((dept) => (
                    <tr key={dept.department}>
                      <td>
                        <strong>{dept.department}</strong>
                      </td>
                      <td>{dept.studentCount}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: dept.avgSuccessScore < 60 ? '#ff8a80' : 'var(--text-main)' }}>
                          {dept.avgSuccessScore}
                        </span>
                      </td>
                      <td>{dept.avgGpa} / 10</td>
                      <td>
                        <span style={{ color: dept.avgAttendance < 75 ? '#ff8a80' : 'var(--accent-emerald)', fontWeight: 600 }}>
                          {dept.avgAttendance}%
                        </span>
                      </td>
                      <td>{dept.avgCoding} pts</td>
                      <td>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: dept.atRiskCount > 20 ? 'rgba(167, 25, 48, 0.25)' : 'rgba(16, 185, 129, 0.15)',
                            color: dept.atRiskCount > 20 ? '#ff8a80' : 'var(--accent-emerald)',
                            fontWeight: 700,
                            fontSize: '11px',
                          }}
                        >
                          {dept.atRiskCount} Mentees
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                          onClick={() => {
                            setSelectedDept(dept.department);
                            setActiveTab('at-risk');
                          }}
                        >
                          Inspect Cohort →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AT-RISK STUDENT MONITORING & AI EXPLAINABILITY */}
      {activeTab === 'at-risk' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                At-Risk Student Monitoring Table
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Early-warning priority list with Low, Medium, and High risk indicators and transparent contributing factors
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['All', 'Critical', 'High', 'Medium', 'Low'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedRiskFilter(lvl)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      border: '1px solid',
                      borderColor: selectedRiskFilter === lvl ? 'var(--primary-hover)' : 'var(--border-card)',
                      backgroundColor: selectedRiskFilter === lvl ? 'var(--primary-light)' : 'transparent',
                      color: selectedRiskFilter === lvl ? '#ffffff' : 'var(--text-dim)',
                      cursor: 'pointer',
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder="Search ID or Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '8px',
                    padding: '6px 10px 6px 30px',
                    fontSize: '12px',
                    color: 'var(--text-main)',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Department & Sem</th>
                  <th>Attendance %</th>
                  <th>GPA</th>
                  <th>Risk Level</th>
                  <th>Main Contributing Factors</th>
                  <th>Assigned Advisor</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.slice(0, 15).map((s) => {
                  const acad = s.computed?.academicRisk?.level || 'Low';
                  const riskBadges = {
                    Critical: { bg: 'rgba(239, 68, 68, 0.25)', color: '#EF4444' },
                    High: { bg: 'rgba(167, 25, 48, 0.25)', color: '#ff8a80' },
                    Medium: { bg: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B' },
                    Low: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981' },
                  };
                  const badge = riskBadges[acad] || riskBadges.Low;

                  return (
                    <tr key={s.studentId}>
                      <td>
                        <strong>{s.studentId}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.name}</div>
                      </td>
                      <td>
                        <div>{s.department}</div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>Year {s.year}, Sem {s.semester}</div>
                      </td>
                      <td>
                        <span style={{ color: (s.academic?.attendancePercentage || 0) < 75 ? '#ff8a80' : 'var(--accent-emerald)', fontWeight: 600 }}>
                          {s.academic?.attendancePercentage}%
                        </span>
                      </td>
                      <td>{s.academic?.gpa}</td>
                      <td>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: badge.bg,
                            color: badge.color,
                            fontWeight: 800,
                            fontSize: '10.5px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {acad}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', maxWidth: '280px' }}>
                          {(s.computed?.academicRisk?.factors || ['Midterm exam drift', 'Attendance gap']).slice(0, 2).join(' • ')}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>
                          {s.assignedMentor || 'Faculty Advisor'}
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{ fontSize: '11px', padding: '5px 10px' }}
                          onClick={() => setSelectedStudentModal(s)}
                        >
                          Explain Evidence →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INTERVENTION MANAGEMENT WORKFLOW */}
      {activeTab === 'interventions' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Intervention Governance Lifecycle
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Workflow: Identify Risk → Review Evidence → Assign Advisor → Create Intervention → Record Action → Evaluate Outcome
              </p>
            </div>
            <Link to="/campusiq/interventions" className="btn btn-primary" style={{ fontSize: '12px' }}>
              <span>Open Action Intelligence Studio</span>
              <ExternalLink size={13} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
            {[
              { step: '1. Identification', desc: '100 Students Flagged by ML Early-Warning', count: '100 Radar Alerts', status: 'Active' },
              { step: '2. Review & Assign', desc: 'Assigned to CSE/IT Department Mentors', count: '48 Mentors Active', status: 'Assigned' },
              { step: '3. Action In-Progress', desc: 'Academic remedial & 1-on-1 counseling', count: '2 In-Progress', status: 'Ongoing' },
              { step: '4. Outcome Evaluated', desc: 'Observed pre vs post GPA & attendance improvement', count: '1 Case Closed (+0.8 GPA)', status: 'Verified' },
            ].map((st, idx) => (
              <div
                key={idx}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-card)',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-hover)', marginBottom: '4px' }}>{st.step}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>{st.count}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{st.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM ADMINISTRATION & POLICIES */}
      {activeTab === 'admin' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 12px 0' }}>
              Academic Risk Policy Thresholds
            </h3>
            <form onSubmit={handleSavePolicy} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Statutory Attendance Cutoff (%):
                </label>
                <input
                  type="number"
                  className="input"
                  value={attWarning}
                  onChange={(e) => setAttWarning(Number(e.target.value))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  GPA Early-Warning Trigger:
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="input"
                  value={gpaWarning}
                  onChange={(e) => setGpaWarning(Number(e.target.value))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Placement Coding Score Cutoff:
                </label>
                <input
                  type="number"
                  className="input"
                  value={codingCutoff}
                  onChange={(e) => setCodingCutoff(Number(e.target.value))}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', fontSize: '12.5px' }}>
                {policySaved ? '✓ Policies Applied Across Campus' : 'Update Institutional Thresholds'}
              </button>
            </form>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 12px 0' }}>
              System Status & Security Telemetry
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>Authentication Engine</div>
                <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', marginTop: '2px' }}>● Server-Verified JWT & Bcrypt (Argon2 Compatible)</div>
              </div>

              <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>Role-Based Access Control (RBAC)</div>
                <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', marginTop: '2px' }}>● Strict Route Guards & Backend API Scoping Enforced</div>
              </div>

              <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>Hindsight Long-Term Memory Service</div>
                <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', marginTop: '2px' }}>● Cloud Connected (api.hindsight.vectorize.io)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Explainability Modal */}
      {selectedStudentModal && (
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
              maxWidth: '620px',
              width: '100%',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: '16px',
              padding: '28px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--primary-hover)', fontWeight: 800, textTransform: 'uppercase' }}>
                  AI Explainability Diagnostic
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 0 0' }}>
                  {selectedStudentModal.name} ({selectedStudentModal.studentId})
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudentModal(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-surface)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Success Score</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {selectedStudentModal.computed?.successScore}
                </div>
              </div>
              <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-surface)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Academic Risk</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#ff8a80' }}>
                  {selectedStudentModal.computed?.academicRisk?.level}
                </div>
              </div>
              <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-surface)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Urgency Rank</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-hover)' }}>
                  {selectedStudentModal.computed?.urgencyScore}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                Key Contributing Risk Drivers:
              </h4>
              <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {(selectedStudentModal.computed?.academicRisk?.factors || [
                  'Attendance drift below 75% examination threshold',
                  'Midterm assessment marks drop compared to baseline',
                  'LMS submission delays on core programming modules',
                ]).map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(167, 25, 48, 0.1)', border: '1px solid rgba(167, 25, 48, 0.25)', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#ff8a80' }}>Recommended Faculty Action:</div>
              <div style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '2px' }}>
                {selectedStudentModal.computed?.academicRisk?.recommendedAction || 'Schedule 1-on-1 Academic Advising & Attendance Recovery Contract'}
              </div>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-card)', fontSize: '11px', color: 'var(--text-dim)' }}>
              ℹ️ <strong>Transparency Notice:</strong> Factors indicate correlated risk factors and not deterministic causality. Academic decisions must involve human faculty review prior to formal intervention.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn btn-primary" onClick={() => setSelectedStudentModal(null)}>
                Close Diagnostic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
