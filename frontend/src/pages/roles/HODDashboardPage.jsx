import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Users,
  AlertTriangle,
  Target,
  Filter,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { getStudents, getAtRiskStudents } from '../../services/campusiqApi';

const SUBJECT_PERFORMANCE = [
  { code: 'CS301', name: 'Data Structures & Algorithms', faculty: 'Dr. R. V. Raman', attendance: 84, passRate: 88, status: 'Healthy' },
  { code: 'CS302', name: 'Database Management Systems', faculty: 'Prof. Ananya Sen', attendance: 78, passRate: 82, status: 'Healthy' },
  { code: 'CS303', name: 'Operating Systems & Concurrency', faculty: 'Dr. K. Verma', attendance: 71, passRate: 74, status: 'Monitor' },
  { code: 'CS304', name: 'Discrete Mathematical Structures', faculty: 'Prof. T. Iyer', attendance: 64, passRate: 62, status: 'Remedial Required' },
];

export default function HODDashboardPage() {
  const [selectedDept, setSelectedDept] = useState('CSE');
  const [selectedSemester, setSelectedSemester] = useState('5');
  const [selectedSection, setSelectedSection] = useState('A');
  const [atRiskList, setAtRiskList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDeptAtRisk() {
      setLoading(true);
      try {
        const res = await getAtRiskStudents({ department: selectedDept });
        if (res.data?.queue) {
          setAtRiskList(res.data.queue.slice(0, 8));
        }
      } catch (err) {
        console.error('Error loading HOD at-risk students:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDeptAtRisk();
  }, [selectedDept]);

  return (
    <div className="page-container" style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', backgroundColor: 'var(--bg-primary)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--primary-hover)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              CampusIQ • Department Governance
            </span>
            <span style={{ color: 'var(--border-card)' }}>/</span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>HOD & Academic Coordination</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Department Academic Analytics
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Subject pass-rate trends, section performance, and localized remedial cohort intervention
          </p>
        </div>

        {/* Department & Semester Filter Controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>DEPT:</span>
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
              <option value="CSE" style={{ background: '#0D0D0D' }}>Computer Science (CSE)</option>
              <option value="IT" style={{ background: '#0D0D0D' }}>Information Tech (IT)</option>
              <option value="ECE" style={{ background: '#0D0D0D' }}>Electronics (ECE)</option>
              <option value="MECH" style={{ background: '#0D0D0D' }}>Mechanical (MECH)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>SEMESTER:</span>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
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
              <option value="1" style={{ background: '#0D0D0D' }}>Sem 1</option>
              <option value="3" style={{ background: '#0D0D0D' }}>Sem 3</option>
              <option value="5" style={{ background: '#0D0D0D' }}>Sem 5</option>
              <option value="7" style={{ background: '#0D0D0D' }}>Sem 7</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>SECTION:</span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
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
              <option value="A" style={{ background: '#0D0D0D' }}>Section A</option>
              <option value="B" style={{ background: '#0D0D0D' }}>Section B</option>
              <option value="C" style={{ background: '#0D0D0D' }}>Section C</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Department Enrolled</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>50 Students</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Semester {selectedSemester} • Section {selectedSection}</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Subject Average Attendance</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-emerald)' }}>76.8%</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Above 75% institutional cutoff</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Students Needing Remedial</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-hover)' }}>{atRiskList.length} Flagged</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Academic or attendance signals</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Faculty Mentorship Coverage</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-cyan)' }}>100%</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>All students assigned to mentors</div>
        </div>
      </div>

      {/* Main Grid: Subject Table & Department Risk Queue */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px', marginBottom: '28px' }}>
        {/* Left: Subject-wise Performance */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Semester {selectedSemester} Course Assessment & Attendance Trends
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Course-level diagnostics to pinpoint theoretical curriculum bottlenecks
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {SUBJECT_PERFORMANCE.map((sub) => (
              <div
                key={sub.code}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-hover)', background: 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px' }}>
                      {sub.code}
                    </span>
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {sub.name}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Faculty: {sub.faculty}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Attendance</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: sub.attendance >= 75 ? 'var(--text-main)' : 'var(--accent-amber)' }}>
                      {sub.attendance}%
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Pass Rate</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: sub.passRate >= 75 ? 'var(--accent-emerald)' : 'var(--primary-hover)' }}>
                      {sub.passRate}%
                    </div>
                  </div>

                  <span
                    className={`badge ${
                      sub.status === 'Healthy'
                        ? 'badge-success'
                        : sub.status === 'Monitor'
                        ? 'badge-warning'
                        : 'badge-danger'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Department Priority Review Queue */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {selectedDept} Priority Intervention Queue
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Students with attendance dips or pending midterms
              </p>
            </div>
            <Link to="/campusiq/early-warning" style={{ color: 'var(--primary-hover)', fontSize: '12px', fontWeight: 600 }}>
              Full Radar
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {atRiskList.map((stu) => (
              <div
                key={stu.studentId}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '13px' }}>
                    {stu.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                    {stu.studentId} • Att: {stu.indicators?.attendance}% • GPA: {stu.indicators?.gpa}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-danger">
                    {stu.academicRisk?.level} Risk
                  </span>
                  <Link
                    to={`/campusiq/students/${stu.studentId}`}
                    style={{
                      padding: '4px 8px',
                      background: 'var(--bg-card)',
                      borderRadius: '6px',
                      color: 'var(--text-muted)',
                      fontSize: '11px',
                    }}
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-card)' }}>
            <Link
              to="/campusiq/interventions"
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '12.5px', justifyContent: 'center' }}
            >
              <span>Assign Cohort Remedial Class</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
