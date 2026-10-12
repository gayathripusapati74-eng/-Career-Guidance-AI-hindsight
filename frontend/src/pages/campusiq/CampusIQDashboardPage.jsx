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

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Banner / Breadcrumb */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CampusIQ Analytics
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>• Prototype for KPMG in India Challenge</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Smart Campus Analytics & Student Success Platform
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px', margin: 0 }}>
            Predict • Explain • Intervene • Measure — Unifying academic, attendance, LMS, and placement readiness records.
          </p>
        </div>

        {/* Global Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(30, 41, 59, 0.6)', padding: '8px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Filter size={16} color="#94a3b8" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{ background: 'transparent', color: '#f8fafc', border: 'none', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="All" style={{ background: '#0f172a' }}>All Departments</option>
            <option value="Computer Science & Engineering" style={{ background: '#0f172a' }}>CSE</option>
            <option value="Information Technology" style={{ background: '#0f172a' }}>IT</option>
            <option value="Electronics & Communication Engineering" style={{ background: '#0f172a' }}>ECE</option>
            <option value="Mechanical Engineering" style={{ background: '#0f172a' }}>MECH</option>
          </select>

          <span style={{ color: '#475569' }}>|</span>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ background: 'transparent', color: '#f8fafc', border: 'none', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="All" style={{ background: '#0f172a' }}>All Years</option>
            <option value="1" style={{ background: '#0f172a' }}>Year 1</option>
            <option value="2" style={{ background: '#0f172a' }}>Year 2</option>
            <option value="3" style={{ background: '#0f172a' }}>Year 3</option>
            <option value="4" style={{ background: '#0f172a' }}>Year 4</option>
          </select>

          <button
            onClick={fetchAnalytics}
            title="Refresh calculated metrics"
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Quick Action Navigation Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <Link
          to="/campusiq/at-risk"
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.05) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textDecoration: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} color="#f87171" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fca5a5' }}>Early Warning Radar</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{summary.criticalAlertsCount || 0} students flagged</div>
            </div>
          </div>
          <ChevronRight size={16} color="#f87171" />
        </Link>

        <Link
          to="/campusiq/interventions"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.05) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textDecoration: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={20} color="#34d399" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#6ee7b7' }}>Action Intelligence</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{summary.interventions?.inProgress || 0} in progress</div>
            </div>
          </div>
          <ChevronRight size={16} color="#34d399" />
        </Link>

        <Link
          to="/campusiq/simulator"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0.05) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textDecoration: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders size={20} color="#818cf8" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#c7d2fe' }}>What-If Simulator</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Scenario modeling</div>
            </div>
          </div>
          <ChevronRight size={16} color="#818cf8" />
        </Link>

        <Link
          to="/campusiq/data-hub"
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(8, 145, 178, 0.05) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textDecoration: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={20} color="#22d3ee" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#a5f3fc' }}>Data Integration Hub</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{summary.dataCompletenessRate || 100}% completeness</div>
            </div>
          </div>
          <ChevronRight size={16} color="#22d3ee" />
        </Link>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Total Students */}
        <div className="card" style={{ padding: '18px', background: 'rgba(30, 41, 59, 0.7)', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>
            <span>TOTAL COHORT</span>
            <Users size={16} color="#818cf8" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', marginTop: '10px' }}>
            {summary.totalStudents || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Across 4 engineering disciplines
          </div>
        </div>

        {/* Avg Success Score */}
        <div className="card" style={{ padding: '18px', background: 'rgba(30, 41, 59, 0.7)', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>
            <span>AVG SUCCESS SCORE</span>
            <Award size={16} color="#34d399" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: summary.averageSuccessScore >= 70 ? '#34d399' : summary.averageSuccessScore >= 55 ? '#fbbf24' : '#f87171', marginTop: '10px' }}>
            {summary.averageSuccessScore || 0}<span style={{ fontSize: '16px', color: '#64748b' }}>/100</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Weighted institutional composite
          </div>
        </div>

        {/* Academic Risk */}
        <div className="card" style={{ padding: '18px', background: 'rgba(30, 41, 59, 0.7)', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>
            <span>ACADEMIC RISK CASES</span>
            <AlertCircle size={16} color="#fbbf24" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#fbbf24', marginTop: '10px' }}>
            {summary.academicRiskCount || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Attendance & GPA alert flags
          </div>
        </div>

        {/* Placement Risk */}
        <div className="card" style={{ padding: '18px', background: 'rgba(30, 41, 59, 0.7)', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>
            <span>PLACEMENT RISK</span>
            <Briefcase size={16} color="#f87171" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f87171', marginTop: '10px' }}>
            {summary.placementRiskCount || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Coding & interview skill gaps
          </div>
        </div>

        {/* Avg Attendance */}
        <div className="card" style={{ padding: '18px', background: 'rgba(30, 41, 59, 0.7)', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>
            <span>AVG ATTENDANCE</span>
            <Clock size={16} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', marginTop: '10px' }}>
            {summary.averageAttendance || 0}%
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Cutoff standard: 75%
          </div>
        </div>
      </div>

      {/* Main Grid: Distributions & Department Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Score Distribution Breakdown */}
        <div className="card" style={{ padding: '22px', background: 'rgba(30, 41, 59, 0.65)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              Student Success Score Distribution
            </h3>
            <span style={{ fontSize: '11px', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.06)', padding: '2px 8px', borderRadius: '4px' }}>
              Formula Normalized
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(distributions.scoreBuckets || {}).map(([range, count]) => {
              const total = summary.totalStudents || 1;
              const pct = Math.round((count / total) * 100);
              let color = '#34d399';
              if (range.includes('Critical')) color = '#f87171';
              else if (range.includes('Low')) color = '#fbbf24';
              else if (range.includes('Moderate')) color = '#38bdf8';

              return (
                <div key={range}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>
                    <span>{range}</span>
                    <span style={{ fontWeight: 700 }}>{count} students ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '10px', fontSize: '12px', color: '#94a3b8' }}>
            💡 <strong>Methodology Note:</strong> Success scores are weighted: 30% Academics, 20% Attendance, 20% Placement, 15% LMS, 10% Skills, 5% Extracurricular. Scores with missing data are dynamically rescaled to prevent penalizing unrecorded metrics.
          </div>
        </div>

        {/* Dynamic Segmentation Quadrants */}
        <div className="card" style={{ padding: '22px', background: 'rgba(30, 41, 59, 0.65)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              Student Segments (Academic × Placement)
            </h3>
            <Link to="/campusiq/segments" style={{ fontSize: '12px', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Deep Dive <ArrowUpRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* High Performers */}
            <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>High Performers</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#f8fafc', marginTop: '6px' }}>
                {distributions.segments?.['High Performers'] || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>High Academics • High Placement</div>
            </div>

            {/* Placement Focus */}
            <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>Placement Focus</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#f8fafc', marginTop: '6px' }}>
                {distributions.segments?.['Placement Focus'] || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>High Academics • Low Coding</div>
            </div>

            {/* Academic Support */}
            <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.25)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase' }}>Academic Support</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#f8fafc', marginTop: '6px' }}>
                {distributions.segments?.['Academic Support'] || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Low GPA • High Coding</div>
            </div>

            {/* Intensive Support */}
            <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#f43f5e', textTransform: 'uppercase' }}>Intensive Support</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#f8fafc', marginTop: '6px' }}>
                {distributions.segments?.['Intensive Support'] || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Low GPA • Low Placement</div>
            </div>
          </div>

          <div style={{ marginTop: '16px', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
            Allows proactive group interventions rather than blanket curriculum adjustments.
          </div>
        </div>
      </div>

      {/* Department Comparisons Table */}
      <div className="card" style={{ padding: '22px', background: 'rgba(30, 41, 59, 0.65)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              Department Benchmarking & Risk Prevalence
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '12px', margin: '2px 0 0 0' }}>
              Cross-disciplinary indicators derived from active dataset records
            </p>
          </div>
          <Link to="/campusiq/students" style={{ fontSize: '13px', color: '#818cf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            Open Full Student Directory <ChevronRight size={16} />
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                <th style={{ padding: '12px 14px' }}>DEPARTMENT</th>
                <th style={{ padding: '12px 14px' }}>COHORT SIZE</th>
                <th style={{ padding: '12px 14px' }}>AVG SUCCESS SCORE</th>
                <th style={{ padding: '12px 14px' }}>AVG GPA</th>
                <th style={{ padding: '12px 14px' }}>AVG ATTENDANCE</th>
                <th style={{ padding: '12px 14px' }}>AVG CODING</th>
                <th style={{ padding: '12px 14px' }}>AT-RISK RATIO</th>
              </tr>
            </thead>
            <tbody>
              {(distributions.departmentComparisons || []).map((d) => {
                const atRiskRatio = Math.round((d.atRiskCount / (d.studentCount || 1)) * 100);
                return (
                  <tr key={d.department} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: '#e2e8f0' }}>
                    <td style={{ padding: '14px', fontWeight: 600 }}>{d.department}</td>
                    <td style={{ padding: '14px', color: '#94a3b8' }}>{d.studentCount}</td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ fontWeight: 700, color: d.avgSuccessScore >= 70 ? '#34d399' : d.avgSuccessScore >= 60 ? '#fbbf24' : '#f87171' }}>
                        {d.avgSuccessScore}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>{d.avgGpa}/10</td>
                    <td style={{ padding: '14px' }}>{d.avgAttendance}%</td>
                    <td style={{ padding: '14px' }}>{d.avgCoding}/100</td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: atRiskRatio > 50 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: atRiskRatio > 50 ? '#fca5a5' : '#fde68a' }}>
                        {d.atRiskCount} ({atRiskRatio}%)
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
