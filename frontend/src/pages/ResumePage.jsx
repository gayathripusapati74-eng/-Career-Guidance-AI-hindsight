import React, { useState, useEffect } from 'react';
import api from '../services/api';
import confetti from 'canvas-confetti';
import {
  FileText,
  Upload,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';

const SAMPLE_RESUME = `ALICE DEVELOPER
Full Stack Software Engineer | GitHub: github.com/alicedev | Portfolio: alicedev.io

SUMMARY
Proactive Full Stack Engineer with 2+ years of experience engineering scalable web applications with React, JavaScript, Node.js, and Express. Adept at building component architectures, RESTful API microservices, and database models.

TECHNICAL SKILLS
- Languages: JavaScript (ES6+), Python, HTML5, CSS3/Tailwind CSS
- Frameworks & Libraries: React.js, Express.js, Redux Toolkit, Mongoose
- Databases: MongoDB, Basic PostgreSQL
- Tools: Git, GitHub, VS Code, Postman, npm

EXPERIENCE & PROJECTS
Full Stack Developer Intern — TechNovation Labs (2025 - Present)
- Engineered responsive client portals with React, reducing page load latency by 25%.
- Implemented JWT-based session security and validation middleware in Node.js.
- Integrated MongoDB database clusters, designing schema models for user profile workflows.

Personal Projects:
1. CloudPulse Task Orchestrator (Full Stack MERN):
- Developed full-stack task management application with role-based access control.
- Designed REST endpoints and responsive UI using Tailwind CSS.

EDUCATION
B.S. in Computer Science — State University (Graduated May 2024)`;

export default function ResumePage() {
  const [resumeText, setResumeText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function loadLatest() {
      try {
        const res = await api.get('/resume/latest');
        if (res.data?.success && res.data.evaluation) {
          setResult(res.data.evaluation);
        }
      } catch (e) {
        console.warn('Failed to load latest resume');
      }
    }
    loadLatest();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleLoadSample = () => {
    setResumeText(SAMPLE_RESUME);
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !resumeText.trim()) {
      alert('Please paste resume text or select a file to evaluate');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append('resumeFile', file);
        res = await api.post('/resume/evaluate', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post('/resume/evaluate', {
          resumeText,
          fileName: 'Pasted-Resume.txt',
        });
      }

      if (res.data?.success) {
        setResult(res.data.evaluation);
        confetti({ particleCount: 70, spread: 60 });
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
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Resume ATS & Skill Evaluation</h1>
          <span className="badge badge-primary">
            <Brain size={12} />
            <span>Hindsight Retain</span>
          </span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
          Analyze ATS match rates, detected technologies, and missing skills. Key career insights are retained in Hindsight.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1.1fr' : '1fr', gap: '24px' }}>
        {/* Upload / Paste Form */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', margin: 0 }}>Provide Candidate Resume</h3>
            <button
              type="button"
              onClick={handleLoadSample}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              <Sparkles size={13} color="#f59e0b" />
              <span>Load Sample Resume</span>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* File Upload Zone */}
            <div
              style={{
                border: '2px dashed rgba(255, 255, 255, 0.15)',
                borderRadius: '14px',
                padding: '24px',
                textAlign: 'center',
                background: 'rgba(15, 23, 42, 0.5)',
                marginBottom: '18px',
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('resumeFileInput').click()}
            >
              <input
                id="resumeFileInput"
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <Upload size={32} color="#818cf8" style={{ margin: '0 auto 10px auto' }} />
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
                {file ? file.name : 'Click to select PDF or TXT resume file'}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Maximum size: 5MB • PDF, Plain Text supported
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '14px 0', fontSize: '12px', color: '#64748b' }}>
              — OR PASTE RESUME CONTENT BELOW —
            </div>

            <div className="form-group">
              <textarea
                className="form-textarea"
                rows={10}
                placeholder="Paste plain text resume here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || (!file && !resumeText.trim())}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px' }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                  <span>Parsing ATS Metrics & Retaining in Hindsight...</span>
                </>
              ) : (
                <>
                  <FileCheck size={18} />
                  <span>Run ATS Evaluation & Retain Insights</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        {result && (
          <div className="card" style={{ height: 'fit-content' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Evaluation Report</h3>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Target Role: <strong style={{ color: '#f8fafc' }}>{result.detectedRole}</strong>
                </div>
              </div>

              {/* ATS Score Meter */}
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: 800,
                    color: result.atsScore >= 75 ? '#10b981' : result.atsScore >= 60 ? '#f59e0b' : '#f43f5e',
                  }}
                >
                  {result.atsScore}%
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>
                  ATS Match Score
                </div>
              </div>
            </div>

            {/* Hindsight Retained Memory Box */}
            <div
              style={{
                padding: '14px',
                background: 'rgba(99, 102, 241, 0.1)',
                borderRadius: '10px',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a5b4fc', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                <Brain size={14} />
                <span>Sanitized Insights Retained in Hindsight:</span>
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5 }}>
                "{result.hindsightMemorySummary || 'Resume technical skills and missing gaps retained in Hindsight.'}"
              </div>
              <div style={{ fontSize: '10px', color: '#818cf8', marginTop: '4px' }}>
                Strict Privacy: Personal phone numbers, emails, and street addresses are never stored in memory.
              </div>
            </div>

            {/* Skills Found */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                <CheckCircle2 size={15} />
                <span>Verified Skills on Resume ({result.detectedSkills?.length || 0}):</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {result.detectedSkills?.map((s, i) => (
                  <span key={i} className="badge badge-success" style={{ fontSize: '11px' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Critical Skills */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f43f5e', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                <AlertTriangle size={15} />
                <span>Missing High-Demand Skills to Add:</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {result.missingSkills?.map((ms, i) => (
                  <span key={i} className="badge badge-danger" style={{ fontSize: '11px' }}>
                    + {ms}
                  </span>
                ))}
              </div>
            </div>

            {/* Resume Strengths & Improvements */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
                Resume Strengths:
              </div>
              <ul style={{ paddingLeft: '18px', color: '#94a3b8', fontSize: '12px', lineHeight: 1.6 }}>
                {result.strengths?.map((st, i) => (
                  <li key={i}>{st}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
                High-Impact Improvements:
              </div>
              <ul style={{ paddingLeft: '18px', color: '#94a3b8', fontSize: '12px', lineHeight: 1.6 }}>
                {result.improvements?.map((imp, i) => (
                  <li key={i}>{imp}</li>
                ))}
              </ul>
            </div>

            {/* ATS Specific Feedback */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
                ATS Formatting & Parser Advice:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {result.atsFeedback?.map((fb, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: '11px',
                      color: '#cbd5e1',
                      padding: '8px 12px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      borderRadius: '8px',
                      borderLeft: '2px solid #f59e0b',
                    }}
                  >
                    {fb}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
