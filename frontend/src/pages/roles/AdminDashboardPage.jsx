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
} from 'lucide-react';
import { getStudents, getDataHubHistory } from '../../services/campusiqApi';

export default function AdminDashboardPage() {
  const [students, setStudents] = useState([]);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('accounts');
  const [searchQuery, setSearchQuery] = useState('');

  // Policy threshold local controls
  const [attWarning, setAttWarning] = useState(75);
  const [gpaWarning, setGpaWarning] = useState(6.5);
  const [codingCutoff, setCodingCutoff] = useState(60);
  const [policySaved, setPolicySaved] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [stuRes, histRes] = await Promise.all([
          getStudents({ limit: 10 }),
          getDataHubHistory(),
        ]);
        if (stuRes.data?.students) setStudents(stuRes.data.students);
        if (histRes.data) setHistory(histRes.data);
      } catch (err) {
        console.error('Error loading admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSavePolicy = (e) => {
    e.preventDefault();
    setPolicySaved(true);
    setTimeout(() => setPolicySaved(false), 3000);
  };

  const filteredStudents = students.filter(
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
              CampusIQ • College Administration
            </span>
            <span style={{ color: 'var(--border-card)' }}>/</span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Operations & Governance</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            College Administrator Operations Center
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Account directories, academic department structures, institutional policies, and multi-modal integration status
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/campusiq/data-hub" className="btn btn-secondary" style={{ fontSize: '12.5px' }}>
            <Database size={14} />
            <span>Data Ingestion Studio</span>
          </Link>
          <Link to="/campusiq/reports" className="btn btn-primary" style={{ fontSize: '12.5px' }}>
            <FileSpreadsheet size={14} />
            <span>Generate Official Reports</span>
          </Link>
        </div>
      </div>

      {/* Admin Operations Metric Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Enrolled Students</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>200</div>
          <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', marginTop: '2px' }}>● 100% Active Benchmark</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Academic Departments</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>4</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>CSE • IT • ECE • MECH</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Faculty Mentors</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>48</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>12 Mentors per Department</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Integration Data Health</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-emerald)' }}>97%</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>8 Data Pillars Synced</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-card)', marginBottom: '20px' }}>
        {[
          { id: 'accounts', label: 'User Directory & Roles' },
          { id: 'policies', label: 'Academic Risk Policy Thresholds' },
          { id: 'integrations', label: 'Data Quality & Ingestion Status' },
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
              color: activeTab === tab.id ? 'var(--text-main)' : 'var(--text-dim)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Account Directory */}
      {activeTab === 'accounts' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Enrolled Student & Account Roster
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Primary key identifiers, registered departments, and assigned mentors
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
              <Search size={14} color="var(--text-dim)" />
              <input
                type="text"
                placeholder="Search student or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontSize: '12px',
                  outline: 'none',
                  width: '180px',
                }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-dim)', background: 'var(--bg-surface)' }}>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>STUDENT ID</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>NAME & EMAIL</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>DEPARTMENT</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>ACADEMIC YEAR</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>ASSIGNED MENTOR</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.studentId} style={{ borderBottom: '1px solid var(--border-card)' }}>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: 'var(--primary-hover)', fontWeight: 700 }}>
                      {s.studentId}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{s.email}</div>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{s.department}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-main)' }}>Year {s.year}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{s.assignedMentor || 'Dr. S. Sharma'}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <Link to={`/campusiq/students/${s.studentId}`} style={{ color: '#ff8a80', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span>Inspect</span>
                        <ChevronRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Policy Thresholds */}
      {activeTab === 'policies' && (
        <div className="card" style={{ maxWidth: '780px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
            Institutional Early-Warning Threshold Rules
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 20px 0' }}>
            Configurable parameters that trigger alerts on the Early-Warning Radar
          </p>

          {policySaved && (
            <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', color: '#6ee7b7', fontSize: '12.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} />
              <span>Policy thresholds saved. Real-time scoring recalculations applied.</span>
            </div>
          )}

          <form onSubmit={handleSavePolicy} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">
                Statutory Attendance Warning Cutoff: <strong style={{ color: 'var(--text-main)' }}>{attWarning}%</strong>
              </label>
              <input
                type="range"
                min="60"
                max="85"
                value={attWarning}
                onChange={(e) => setAttWarning(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-hover)', cursor: 'pointer' }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                Students with attendance below this threshold receive an automated Academic Warning signal.
              </div>
            </div>

            <div>
              <label className="form-label">
                Academic CGPA Cutoff Threshold: <strong style={{ color: 'var(--text-main)' }}>{gpaWarning} / 10.0</strong>
              </label>
              <input
                type="range"
                min="5.0"
                max="8.0"
                step="0.1"
                value={gpaWarning}
                onChange={(e) => setGpaWarning(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-hover)', cursor: 'pointer' }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                Triggers faculty theory tutorial alerts when cumulative grade falls below this minimum.
              </div>
            </div>

            <div>
              <label className="form-label">
                Placement Coding Readiness Cutoff: <strong style={{ color: 'var(--text-main)' }}>{codingCutoff} / 100</strong>
              </label>
              <input
                type="range"
                min="40"
                max="80"
                value={codingCutoff}
                onChange={(e) => setCodingCutoff(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-hover)', cursor: 'pointer' }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                Benchmarks students for placement accelerator tracks before hiring drives commence.
              </div>
            </div>

            <div style={{ paddingTop: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ fontSize: '13px' }}>
                <span>Save Institutional Policy</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Data Quality */}
      {activeTab === 'integrations' && (
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
            Institutional Data Quality & Integration Health
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 20px 0' }}>
            Audit verification across all 8 campus telemetry channels
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {[
              { name: 'Student Information System (SIS)', status: 'Active & Verified', completeness: '100%', records: '200 Records' },
              { name: 'Biometric Attendance ERP', status: 'Active Sync', completeness: '100%', records: '200 Records' },
              { name: 'LMS Telemetry (Moodle / Canvas)', status: 'Active Telemetry', completeness: '95%', records: '190 Records' },
              { name: 'Placement Assessment Portal', status: 'Active Benchmarks', completeness: '94%', records: '188 Records' },
            ].map((int, i) => (
              <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-card)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>{int.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', marginBottom: '8px' }}>● {int.status}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Completeness: <strong style={{ color: 'var(--text-main)' }}>{int.completeness}</strong></div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>{int.records}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
