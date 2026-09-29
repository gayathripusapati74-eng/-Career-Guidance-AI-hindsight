import React, { useState, useEffect } from 'react';
import api from '../services/api';
import confetti from 'canvas-confetti';
import {
  TrendingUp,
  Brain,
  Award,
  FileText,
  HelpCircle,
  Video,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Target,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

export default function ProgressPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reflecting, setReflecting] = useState(false);
  const [reflectPrompt, setReflectPrompt] = useState(
    'How have I improved over time and what is my career readiness trajectory?'
  );
  const [reflectionResult, setReflectionResult] = useState(null);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const res = await api.get('/progress');
      if (res.data?.success) {
        setData(res.data);
        if (res.data.lastReflection) {
          setReflectionResult({
            reflection: res.data.lastReflection.reflectionText,
            query: res.data.lastReflection.query,
          });
        }
      }
    } catch (e) {
      console.warn('Failed to load progress dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleRunReflect = async () => {
    if (!reflectPrompt.trim() || reflecting) return;
    setReflecting(true);

    try {
      const res = await api.post('/progress/reflect', {
        query: reflectPrompt,
      });

      if (res.data) {
        setReflectionResult(res.data);
        confetti({ particleCount: 70, spread: 60 });
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setReflecting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '60px' }}>
        <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
        <p style={{ color: '#94a3b8' }}>Gathering career progress data...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const skills = data?.currentSkills || [];
  const milestones = data?.milestones || [];
  const quizzes = data?.recentQuizzes || [];
  const interviews = data?.recentInterviews || [];

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Progress & Growth Trajectory</h1>
          <span className="badge badge-primary">
            <Brain size={12} />
            <span>Hindsight Reflect</span>
          </span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
          Consolidated performance metrics backed by Hindsight Reflect long-term memory synthesis.
        </p>
      </div>

      {/* Top 5 Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>OVERALL READINESS</span>
            <Target size={16} color="#67e8f9" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#67e8f9' }}>
            {stats.overallReadiness || 0}%
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            Weighted multi-metric composite
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>TECHNICAL SKILLS</span>
            <Award size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>
            {stats.skillScore || 0}%
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            {skills.length} competencies tracked
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>RESUME ATS SCORE</span>
            <FileText size={16} color="#a5b4fc" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#a5b4fc' }}>
            {stats.resumeScore || 0}%
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            ATS keyword match rating
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>QUIZ ACCURACY</span>
            <HelpCircle size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b' }}>
            {stats.quizAverage ? `${stats.quizAverage}%` : 'N/A'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            {stats.quizzesCount || 0} quizzes taken
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>ROADMAP PHASES</span>
            <CheckCircle2 size={16} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#8b5cf6' }}>
            {stats.completedPhasesCount || 0} / {stats.totalPhasesCount || 6}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            {stats.roadmapProgressPercentage || 0}% completed
          </div>
        </div>
      </div>

      {/* CORE FEATURE: HINDSIGHT REFLECT BOX */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          boxShadow: '0 0 30px rgba(99, 102, 241, 0.15)',
          padding: '32px',
          marginBottom: '28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <Brain size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>
              Synthesize Long-Term Growth with <span className="gradient-text">Hindsight Reflect</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>
              Unlike simple keyword searches, Hindsight Reflect reasons across your historical assessments, interviews, and goals to evaluate authentic trajectory.
            </p>
          </div>
        </div>

        {/* Query Input & Trigger */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <input
            type="text"
            className="form-input"
            value={reflectPrompt}
            onChange={(e) => setReflectPrompt(e.target.value)}
            placeholder="Ask a high-level reflection question (e.g., 'How have I improved over time?')..."
            style={{ flex: 1, minWidth: '280px' }}
          />
          <button
            onClick={handleRunReflect}
            disabled={reflecting || !reflectPrompt.trim()}
            className="btn btn-primary"
            style={{ padding: '12px 24px' }}
          >
            {reflecting ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                <span>Synthesizing Memories...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Trigger Hindsight Reflect</span>
              </>
            )}
          </button>
        </div>

        {/* Reflection Output */}
        {reflectionResult && (
          <div
            style={{
              padding: '24px',
              background: 'rgba(15, 23, 42, 0.8)',
              borderRadius: '16px',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              marginTop: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a5b4fc', fontSize: '13px', fontWeight: 700 }}>
                <Brain size={16} />
                <span>Hindsight Reflect Synthesis:</span>
              </div>
              <span className="badge badge-success" style={{ fontSize: '11px' }}>
                Verified Memory Evidence
              </span>
            </div>

            <div
              style={{
                fontSize: '14px',
                color: '#f8fafc',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}
            >
              {reflectionResult.reflection}
            </div>

            {reflectionResult.basedOn && (
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                  Memories & Observations Utilized:
                </div>
                <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                  {JSON.stringify(reflectionResult.basedOn)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Skills Radar / Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Assessed Skills Progress Bars */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
            Competency Distribution
          </h3>
          {skills.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>
              No skills assessed yet. Visit the Skill Assessment page to calibrate your profile!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {skills.map((s, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: '#f8fafc' }}>{s.name}</span>
                    <span style={{ fontWeight: 700, color: s.score >= 70 ? '#10b981' : s.score >= 50 ? '#f59e0b' : '#f43f5e' }}>
                      {s.score}% ({s.level || 'intermediate'})
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${s.score}%`,
                        height: '100%',
                        background: s.score >= 70 ? '#10b981' : s.score >= 50 ? '#f59e0b' : '#f43f5e',
                        borderRadius: '9999px',
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Milestones & Activity Timeline */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
            Milestones Timeline
          </h3>
          {milestones.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>No recorded milestones yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {milestones.slice(-5).reverse().map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <CheckCircle2 size={16} color="#10b981" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{m.title}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {new Date(m.date).toLocaleDateString()} • {m.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
