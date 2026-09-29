import React, { useState, useEffect } from 'react';
import api from '../services/api';
import confetti from 'canvas-confetti';
import {
  Map,
  Brain,
  CheckCircle2,
  Clock,
  Circle,
  RefreshCw,
  BookOpen,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

export default function RoadmapPage() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const res = await api.get('/career/roadmap');
      if (res.data?.success) {
        setPlan(res.data.plan);
      }
    } catch (e) {
      console.warn('Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleRegenerate = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/career/roadmap', {});
      if (res.data?.success) {
        setPlan(res.data.plan);
        confetti({ particleCount: 60, spread: 60 });
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdatePhase = async (phaseNumber, nextStatus) => {
    setUpdating(true);
    try {
      const res = await api.put('/career/roadmap/phase', {
        phaseNumber,
        status: nextStatus,
      });

      if (res.data?.success) {
        setPlan(res.data.plan);
        if (nextStatus === 'completed') {
          confetti({ particleCount: 80, spread: 70 });
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '60px' }}>
        <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
        <p style={{ color: '#94a3b8' }}>Loading personalized career roadmap from Hindsight memory...</p>
      </div>
    );
  }

  const phases = plan?.phases || [];
  const completedCount = phases.filter((p) => p.status === 'completed').length;
  const progressPct = plan?.overallProgress || (phases.length > 0 ? Math.round((completedCount / phases.length) * 100) : 0);

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Personalized Career Roadmap</h1>
            <span className="badge badge-primary">
              <Brain size={12} />
              <span>Grounded in Hindsight</span>
            </span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
            Structured, progressive learning path generated from your stated goals, assessed skills, and verified resume gaps.
          </p>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={generating}
          className="btn btn-secondary"
          style={{ padding: '10px 18px', fontSize: '13px' }}
        >
          <RefreshCw size={14} className={generating ? 'spinner' : ''} />
          <span>Regenerate from Hindsight</span>
        </button>
      </div>

      {/* Progress Overview Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
          marginBottom: '28px',
          padding: '24px 32px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <span style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Target Milestone:
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', margin: '2px 0 0 0' }}>
              {plan?.goal || 'Full Stack Developer'}
            </h3>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#67e8f9' }}>
              {progressPct}%
            </span>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              {completedCount} of {phases.length} Phases Completed
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPct}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)',
              borderRadius: '9999px',
              transition: 'width 0.4s ease',
            }}
          ></div>
        </div>
      </div>

      {/* Phases Timeline Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {phases.map((phase) => {
          const isCompleted = phase.status === 'completed';
          const isInProgress = phase.status === 'in_progress';

          return (
            <div
              key={phase.phaseNumber}
              className="card"
              style={{
                border: isCompleted
                  ? '1px solid rgba(16, 185, 129, 0.3)'
                  : isInProgress
                  ? '1px solid rgba(99, 102, 241, 0.4)'
                  : '1px solid var(--border-card)',
                background: isInProgress
                  ? 'rgba(30, 41, 59, 0.85)'
                  : 'var(--bg-card)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: isCompleted
                        ? 'rgba(16, 185, 129, 0.2)'
                        : isInProgress
                        ? 'rgba(99, 102, 241, 0.25)'
                        : 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isCompleted ? '#10b981' : isInProgress ? '#818cf8' : '#94a3b8',
                      fontWeight: 800,
                      fontSize: '16px',
                    }}
                  >
                    {isCompleted ? <CheckCircle2 size={20} /> : `0${phase.phaseNumber}`}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>
                        {phase.title}
                      </h3>
                      {isInProgress && (
                        <span className="badge badge-primary" style={{ fontSize: '11px' }}>
                          In Progress
                        </span>
                      )}
                      {isCompleted && (
                        <span className="badge badge-success" style={{ fontSize: '11px' }}>
                          Completed
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                      <Clock size={12} />
                      <span>Estimated Duration: {phase.duration || '3 Weeks'}</span>
                    </div>
                  </div>
                </div>

                {/* Status Toggle Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {phase.status !== 'pending' && (
                    <button
                      onClick={() => handleUpdatePhase(phase.phaseNumber, 'pending')}
                      disabled={updating}
                      className="btn btn-secondary"
                      style={{ fontSize: '11px', padding: '6px 10px' }}
                    >
                      Reset
                    </button>
                  )}
                  {phase.status !== 'in_progress' && !isCompleted && (
                    <button
                      onClick={() => handleUpdatePhase(phase.phaseNumber, 'in_progress')}
                      disabled={updating}
                      className="btn btn-outline"
                      style={{ fontSize: '11px', padding: '6px 12px' }}
                    >
                      Start Phase
                    </button>
                  )}
                  {!isCompleted && (
                    <button
                      onClick={() => handleUpdatePhase(phase.phaseNumber, 'completed')}
                      disabled={updating}
                      className="btn btn-success"
                      style={{ fontSize: '11px', padding: '6px 14px' }}
                    >
                      <CheckCircle2 size={13} />
                      <span>Mark Complete</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '16px' }}>
                {phase.description}
              </p>

              {/* Skills & Milestones Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                {/* Skills to master */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
                    Skills to Master:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {phase.skills?.map((sk, ski) => (
                      <span
                        key={ski}
                        style={{
                          fontSize: '11px',
                          padding: '4px 10px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#e2e8f0',
                        }}
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Milestones */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
                    Required Milestones:
                  </div>
                  <ul style={{ paddingLeft: '18px', fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5 }}>
                    {phase.milestones?.map((ms, msi) => (
                      <li key={msi}>{ms}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
