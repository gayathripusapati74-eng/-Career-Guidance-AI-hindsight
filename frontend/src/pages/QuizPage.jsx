import React, { useState } from 'react';
import api from '../services/api';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  Brain,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';

const SKILLS = ['JavaScript', 'React', 'SQL', 'Node.js', 'Python', 'Data Structures'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];

export default function QuizPage() {
  const [selectedSkill, setSelectedSkill] = useState('JavaScript');
  const [selectedLevel, setSelectedLevel] = useState('intermediate');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  const handleStartQuiz = async () => {
    setLoading(true);
    setQuizResult(null);
    setUserAnswers({});
    setCurrentIdx(0);

    try {
      const res = await api.post('/quiz/generate', {
        skill: selectedSkill,
        level: selectedLevel,
      });

      if (res.data?.success && res.data.questions?.length > 0) {
        setQuestions(res.data.questions);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (opt) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentIdx]: opt,
    }));
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const answersPayload = questions.map((q, idx) => ({
        question: q.question,
        userAnswer: userAnswers[idx] || '',
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        topic: q.topic || selectedSkill,
      }));

      const res = await api.post('/quiz/result', {
        skill: selectedSkill,
        level: selectedLevel,
        answers: answersPayload,
      });

      if (res.data?.success) {
        setQuizResult(res.data.result);
        confetti({ particleCount: 75, spread: 70 });
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Adaptive AI Quiz</h1>
          <span className="badge badge-primary">
            <Brain size={12} />
            <span>Hindsight Learning Trace</span>
          </span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
          Test skills with difficulty-calibrated technical drills. Weak topics and test scores are retained in your Hindsight bank.
        </p>
      </div>

      {/* State 1: Configuration / Selector */}
      {questions.length === 0 && !quizResult && (
        <div className="card" style={{ maxWidth: '640px', margin: '0 auto', padding: '36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                margin: '0 auto 16px auto',
                boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)',
              }}
            >
              <HelpCircle size={28} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Start Technical Drill</h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>
              Select a target domain and challenge tier to generate adaptive questions
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Select Skill to Test</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {SKILLS.map((sk) => (
                <button
                  key={sk}
                  type="button"
                  onClick={() => setSelectedSkill(sk)}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: selectedSkill === sk ? '2px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: selectedSkill === sk ? 'rgba(99, 102, 241, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                    color: selectedSkill === sk ? '#ffffff' : '#94a3b8',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {sk}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label className="form-label">Difficulty Level</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    textTransform: 'capitalize',
                    border: selectedLevel === lvl ? '2px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: selectedLevel === lvl ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                    color: selectedLevel === lvl ? '#ffffff' : '#94a3b8',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartQuiz}
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '28px', padding: '14px', fontSize: '15px' }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                <span>Generating Adaptive Questions...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Begin 5-Question Quiz</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      )}

      {/* State 2: Taking the Quiz */}
      {questions.length > 0 && !quizResult && (
        <div className="card" style={{ maxWidth: '720px', margin: '0 auto', padding: '36px' }}>
          {/* Progress header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <span className="badge badge-info" style={{ fontSize: '12px' }}>
              {selectedSkill} • {selectedLevel.toUpperCase()}
            </span>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>
              Question {currentIdx + 1} of {questions.length}
            </span>
          </div>

          {/* Current Question */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', lineHeight: 1.5 }}>
              {questions[currentIdx]?.question}
            </h2>
            {questions[currentIdx]?.topic && (
              <span style={{ fontSize: '11px', color: '#818cf8', marginTop: '6px', display: 'inline-block' }}>
                Topic: {questions[currentIdx].topic}
              </span>
            )}
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {questions[currentIdx]?.options.map((opt, i) => {
              const isSelected = userAnswers[currentIdx] === opt;
              return (
                <div
                  key={i}
                  onClick={() => handleSelectOption(opt)}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    color: isSelected ? '#ffffff' : '#cbd5e1',
                    fontSize: '14px',
                    fontWeight: isSelected ? 600 : 400,
                    transition: 'all 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: isSelected ? '6px solid #6366f1' : '2px solid rgba(255, 255, 255, 0.2)',
                      background: isSelected ? '#ffffff' : 'transparent',
                    }}
                  />
                  <span>{opt}</span>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setCurrentIdx((c) => Math.max(0, c - 1))}
              disabled={currentIdx === 0}
              className="btn btn-secondary"
            >
              Previous
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx((c) => c + 1)}
                className="btn btn-primary"
              >
                <span>Next Question</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="btn btn-success"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz & Retain'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* State 3: Quiz Results & Hindsight Memory Verification */}
      {quizResult && (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: quizResult.percentage >= 70 ? 'linear-gradient(135deg, #10b981, #06b6d4)' : 'linear-gradient(135deg, #f59e0b, #f43f5e)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                margin: '0 auto 12px auto',
              }}
            >
              <HelpCircle size={32} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Quiz Complete!</h2>
            <div
              style={{
                fontSize: '36px',
                fontWeight: 800,
                color: quizResult.percentage >= 70 ? '#67e8f9' : '#fcd34d',
                marginTop: '4px',
              }}
            >
              {quizResult.score} / {quizResult.totalQuestions} ({quizResult.percentage}%)
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>
              Skill Tested: {quizResult.skill} ({quizResult.level})
            </div>
          </div>

          {/* Hindsight Memory Retained Box */}
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
              <span>Retained in Hindsight Long-term Memory:</span>
            </div>
            <div style={{ fontSize: '12px', color: '#e2e8f0', lineHeight: 1.5 }}>
              "{quizResult.hindsightMemorySummary || 'Quiz metrics and weak areas recorded in Hindsight'}"
            </div>
            <div style={{ fontSize: '11px', color: '#818cf8', marginTop: '6px' }}>
              These weaknesses are now automatically prioritized in your AI Career Chat and Roadmap.
            </div>
          </div>

          {/* Question by Question Review */}
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
            Answer Analysis & Explanations
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
            {quizResult.answers?.map((ans, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  borderRadius: '12px',
                  border: `1px solid ${ans.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                  {ans.isCorrect ? (
                    <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  ) : (
                    <XCircle size={18} color="#f43f5e" style={{ flexShrink: 0, marginTop: '2px' }} />
                  )}
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
                      {idx + 1}. {ans.question}
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                      <span style={{ color: '#94a3b8' }}>Your Answer: </span>
                      <strong style={{ color: ans.isCorrect ? '#6ee7b7' : '#fda4af' }}>
                        {ans.userAnswer}
                      </strong>
                      {!ans.isCorrect && (
                        <div style={{ color: '#6ee7b7', marginTop: '2px' }}>
                          Correct Answer: <strong>{ans.correctAnswer}</strong>
                        </div>
                      )}
                    </div>
                    {ans.explanation && (
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px', fontStyle: 'italic' }}>
                        💡 {ans.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => {
                setQuestions([]);
                setQuizResult(null);
              }}
              className="btn btn-primary"
              style={{ padding: '12px 28px' }}
            >
              <RotateCcw size={16} />
              <span>Take Another Drill</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
