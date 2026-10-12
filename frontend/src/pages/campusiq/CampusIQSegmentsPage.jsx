import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Users,
  Target,
  Award,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { getSegmentsOverview } from '../../services/campusiqApi';

const QUADRANT_META = {
  'High Performers': {
    badgeColor: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    tag: 'Quad I: Academic High • Placement High',
    description: 'Students excelling across both academic milestones and technical placement readiness benchmarks.',
    icon: Award,
  },
  'Placement Focus': {
    badgeColor: 'var(--primary-hover)',
    bgColor: 'rgba(139, 0, 0, 0.1)',
    borderColor: 'rgba(198, 40, 40, 0.35)',
    tag: 'Quad II: Academic High • Placement Support',
    description: 'Students maintaining strong academic grades but requiring practical coding and interview acceleration.',
    icon: Briefcase,
  },
  'Academic Support': {
    badgeColor: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    tag: 'Quad III: Academic Support • Placement High',
    description: 'Students showing high technical programming capability but vulnerable to attendance or theory backlogs.',
    icon: BookOpen,
  },
  'Intensive Support': {
    badgeColor: 'var(--primary-hover)',
    bgColor: 'rgba(139, 0, 0, 0.16)',
    borderColor: 'rgba(198, 40, 40, 0.45)',
    tag: 'Quad IV: Dual Vulnerability',
    description: 'Students facing simultaneous academic delinquency risk and severe placement readiness deficits.',
    icon: AlertTriangle,
  },
};

export default function CampusIQSegmentsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('All');
  const [activeSegment, setActiveSegment] = useState('High Performers');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSegments = async () => {
    setLoading(true);
    try {
      const res = await getSegmentsOverview({ department: selectedDept });
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching segments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, [selectedDept]);

  const segments = data?.segments || [];
  const currentSegmentData = segments.find((s) => s.segmentName === activeSegment) || segments[0];

  const filteredStudents = (currentSegmentData?.sampleStudents || []).filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q);
  });

  return (
    <div className="page-container" style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', background: 'var(--primary-light)', color: 'var(--primary-hover)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              CampusIQ • Cohort Intelligence
            </span>
            <span style={{ color: 'var(--border-card)' }}>/</span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Dynamic 4-Quadrant Segmentation</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Student Segmentation Matrix
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Multi-dimensional classification mapping student cohorts across Academic Stability and Placement Readiness
          </p>
        </div>

        {/* Department Filter & Refresh */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '8px 14px', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
            <Filter size={14} color="var(--text-muted)" />
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

          <button
            onClick={fetchSegments}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-card)',
              borderRadius: '10px',
              color: 'var(--text-main)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} style={{ color: 'var(--primary-hover)' }} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* 4-Quadrant Visual Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {segments.map((seg) => {
          const meta = QUADRANT_META[seg.segmentName] || QUADRANT_META['High Performers'];
          const Icon = meta.icon;
          const isSelected = activeSegment === seg.segmentName;

          return (
            <div
              key={seg.segmentName}
              onClick={() => setActiveSegment(seg.segmentName)}
              style={{
                background: isSelected ? meta.bgColor : 'var(--bg-card)',
                border: `2px solid ${isSelected ? meta.badgeColor : 'var(--border-card)'}`,
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isSelected ? `0 8px 24px -6px rgba(139, 0, 0, 0.4)` : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: `${meta.badgeColor}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: meta.badgeColor,
                  }}
                >
                  <Icon size={18} />
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: `${meta.badgeColor}20`,
                    color: meta.badgeColor,
                    letterSpacing: '0.04em',
                  }}
                >
                  {seg.percentage}% of Campus
                </span>
              </div>

              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                {seg.segmentName}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: meta.badgeColor, marginBottom: '12px' }}>
                {meta.tag}
              </div>

              {/* Metrics Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '8px',
                  background: 'var(--bg-surface)',
                  padding: '10px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-card)',
                  marginBottom: '14px',
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Cohort Size</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>{seg.studentCount}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Avg Score</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>{seg.averageSuccessScore}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Avg Coding</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>{seg.averageCoding}</div>
                </div>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                {meta.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Selected Quadrant Detailed Breakdown */}
      {currentSegmentData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '20px', marginBottom: '28px' }}>
          {/* Left: Strategy & Programs Card */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Target size={18} color="var(--primary-hover)" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Strategic Support Profile: {currentSegmentData.segmentName}
                </h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                {currentSegmentData.sharedNeeds}
              </p>
            </div>

            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                Recommended Institutional Programs
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(currentSegmentData.recommendedPrograms || []).map((prog, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      background: 'var(--bg-surface)',
                      borderRadius: '10px',
                      border: '1px solid var(--border-card)',
                    }}
                  >
                    <CheckCircle2 size={16} color="var(--primary-hover)" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{prog}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-card)' }}>
              <Link
                to="/campusiq/interventions"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-secondary))',
                  color: '#ffffff',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(139, 0, 0, 0.4)',
                }}
              >
                <span>Launch Cohort Intervention Plan</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Right: Cohort Members Directory */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Cohort Sample ({currentSegmentData.studentCount} Total Enrolled)
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Representative students mapped to this quadrant
                </div>
              </div>

              {/* Search */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
                <Search size={14} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Filter student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    fontSize: '12px',
                    outline: 'none',
                    width: '140px',
                  }}
                />
              </div>
            </div>

            {/* Students Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>STUDENT</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>DEPT & YR</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>SUCCESS SCORE</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>GPA</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>ATTENDANCE</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>CODING</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No students match the search filter.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => (
                      <tr
                        key={s.studentId}
                        style={{
                          borderBottom: '1px solid #201515',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{s.studentId}</div>
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                          {s.department} • Y{s.year}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span
                            style={{
                              fontWeight: 700,
                              color: s.successScore >= 75 ? '#10b981' : s.successScore >= 55 ? '#f59e0b' : 'var(--primary-hover)',
                            }}
                          >
                            {s.successScore} / 100
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{s.gpa || '—'}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{s.attendance ? `${s.attendance}%` : '—'}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{s.codingScore !== undefined ? s.codingScore : '—'}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          <Link
                            to={`/campusiq/students/${s.studentId}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border-card)',
                              borderRadius: '6px',
                              color: 'var(--text-main)',
                              fontSize: '11px',
                              fontWeight: 600,
                              textDecoration: 'none',
                            }}
                          >
                            <span>Profile</span>
                            <ChevronRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                Showing top 10 cohort members from benchmark database
              </span>
              <Link
                to={`/campusiq/students?segment=${encodeURIComponent(currentSegmentData.segmentName)}`}
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--primary-hover)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>View all in directory</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Strategic Explanation Callout */}
      <div
        style={{
          background: 'rgba(139, 0, 0, 0.08)',
          border: '1px solid var(--border-card)',
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-hover)',
            flexShrink: 0,
          }}
        >
          <Sparkles size={20} />
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>
            Why 4-Quadrant Segmentation Matters for Campus Leadership
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Traditional institutions treat academic struggle and placement readiness as isolated problems. CampusIQ unites both axes into a single decision-support matrix, allowing deans to allocate placement bootcamps to Quadrant II and theory tutorial hours to Quadrant III without wasting faculty resources.
          </div>
        </div>
      </div>
    </div>
  );
}
