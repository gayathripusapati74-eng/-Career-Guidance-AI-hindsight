import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Award,
  AlertTriangle,
  Briefcase,
  TrendingUp,
  Clock,
  Layers,
  Database,
  Sliders,
  ChevronRight,
  Filter,
  RefreshCw,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { getAnalyticsOverview } from '../../services/campusiqApi';

export default function CampusIQDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await getAnalyticsOverview({
        department: selectedDept,
        year: selectedYear,
      });
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Unable to load analytics. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedDept, selectedYear]);

  const summary = data?.summary || {};
  const distributions = data?.distributions || {};

  const rawSegments = distributions.segments;
  const segmentsList = Array.isArray(rawSegments)
    ? rawSegments
    : Object.entries(rawSegments || distributions.segmentCounts || {}).map(([segment, count]) => ({
        segment,
        count,
        percentage: summary.totalStudents ? Math.round((count / summary.totalStudents) * 100) : 0,
      }));
  const deptComparisons = distributions.departmentComparisons || [];

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px auto', borderTopColor: 'var(--primary-hover)' }}></div>
          <p style={{ color: 'var(--text-main)', fontSize: '15px', fontWeight: 600 }}>Loading Campus Overview Analytics...</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Synthesizing academic, attendance, and placement signals</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{ padding: '32px', maxWidth: '800px', margin: '60px auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '32px' }}>
          <AlertCircle size={40} color="var(--primary-hover)" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ color: 'var(--text-main)', fontSize: '20px', marginBottom: '8px' }}>Unable to Load Campus Overview</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginBottom: '20px' }}>{error}</p>
          <button onClick={fetchAnalytics} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={14} />
            <span>Retry Loading Analytics</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', backgroundColor: 'var(--bg-primary)' }}>
      {/* Top Banner / Breadcrumb */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', background: 'var(--primary-light)', color: 'var(--primary-hover)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CampusIQ Analytics
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>• Institutional Executive Radar</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Smart Campus Analytics & Student Success Platform
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px', margin: 0 }}>
            Predict • Explain • Intervene • Measure — Unifying academic, attendance, LMS, and placement readiness records.
          </p>
        </div>

        {/* Global Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-card)', padding: '8px 14px', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
          <Filter size={15} color="var(--text-dim)" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{ background: 'transparent', color: 'var(--text-main)', border: 'none', fontSize: '12.5px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="All" style={{ background: '#0D0D0D' }}>All Departments</option>
            <option value="Computer Science & Engineering" style={{ background: '#0D0D0D' }}>CSE</option>
            <option value="Information Technology" style={{ background: '#0D0D0D' }}>IT</option>
            <option value="Electronics & Communication Engineering" style={{ background: '#0D0D0D' }}>ECE</option>
            <option value="Mechanical Engineering" style={{ background: '#0D0D0D' }}>MECH</option>
          </select>

          <span style={{ color: 'var(--border-card)' }}>|</span>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ background: 'transparent', color: 'var(--text-main)', border: 'none', fontSize: '12.5px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="All" style={{ background: '#0D0D0D' }}>All Years</option>
            <option value="1" style={{ background: '#0D0D0D' }}>Year 1</option>
            <option value="2" style={{ background: '#0D0D0D' }}>Year 2</option>
            <option value="3" style={{ background: '#0D0D0D' }}>Year 3</option>
            <option value="4" style={{ background: '#0D0D0D' }}>Year 4</option>
          </select>

          <button
            onClick={fetchAnalytics}
            title="Refresh calculated metrics"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Quick Action Navigation Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <Link
          to="/campusiq/early-warning"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderLeft: '3px solid var(--primary-hover)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textDecoration: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} color="var(--primary-hover)" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Early Warning Radar</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{summary.criticalAlertsCount || 0} students flagged</div>
            </div>
          </div>
          <ChevronRight size={16} color="var(--text-dim)" />
        </Link>

        <Link
          to="/campusiq/interventions"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderLeft: '3px solid var(--accent-emerald)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textDecoration: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={18} color="var(--accent-emerald)" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Action Intelligence</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{summary.interventions?.inProgress || 0} in progress</div>
            </div>
          </div>
          <ChevronRight size={16} color="var(--text-dim)" />
        </Link>

        <Link
          to="/campusiq/simulator"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderLeft: '3px solid var(--primary-secondary)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textDecoration: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders size={18} color="#ff8a80" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>What-If Simulator</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Scenario modeling</div>
            </div>
          </div>
          <ChevronRight size={16} color="var(--text-dim)" />
        </Link>

        <Link
          to="/campusiq/data-hub"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderLeft: '3px solid var(--accent-cyan)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textDecoration: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={18} color="var(--accent-cyan)" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Data Ingestion Hub</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{summary.dataCompletenessRate || 100}% completeness</div>
            </div>
          </div>
          <ChevronRight size={16} color="var(--text-dim)" />
        </Link>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Total Students */}
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>
            <span>TOTAL COHORT</span>
            <Users size={16} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>
            {summary.totalStudents || 0}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Across 4 engineering disciplines
          </div>
        </div>

        {/* Avg Success Score */}
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>
            <span>AVG SUCCESS SCORE</span>
            <Award size={16} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: summary.averageSuccessScore >= 70 ? 'var(--accent-emerald)' : summary.averageSuccessScore >= 55 ? 'var(--accent-amber)' : 'var(--primary-hover)', marginTop: '8px' }}>
            {summary.averageSuccessScore || 0}<span style={{ fontSize: '16px', color: 'var(--text-dim)' }}>/100</span>
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Weighted institutional composite
          </div>
        </div>

        {/* Academic Risk */}
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>
            <span>ACADEMIC RISK CASES</span>
            <AlertCircle size={16} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '8px' }}>
            {summary.academicRiskCount || 0}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Attendance & GPA alert flags
          </div>
        </div>

        {/* Placement Risk */}
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>
            <span>PLACEMENT RISK</span>
            <Briefcase size={16} color="var(--primary-hover)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary-hover)', marginTop: '8px' }}>
            {summary.placementRiskCount || 0}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Coding & interview skill gaps
          </div>
        </div>

        {/* Avg Attendance */}
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>
            <span>AVG ATTENDANCE</span>
            <Clock size={16} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>
            {summary.averageAttendance || 0}%
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Cutoff standard: 75%
          </div>
        </div>
      </div>

      {/* Main Grid: Distributions & Department Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Score Distribution Breakdown */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Student Success Score Distribution
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-card)' }}>
              Formula Normalized
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(distributions.scoreBuckets || {}).map(([range, count]) => {
              const total = summary.totalStudents || 1;
              const pct = Math.round((count / total) * 100);
              let color = 'var(--accent-emerald)';
              if (range.includes('Critical')) color = 'var(--primary-hover)';
              else if (range.includes('Low')) color = 'var(--accent-amber)';
              else if (range.includes('Moderate')) color = 'var(--accent-cyan)';

              return (
                <div key={range}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>{range}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{count} students ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-card)' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '20px', padding: '12px', background: 'var(--bg-surface)', borderRadius: '10px', fontSize: '12px', color: 'var(--text-muted)', border: '1px solid var(--border-card)' }}>
            💡 <strong>Methodology Note:</strong> Success scores are weighted: 30% Academics, 20% Attendance, 20% Placement, 15% LMS, 10% Skills, 5% Extracurricular. Scores with missing data are dynamically rescaled to prevent penalizing unrecorded metrics.
          </div>
        </div>

        {/* 4-Quadrant Strategic Segmentation */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Dynamic 4-Quadrant Student Segmentation
            </h3>
            <Link to="/campusiq/segments" style={{ fontSize: '12px', color: 'var(--primary-hover)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <span>Matrix</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {segmentsList.map((seg) => {
              let borderColor = 'var(--border-card)';
              let tagColor = 'var(--text-muted)';
              if (seg.segment === 'High Performers') {
                borderColor = 'var(--accent-emerald)';
                tagColor = 'var(--accent-emerald)';
              } else if (seg.segment === 'Placement Focus') {
                borderColor = 'var(--accent-cyan)';
                tagColor = 'var(--accent-cyan)';
              } else if (seg.segment === 'Academic Support') {
                borderColor = 'var(--accent-amber)';
                tagColor = 'var(--accent-amber)';
              } else if (seg.segment === 'Intensive Support') {
                borderColor = 'var(--primary-hover)';
                tagColor = 'var(--primary-hover)';
              }

              return (
                <div
                  key={seg.segment}
                  style={{
                    background: 'var(--bg-surface)',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '12px',
                    padding: '14px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: tagColor, textTransform: 'uppercase' }}>
                    {seg.segment}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                    {seg.count}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                    {seg.percentage}% of campus
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <Link to="/campusiq/segments" className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
              <span>Explore Strategic Intervention Cohorts</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Department Comparisons Table */}
      {deptComparisons.length > 0 && (
        <div className="card" style={{ padding: '22px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Department Performance Benchmarks
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: '2px 0 0 0' }}>
                Comparative cross-departmental breakdown of success score, attendance, and at-risk students
              </p>
            </div>
            <Link to="/campusiq/students" style={{ fontSize: '12px', color: 'var(--primary-hover)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <span>View Directory</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-dim)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>DEPARTMENT</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>STUDENTS</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>AVG SUCCESS</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>AVG GPA</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>ATTENDANCE</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>CODING</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>AT-RISK</th>
                </tr>
              </thead>
              <tbody>
                {deptComparisons.map((dept) => (
                  <tr key={dept.department} style={{ borderBottom: '1px solid var(--border-card)' }}>
                    <td style={{ padding: '12px', color: 'var(--text-main)', fontWeight: 600 }}>{dept.department}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{dept.studentCount}</td>
                    <td style={{ padding: '12px', color: dept.avgSuccessScore >= 70 ? 'var(--accent-emerald)' : dept.avgSuccessScore >= 55 ? 'var(--accent-amber)' : 'var(--primary-hover)', fontWeight: 700 }}>
                      {dept.avgSuccessScore}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{dept.avgGpa || '—'}</td>
                    <td style={{ padding: '12px', color: dept.avgAttendance >= 75 ? 'var(--text-main)' : 'var(--primary-hover)' }}>
                      {dept.avgAttendance}%
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{dept.avgCoding || '—'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: dept.atRiskCount > 0 ? 'rgba(198, 40, 40, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: dept.atRiskCount > 0 ? 'var(--primary-hover)' : 'var(--accent-emerald)',
                      }}>
                        {dept.atRiskCount} Flagged
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
