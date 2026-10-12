import React, { useState, useEffect } from 'react';
import {
  Sliders,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Award,
  BookOpen,
  Briefcase,
  HelpCircle,
  Sparkles,
  User,
} from 'lucide-react';
import { simulateScenario, getStudents } from '../../services/campusiqApi';

export default function CampusIQSimulatorPage() {
  const [studentsList, setStudentsList] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  // Form / Slider values
  const [attendance, setAttendance] = useState(68);
  const [gpa, setGpa] = useState(6.0);
  const [backlogs, setBacklogs] = useState(1);
  const [codingScore, setCodingScore] = useState(40);
  const [aptitudeScore, setAptitudeScore] = useState(45);
  const [videoCompletion, setVideoCompletion] = useState(50);
  const [assignmentSubmission, setAssignmentSubmission] = useState(60);

  // Fetch student directory for selector
  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await getStudents({ limit: 100 });
        if (res.data?.students) {
          setStudentsList(res.data.students);
        }
      } catch (err) {
        console.error('Error fetching students list for simulator:', err);
      }
    }
    loadStudents();
  }, []);

  // When selected student changes, populate baseline
  const handleStudentSelect = (studentId) => {
    setSelectedStudentId(studentId);
    if (!studentId) {
      // Benchmark defaults
      setAttendance(68);
      setGpa(6.0);
      setBacklogs(1);
      setCodingScore(40);
      setAptitudeScore(45);
      setVideoCompletion(50);
      setAssignmentSubmission(60);
      return;
    }

    const s = studentsList.find((st) => st.studentId === studentId);
    if (s) {
      setAttendance(s.academic?.attendancePercentage ?? 75);
      setGpa(s.academic?.gpa ?? 7.0);
      setBacklogs(s.academic?.backlogs ?? 0);
      setCodingScore(s.placement?.codingScore ?? 50);
      setAptitudeScore(s.placement?.aptitudeScore ?? 50);
      setVideoCompletion(s.lms?.videoCompletionRate ?? 65);
      setAssignmentSubmission(s.lms?.assignmentSubmissionOnTimeRate ?? 70);
    }
  };

  const runSimulation = async () => {
    setLoading(true);
    try {
      const payload = {
        studentId: selectedStudentId || undefined,
        hypotheticalChanges: {
          attendancePercentage: attendance,
          gpa,
          backlogs,
          codingScore,
          aptitudeScore,
          videoCompletionRate: videoCompletion,
          assignmentSubmissionRate: assignmentSubmission,
        },
      };

      const res = await simulateScenario(payload);
      if (res.data?.success) {
        setSimulationResult(res.data);
      }
    } catch (err) {
      console.error('Error running scenario simulation:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run initial simulation on mount
  useEffect(() => {
    runSimulation();
  }, []);

  const baseline = simulationResult?.baseline || {};
  const scenario = simulationResult?.scenario || {};
  const delta = simulationResult?.delta || {};

  const scoreDiff = delta?.scoreDiff ?? 0;
  const isPositive = scoreDiff >= 0;

  return (
    <div className="page-container" style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', background: 'var(--primary-light)', color: 'var(--primary-hover)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              CampusIQ • Predictive Sandbox
            </span>
            <span style={{ color: 'var(--border-card)' }}>/</span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>What-If Success Simulator</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            What-If Scenario Simulator
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Forecast institutional score shifts and risk boundary transitions under hypothetical intervention targets
          </p>
        </div>

        {/* Student Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '8px 14px', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
            <User size={14} color="var(--text-muted)" />
            <select
              value={selectedStudentId}
              onChange={(e) => handleStudentSelect(e.target.value)}
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
              <option value="" style={{ background: '#0D0D0D' }}>
                Default Benchmark Profile
              </option>
              {studentsList.map((st) => (
                <option key={st.studentId} value={st.studentId} style={{ background: '#0D0D0D' }}>
                  {st.name} ({st.studentId} - {st.department})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleStudentSelect(selectedStudentId)}
            title="Reset to Baseline"
            style={{
              padding: '8px 14px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-card)',
              borderRadius: '10px',
              color: 'var(--text-main)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} style={{ color: 'var(--primary-hover)' }} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Controls vs Results */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '24px', marginBottom: '28px' }}>
        {/* Left Column: Sliders & Parameter Controls */}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} color="var(--primary-hover)" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Adjust Hypothetical Parameters
              </h3>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Weight Impact: Configurable
            </span>
          </div>

          {/* Slider 1: Attendance */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Attendance Rate: <span style={{ color: 'var(--primary-hover)', fontWeight: 700 }}>{attendance}%</span>
              </label>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Weight: 20%</span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              value={attendance}
              onChange={(e) => setAttendance(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary-hover)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setAttendance(Math.min(100, attendance + 5))}
                style={{ padding: '2px 8px', fontSize: '11px', background: 'var(--bg-surface)', border: '1px solid var(--border-card)', color: 'var(--text-muted)', borderRadius: '4px', cursor: 'pointer' }}
              >
                +5%
              </button>
              <button
                type="button"
                onClick={() => setAttendance(Math.min(100, attendance + 10))}
                style={{ padding: '2px 8px', fontSize: '11px', background: 'var(--bg-surface)', border: '1px solid var(--border-card)', color: 'var(--text-muted)', borderRadius: '4px', cursor: 'pointer' }}
              >
                +10%
              </button>
              <button
                type="button"
                onClick={() => setAttendance(75)}
                style={{ padding: '2px 8px', fontSize: '11px', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', color: 'var(--primary-hover)', borderRadius: '4px', cursor: 'pointer' }}
              >
                Target 75%
              </button>
            </div>
          </div>

          {/* Slider 2: GPA */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Cumulative GPA: <span style={{ color: 'var(--primary-hover)', fontWeight: 700 }}>{gpa.toFixed(1)} / 10.0</span>
              </label>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Weight: 30%</span>
            </div>
            <input
              type="range"
              min="3.0"
              max="10.0"
              step="0.1"
              value={gpa}
              onChange={(e) => setGpa(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary-hover)', cursor: 'pointer' }}
            />
          </div>

          {/* Slider 3: Backlogs */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Active Backlogs: <span style={{ color: backlogs > 0 ? 'var(--primary-hover)' : '#10b981', fontWeight: 700 }}>{backlogs} Subjects</span>
              </label>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Penalty Factor</span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              value={backlogs}
              onChange={(e) => setBacklogs(Number(e.target.value))}
              style={{ width: '100%', accentColor: backlogs > 0 ? 'var(--primary-hover)' : '#10b981', cursor: 'pointer' }}
            />
          </div>

          {/* Slider 4: Coding Score */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Coding Assessment: <span style={{ color: 'var(--primary-hover)', fontWeight: 700 }}>{codingScore} / 100</span>
              </label>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Weight: 20%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={codingScore}
              onChange={(e) => setCodingScore(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary-hover)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setCodingScore(Math.min(100, codingScore + 15))}
                style={{ padding: '2px 8px', fontSize: '11px', background: 'var(--bg-surface)', border: '1px solid var(--border-card)', color: 'var(--text-muted)', borderRadius: '4px', cursor: 'pointer' }}
              >
                +15 pts
              </button>
              <button
                type="button"
                onClick={() => setCodingScore(65)}
                style={{ padding: '2px 8px', fontSize: '11px', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', color: 'var(--primary-hover)', borderRadius: '4px', cursor: 'pointer' }}
              >
                Target Tier-1 Cutoff (65)
              </button>
            </div>
          </div>

          {/* Slider 5: Aptitude Score */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Aptitude Assessment: <span style={{ color: 'var(--primary-hover)', fontWeight: 700 }}>{aptitudeScore} / 100</span>
              </label>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Placement Component</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={aptitudeScore}
              onChange={(e) => setAptitudeScore(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary-hover)', cursor: 'pointer' }}
            />
          </div>

          {/* Slider 6: LMS Video Completion */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                LMS Video Completion: <span style={{ color: 'var(--primary-hover)', fontWeight: 700 }}>{videoCompletion}%</span>
              </label>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Weight: 15%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={videoCompletion}
              onChange={(e) => setVideoCompletion(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary-hover)', cursor: 'pointer' }}
            />
          </div>

          {/* Run Action */}
          <button
            onClick={runSimulation}
            disabled={loading}
            style={{
              marginTop: '10px',
              padding: '14px',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-secondary))',
              border: 'none',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(139, 0, 0, 0.4)',
            }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>Recalculate Scenario Trajectory</span>
          </button>
        </div>

        {/* Right Column: Dynamic Simulation Outcomes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Comparison Card */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '16px' }}>
              Projected Success Trajectory
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center' }}>
              {/* Baseline Box */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-card)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>CURRENT BASELINE</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {baseline.successScore ?? '—'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>out of 100</div>
                <div
                  style={{
                    display: 'inline-block',
                    marginTop: '8px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {baseline.segment || 'Benchmark'}
                </div>
              </div>

              {/* Arrow with Delta */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div
                  style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: isPositive ? 'rgba(16, 185, 129, 0.2)' : 'var(--primary-light)',
                    color: isPositive ? '#10b981' : 'var(--primary-hover)',
                    border: `1px solid ${isPositive ? 'rgba(16, 185, 129, 0.4)' : 'var(--primary-border)'}`,
                  }}
                >
                  {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{isPositive ? `+${scoreDiff}` : scoreDiff} pts</span>
                </div>
                <ArrowRight size={20} color="var(--border-card)" />
              </div>

              {/* Scenario Box */}
              <div
                style={{
                  background: isPositive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(139, 0, 0, 0.12)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: `1px solid ${isPositive ? 'rgba(16, 185, 129, 0.3)' : 'var(--primary-border)'}`,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--primary-hover)', marginBottom: '4px' }}>SIMULATED TARGET</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: isPositive ? '#10b981' : 'var(--primary-hover)' }}>
                  {scenario.successScore ?? '—'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>out of 100</div>
                <div
                  style={{
                    display: 'inline-block',
                    marginTop: '8px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                    background: 'var(--primary-light)',
                    color: 'var(--primary-hover)',
                  }}
                >
                  {scenario.segment || 'Projected'}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Level Boundary Shifts */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 16px 0' }}>
              Dual-Risk Classification Dynamics
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {/* Academic Risk Shift */}
              <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>Academic Risk Boundary</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700 }}>
                  <span style={{ color: baseline.academicRisk?.level === 'High' ? 'var(--primary-hover)' : '#f59e0b' }}>
                    {baseline.academicRisk?.level || 'Medium'}
                  </span>
                  <ArrowRight size={14} color="var(--text-dim)" />
                  <span style={{ color: scenario.academicRisk?.level === 'Low' ? '#10b981' : '#f59e0b' }}>
                    {scenario.academicRisk?.level || 'Low'}
                  </span>
                </div>
              </div>

              {/* Placement Risk Shift */}
              <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>Placement Risk Boundary</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700 }}>
                  <span style={{ color: baseline.placementRisk?.level === 'High' ? 'var(--primary-hover)' : '#f59e0b' }}>
                    {baseline.placementRisk?.level || 'Medium'}
                  </span>
                  <ArrowRight size={14} color="var(--text-dim)" />
                  <span style={{ color: scenario.placementRisk?.level === 'Low' ? '#10b981' : '#f59e0b' }}>
                    {scenario.placementRisk?.level || 'Low'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Drivers / Contributors Table */}
          {delta?.contributors && delta.contributors.length > 0 && (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
                Key Trajectory Drivers
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {delta.contributors.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-card)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{c.indicator}</span>
                      <span style={{ color: 'var(--text-dim)', marginLeft: '6px' }}>({c.weight} weight)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary-hover)' }}>{c.change}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>• {c.impact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ethics & Advisory Notice */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-card)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <ShieldCheck size={18} color="var(--primary-hover)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--text-main)' }}>Decision Support Notice:</strong> What-If calculations are non-destructive hypothetical simulations calculated by the deterministic CampusIQ scoring engine. They do not alter the student’s actual academic transcripts or placement eligibility records.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
