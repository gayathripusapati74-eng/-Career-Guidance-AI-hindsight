import React, { useState } from 'react';
import api from '../services/api';
import confetti from 'canvas-confetti';
import {
  Video,
  Brain,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sparkles,
  ArrowRight,
  RotateCcw,
  User,
  Bot,
} from 'lucide-react';

const ROLES = ['Full Stack Developer', 'Frontend Developer', 'Backend Developer'];
const LEVELS = ['Junior', 'Mid-Level', 'Senior'];
const TYPES = ['Technical', 'Behavioral', 'System Design'];

export default function InterviewPage() {
  const [role, setRole] = useState('Full Stack Developer');
  const [level, setLevel] = useState('Junior');
  const [type, setType] = useState('Technical');

  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [lastTurnEvaluation, setLastTurnEvaluation] = useState(null);
  const [finalSummary, setFinalSummary] = useState(null);

  const handleStartInterview = async () => {
    setLoading(true);
    setFinalSummary(null);
    setLastTurnEvaluation(null);

    try {
      const res = await api.post('/interview/start', {
        role,
        experienceLevel: level,
        interviewType: type,
      });

      if (res.data?.success) {
        setSession(res.data.sessionId);
        setCurrentQuestion(res.data.question);
        setQuestionNumber(res.data.questionNumber);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSampleAnswer = () => {
    if (type === 'Technical') {
      setCandidateAnswer(
        'In React, reconciliation uses a heuristic diffing algorithm that operates in O(n) time. By comparing Virtual DOM snapshots and leveraging component keys, React identifies exact DOM mutations needed without re-rendering the entire tree. For state updates, batching ensures efficient DOM painting.'
      );
    } else {
      setCandidateAnswer(
        'During a recent production deployment, our API experienced latency spikes under heavy concurrent requests. I used Chrome DevTools and Node performance profilers to trace unindexed MongoDB queries. I added compound indexes on tenantId and timestamp, reducing response time from 1.2s to 45ms.'
      );
    }
  };

  const handleSubmitAnswer = async () => {
    if (!candidateAnswer.trim() || evaluating) return;
    setEvaluating(true);

    try {
      const res = await api.post('/interview/answer', {
        sessionId: session,
        answer: candidateAnswer.trim(),
        questionNumber,
      });

      if (res.data?.success) {
        setLastTurnEvaluation(res.data.evaluation);
        setCandidateAnswer('');

        if (res.data.isCompleted) {
          setFinalSummary(res.data.summary);
          setCurrentQuestion(null);
          confetti({ particleCount: 90, spread: 80 });
        } else {
          setCurrentQuestion(res.data.nextQuestion);
          setQuestionNumber(res.data.nextQuestionNumber);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>AI Mock Interview Simulator</h1>
          <span className="badge badge-primary">
            <Brain size={12} />
            <span>Hindsight Debrief Retain</span>
          </span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
          Practice turn-by-turn technical and behavioral interviews. Performance feedback is synthesized into Hindsight.
        </p>
      </div>

      {/* State 1: Setup Configuration */}
      {!session && !finalSummary && (
        <div className="card" style={{ maxWidth: '640px', margin: '0 auto', padding: '36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                margin: '0 auto 16px auto',
                boxShadow: '0 0 25px rgba(236, 72, 153, 0.4)',
              }}
            >
              <Video size={28} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Configure Your Mock Interview</h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>
              Select target role parameters for authentic interview scenarios
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Target Role</label>
            <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Experience Tier</label>
              <select className="form-select" value={level} onChange={(e) => setLevel(e.target.value)}>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Interview Type</label>
              <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleStartInterview}
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '20px', padding: '14px', fontSize: '15px' }}
          >
            {loading ? 'Initializing Interview Room...' : 'Start Interview (4 Questions)'}
          </button>
        </div>
      )}

      {/* State 2: Active Interview */}
      {session && currentQuestion && (
        <div style={{ display: 'grid', gridTemplateColumns: lastTurnEvaluation ? '1.2fr 1fr' : '1fr', gap: '24px' }}>
          {/* Main Interview Q&A Panel */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span className="badge badge-primary">
                Question {questionNumber} of 4 • {role} ({type})
              </span>
              <button
                type="button"
                onClick={handleSampleAnswer}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '4px 10px' }}
              >
                <Sparkles size={12} color="#f59e0b" />
                <span>Fill Sample Answer</span>
              </button>
            </div>

            {/* Question Prompt */}
            <div
              style={{
                padding: '20px',
                background: 'rgba(15, 23, 42, 0.8)',
                borderRadius: '14px',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                marginBottom: '20px',
                display: 'flex',
                gap: '14px',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                <Bot size={20} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Lead Technical Interviewer
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', marginTop: '4px', lineHeight: 1.5 }}>
                  "{currentQuestion}"
                </div>
              </div>
            </div>

            {/* Answer Input */}
            <div className="form-group">
              <label className="form-label">Your Response (Type your structured answer):</label>
              <textarea
                className="form-textarea"
                rows={7}
                placeholder="Structure your answer with context, methodology, trade-offs, and concrete examples..."
                value={candidateAnswer}
                onChange={(e) => setCandidateAnswer(e.target.value)}
              />
            </div>

            <button
              onClick={handleSubmitAnswer}
              disabled={evaluating || !candidateAnswer.trim()}
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px' }}
            >
              {evaluating ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                  <span>Evaluating Answer & Formulating Next Question...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Submit Answer for AI Scoring</span>
                </>
              )}
            </button>
          </div>

          {/* Previous Turn Instant Feedback */}
          {lastTurnEvaluation && (
            <div className="card" style={{ height: 'fit-content' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '16px', margin: 0 }}>Turn Evaluation</h3>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: lastTurnEvaluation.score >= 70 ? '#10b981' : '#f59e0b',
                  }}
                >
                  {lastTurnEvaluation.score}%
                </span>
              </div>

              <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '14px' }}>
                {lastTurnEvaluation.feedback}
              </p>

              {lastTurnEvaluation.strengths?.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, marginBottom: '4px' }}>
                    Strengths:
                  </div>
                  <ul style={{ paddingLeft: '16px', fontSize: '12px', color: '#94a3b8' }}>
                    {lastTurnEvaluation.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {lastTurnEvaluation.improvements?.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700, marginBottom: '4px' }}>
                    Areas to Elevate:
                  </div>
                  <ul style={{ paddingLeft: '16px', fontSize: '12px', color: '#94a3b8' }}>
                    {lastTurnEvaluation.improvements.map((imp, i) => (
                      <li key={i}>{imp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {lastTurnEvaluation.suggestedAnswer && (
                <div style={{ padding: '10px 12px', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '8px', borderLeft: '2px solid #6366f1' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#a5b4fc', marginBottom: '4px' }}>
                    Model Response Blueprint:
                  </div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.5 }}>
                    {lastTurnEvaluation.suggestedAnswer}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* State 3: Final Debrief & Retained in Hindsight */}
      {finalSummary && (
        <div className="card" style={{ maxWidth: '780px', margin: '0 auto', padding: '36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Interview Complete!</h2>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#67e8f9', marginTop: '4px' }}>
              {finalSummary.overallScore}%
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>
              Final Rating for {role} ({type})
            </div>
          </div>

          {/* Hindsight Retained Memory Box */}
          <div
            style={{
              padding: '16px',
              background: 'rgba(99, 102, 241, 0.12)',
              borderRadius: '12px',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a5b4fc', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
              <Brain size={15} />
              <span>Interview Performance Debrief Retained in Hindsight:</span>
            </div>
            <div style={{ fontSize: '12px', color: '#e2e8f0', lineHeight: 1.5 }}>
              "Mock interview completed for {role} with score of {finalSummary.overallScore}%. Strengths: {finalSummary.strengths?.join(', ')}. Weaknesses: {finalSummary.weakAreas?.join(', ')}."
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#10b981', marginBottom: '8px' }}>
                Key Strengths Demonstrated:
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '12px', color: '#cbd5e1', lineHeight: 1.6 }}>
                {finalSummary.strengths?.map((st, i) => (
                  <li key={i}>{st}</li>
                ))}
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b', marginBottom: '8px' }}>
                Target Coaching Areas:
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '12px', color: '#cbd5e1', lineHeight: 1.6 }}>
                {finalSummary.weakAreas?.map((wa, i) => (
                  <li key={i}>{wa}</li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => {
                setSession(null);
                setFinalSummary(null);
                setCurrentQuestion(null);
              }}
              className="btn btn-primary"
              style={{ padding: '12px 28px' }}
            >
              <RotateCcw size={16} />
              <span>Practice Another Interview</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
