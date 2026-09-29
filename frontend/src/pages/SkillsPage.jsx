import React, { useState, useEffect } from 'react';
import api from '../services/api';
import confetti from 'canvas-confetti';
import {
  Award,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  History,
  Sliders,
  ArrowRight,
} from 'lucide-react';

const INITIAL_SKILLS = [
  { skill: 'React', score: 75, details: ['Components', 'Hooks', 'Virtual DOM'] },
  { skill: 'JavaScript', score: 68, details: ['ES6+', 'Async/Await', 'Closures'] },
  { skill: 'SQL', score: 42, details: ['Joins', 'Aggregations', 'Indexing'] },
  { skill: 'Node.js', score: 70, details: ['Express', 'Event Loop', 'APIs'] },
  { skill: 'HTML/CSS', score: 85, details: ['Flexbox', 'Grid', 'Semantic Tags'] },
  { skill: 'Python', score: 60, details: ['Data Types', 'OOP', 'Scripts'] },
  { skill: 'Java', score: 50, details: ['OOP Principles', 'Collections'] },
  { skill: 'Data Structures', score: 55, details: ['Arrays', 'Trees', 'Algorithms'] },
  { skill: 'Communication', score: 80, details: ['STAR Method', 'Team Collaboration'] },
];

export default function SkillsPage() {
  const [skills, setSkills] = useState(INITIAL_SKILLS);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('assess'); // 'assess' or 'history'

  const fetchHistory = async () => {
    try {
      const res = await api.get('/skills/history');
      if (res.data?.success) {
        setHistory(res.data.history);
      }
    } catch (e) {
      console.warn('Failed to load assessment history');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleScoreChange = (index, value) => {
    const updated = [...skills];
    updated[index].score = Number(value);
    setSkills(updated);
  };

  const handleApplyPreset = () => {
    setSkills([
      { skill: 'React', score: 75, details: ['Components', 'Hooks', 'Virtual DOM'] },
      { skill: 'JavaScript', score: 68, details: ['ES6+', 'Async/Await', 'Closures'] },
      { skill: 'SQL', score: 42, details: ['Joins', 'Aggregations', 'Indexing'] },
      { skill: 'Node.js', score: 70, details: ['Express', 'Event Loop', 'APIs'] },
      { skill: 'HTML/CSS', score: 85, details: ['Flexbox', 'Grid', 'Semantic Tags'] },
      { skill: 'Python', score: 60, details: ['Data Types', 'OOP'] },
      { skill: 'Java', score: 50, details: ['OOP Principles', 'Collections'] },
      { skill: 'Data Structures', score: 55, details: ['Arrays', 'Trees'] },
      { skill: 'Communication', score: 80, details: ['STAR Method', 'Collaboration'] },
    ]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post('/skills/assessment', {
        skills,
        category: 'Full Stack Competency Assessment',
      });

      if (res.data?.success) {
        setResult(res.data);
        fetchHistory();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Skill Assessment Module</h1>
            <span className="badge badge-primary">
              <Brain size={12} />
              <span>Hindsight Retain</span>
            </span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
            Assess competencies across key technical disciplines. Scores and weak areas are retained into Hindsight.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveTab('assess')}
            className={`btn ${activeTab === 'assess' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            <Sliders size={14} />
            <span>New Assessment</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            <History size={14} />
            <span>History ({history.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'assess' ? (
        <div style={{ display: 'grid', gridTemplateColumns: result ? '1.2fr 1fr' : '1fr', gap: '24px' }}>
          {/* Assessment Form Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '16px', margin: 0 }}>Evaluate Your Current Skill Levels</h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Adjust scores (0 - 100%) or load hackathon demo values
                </span>
              </div>
              <button
                type="button"
                onClick={handleApplyPreset}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                <Sparkles size={13} color="#f59e0b" />
                <span>Load Hackathon Preset</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {skills.map((item, idx) => (
                <div
                  key={item.skill}
                  style={{
                    padding: '14px 18px',
                    background: 'rgba(15, 23, 42, 0.7)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                        {item.skill}
                      </span>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {item.details.join(' • ')}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '15px',
                        fontWeight: 800,
                        color: item.score >= 70 ? '#10b981' : item.score >= 55 ? '#f59e0b' : '#f43f5e',
                      }}
                    >
                      {item.score}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={item.score}
                    onChange={(e) => handleScoreChange(idx, e.target.value)}
                    style={{
                      width: '100%',
                      cursor: 'pointer',
                      accentColor: item.score >= 70 ? '#10b981' : item.score >= 55 ? '#f59e0b' : '#f43f5e',
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '24px', padding: '14px', fontSize: '15px' }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                  <span>Computing Scores & Retaining in Hindsight...</span>
                </>
              ) : (
                <>
                  <Award size={18} />
                  <span>Submit Assessment & Retain in Memory</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          {/* Results Card */}
          {result && (
            <div className="card" style={{ height: 'fit-content' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    margin: '0 auto 12px auto',
                    boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  <Award size={32} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Assessment Recorded</h3>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#67e8f9', marginTop: '4px' }}>
                  {result.assessment.overallScore}%
                </div>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Overall Competency Score</span>
              </div>

              {/* Hindsight Retain Proof Box */}
              <div
                style={{
                  padding: '16px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a5b4fc', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  <Brain size={14} />
                  <span>Retained in Hindsight Cloud Memory:</span>
                </div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5 }}>
                  "{result.hindsight?.content || result.assessment?.hindsightMemorySummary || 'Memory retained successfully'}"
                </div>
                <div style={{ fontSize: '11px', color: '#818cf8', marginTop: '6px' }}>
                  Tags: {result.hindsight?.tags?.join(', ') || 'skill_assessment, scores, weak_areas'}
                </div>
              </div>

              {/* Strengths & Weak Areas */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                  <CheckCircle2 size={15} />
                  <span>Strengths Identified:</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {result.assessment.strengths.map((s, i) => (
                    <span key={i} className="badge badge-success" style={{ fontSize: '12px' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f43f5e', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                  <AlertTriangle size={15} />
                  <span>Critical Improvement Areas:</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {result.assessment.weakAreas.map((w, i) => (
                    <span key={i} className="badge badge-danger" style={{ fontSize: '12px' }}>
                      {w}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
                  Actionable Recommendations:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.assessment.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: '12px',
                        color: '#94a3b8',
                        padding: '10px 12px',
                        background: 'rgba(15, 23, 42, 0.5)',
                        borderRadius: '8px',
                        borderLeft: '2px solid #06b6d4',
                      }}
                    >
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* History Tab */
        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
            Assessment History & Retained Insights
          </h3>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: '13px' }}>
              No previous assessments found. Submit your first assessment above!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {history.map((h, i) => (
                <div
                  key={i}
                  style={{
                    padding: '18px',
                    background: 'rgba(15, 23, 42, 0.7)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
                        {h.category}
                      </span>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {new Date(h.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <span className="badge badge-info" style={{ fontSize: '14px', fontWeight: 800 }}>
                      {h.overallScore}% Overall
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                    {h.skills.map((s, si) => (
                      <span
                        key={si}
                        style={{
                          fontSize: '11px',
                          padding: '4px 10px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '6px',
                          color: s.score >= 70 ? '#6ee7b7' : s.score >= 50 ? '#fcd34d' : '#fda4af',
                        }}
                      >
                        {s.skill}: <strong>{s.score}%</strong>
                      </span>
                    ))}
                  </div>

                  {h.hindsightMemorySummary && (
                    <div style={{ marginTop: '12px', fontSize: '11px', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Brain size={12} />
                      <span>Retained in Hindsight: {h.hindsightMemorySummary}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
