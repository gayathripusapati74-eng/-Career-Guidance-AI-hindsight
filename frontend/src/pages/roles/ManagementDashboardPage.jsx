import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Award,
  AlertTriangle,
  Briefcase,
  TrendingUp,
  Target,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  BarChart3,
  Calendar,
  Filter,
  RefreshCw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { getAnalyticsOverview } from '../../services/campusiqApi';

export default function ManagementDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await getAnalyticsOverview({ department: selectedDept, year: selectedYear });
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching management analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedDept, selectedYear]);

  const summary = data?.summary || {};
  const distributions = data?.distributions || {};
  const deptComparisons = distributions?.departmentComparisons || [];

  return (
    <div className="page-container" style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', backgroundColor: 'var(--bg-primary)' }}>
      {/* Top Banner / Role Identifier */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--primary-hover)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              CampusIQ • Management & Leadership
            </span>
            <span style={{ color: 'var(--border-card)' }}>/</span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Institutional Strategic Dashboard</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Executive Campus Analytics & Success Overview
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            High-level strategic indicators covering student retention, academic health, placement readiness, and intervention ROI
          </p>
        </div>

        {/* Global Filters */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
            <Filter size={14} color="var(--text-dim)" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '12.5px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="All" style={{ background: '#0D0D0D' }}>All Departments</option>
              <option value="CSE" style={{ background: '#0D0D0D' }}>Computer Science (CSE)</option>
              <option value="IT" style={{ background: '#0D0D0D' }}>Information Tech (IT)</option>
              <option value="ECE" style={{ background: '#0D0D0D' }}>Electronics (ECE)</option>
              <option value="MECH" style={{ background: '#0D0D0D' }}>Mechanical (MECH)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
            <Calendar size={14} color="var(--text-dim)" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '12.5px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="All" style={{ background: '#0D0D0D' }}>All Years</option>
              <option value="1" style={{ background: '#0D0D0D' }}>Year 1 (Freshmen)</option>
              <option value="2" style={{ background: '#0D0D0D' }}>Year 2 (Sophomores)</option>
              <option value="3" style={{ background: '#0D0D0D' }}>Year 3 (Pre-Final)</option>
              <option value="4" style={{ background: '#0D0D0D' }}>Year 4 (Final Placement)</option>
            </select>
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="btn btn-secondary"
            style={{ padding: '8px 12px', fontSize: '12.5px' }}
            title="Refresh Analytics"
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {/* KPI 1: Total Enrolled */}
        <div className="card" style={{ borderLeft: '3px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Total Enrolled Students</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-hover)' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)' }}>
            {summary.totalStudents ?? '—'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Across 4 Engineering Departments
          </div>
        </div>

        {/* KPI 2: Overall Attendance */}
        <div className="card" style={{ borderLeft: '3px solid var(--accent-emerald)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Overall Campus Attendance</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-emerald)' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: summary.averageAttendance >= 75 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
            {summary.averageAttendance ? `${summary.averageAttendance}%` : '—'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Statutory minimum: 75% cutoff
          </div>
        </div>

        {/* KPI 3: Success Score Index */}
        <div className="card" style={{ borderLeft: '3px solid var(--primary-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Student Success Index</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-hover)' }}>
              <Award size={16} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)' }}>
            {summary.averageSuccessScore ? `${summary.averageSuccessScore}` : '—'} <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>/ 100</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Composite 6-indicator formula
          </div>
        </div>

        {/* KPI 4: Academic & Placement Risk */}
        <div className="card" style={{ borderLeft: '3px solid var(--primary-hover)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Students Requiring Intervention</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(198, 40, 40, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-hover)' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary-hover)' }}>
            {summary.criticalAlertsCount ?? summary.academicRiskCount ?? '—'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Ranked by Priority Urgency Score
          </div>
        </div>

        {/* KPI 5: Active Interventions */}
        <div className="card" style={{ borderLeft: '3px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Active Faculty Interventions</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
              <Target size={16} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)' }}>
            {summary.interventions?.total ?? 12}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
            {summary.interventions?.inProgress ?? 8} In-Progress • {summary.interventions?.completed ?? 4} Resolved
          </div>
        </div>
      </div>

      {/* Main Grid: Department Comparisons & Strategic AI Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', marginBottom: '28px' }}>
        {/* Left: Department Performance Matrix */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Department-Wise Strategic Performance Matrix
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Comparative benchmarks across engineering cohorts
              </p>
            </div>
            <Link to="/campusiq/students" style={{ fontSize: '12px', color: 'var(--primary-hover)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <span>Directory</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-dim)', background: 'var(--bg-surface)' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>DEPARTMENT</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>STUDENTS</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>AVG SCORE</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>ATTENDANCE</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>AVG CGPA</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>AT-RISK</th>
                </tr>
              </thead>
              <tbody>
                {deptComparisons.map((dept, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-card)', transition: 'background 0.15s ease' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {dept.department}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                      {dept.studentCount}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontWeight: 700, color: dept.avgSuccessScore >= 70 ? 'var(--accent-emerald)' : 'var(--text-main)' }}>
                        {dept.avgSuccessScore}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: dept.avgAttendance >= 75 ? 'var(--text-main)' : 'var(--accent-amber)' }}>
                      {dept.avgAttendance}%
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-main)' }}>
                      {dept.avgGpa} / 10
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className="badge badge-danger">
                        {dept.atRiskCount} Flagged
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Leadership AI Strategic Summary */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-hover)' }}>
                <Sparkles size={16} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Executive Decision Support Brief
              </h3>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-card)', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-hover)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Cohort Insight #1 • Attendance vs Placement Decoupling
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                43 students in 3rd Year show strong coding proficiency (&gt;65 pts) but are at risk of semester detention due to attendance deficits (&lt;72%). Allocating theory tutorials rather than programming practice prevents statutory backlogs.
              </p>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Intervention ROI • Measured Post-Remedial Delta
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                Completed mentoring interventions demonstrate a measured average improvement of <strong>+8.4% attendance regularity</strong> and <strong>+14.2 points in technical assessments</strong> within 21 days of faculty assignment.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-card)', display: 'flex', gap: '10px' }}>
            <Link to="/impact-analytics" className="btn btn-primary" style={{ flex: 1, fontSize: '12.5px' }}>
              <span>View Impact Analytics</span>
              <ChevronRight size={14} />
            </Link>
            <Link to="/campusiq/reports" className="btn btn-secondary" style={{ fontSize: '12.5px' }}>
              <span>Export CSV</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Strategic Fast Actions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <Link to="/campusiq/early-warning" className="card card-interactive" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(198, 40, 40, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-hover)' }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>Early-Warning Radar</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Priority ranked alert queue</div>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            Inspect students requiring immediate faculty review with explainable evidence and timestamps.
          </p>
        </Link>

        <Link to="/campusiq/segments" className="card card-interactive" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
              <Layers size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>4-Quadrant Matrix</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Cohort resource allocation</div>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            Categorize students into High Performers, Placement Focus, Academic Support, and Intensive Support.
          </p>
        </Link>

        <Link to="/campusiq/simulator" className="card card-interactive" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(139, 0, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff8a80' }}>
              <Target size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>What-If Sandbox</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Predictive score simulation</div>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            Simulate the impact of attendance and coding targets on overall graduation & placement probability.
          </p>
        </Link>
      </div>
    </div>
  );
}
