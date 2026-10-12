import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Award,
  BookOpen,
  Briefcase,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { getExportUrl } from '../../services/campusiqApi';

export default function CampusIQReportsPage() {
  const [downloading, setDownloading] = useState(null);

  const handleDownload = (type, fileName) => {
    setDownloading(type);
    const url = getExportUrl(type);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(null), 1000);
  };

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CampusIQ • Institutional Governance
            </span>
            <span style={{ color: '#475569' }}>/</span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Reports & Transparent Methodology</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Institutional Reports & Methodology
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
            Export comprehensive verified campus data feeds and inspect transparent mathematical scoring formulations
          </p>
        </div>
      </div>

      {/* CSV Export Cards Grid */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
          Standard Institutional Export Reports (CSV)
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Card 1: Risk Register */}
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                  <AlertTriangle size={18} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                  PRIORITY ACTION
                </span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px 0' }}>
                Early-Warning Risk Register
              </h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                Filterable list of all students exhibiting Medium, High, or Critical risk across academic attendance, GPA thresholds, and placement coding assessments.
              </p>
            </div>

            <button
              onClick={() => handleDownload('risk-register', 'campusiq_risk_register.csv')}
              disabled={downloading === 'risk-register'}
              style={{
                marginTop: '18px',
                padding: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#fca5a5',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <Download size={14} />
              <span>{downloading === 'risk-register' ? 'Generating...' : 'Download Risk Register CSV'}</span>
            </button>
          </div>

          {/* Card 2: Segments */}
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4' }}>
                  <Layers size={18} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#06b6d4', background: 'rgba(6, 182, 212, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                  COHORTS
                </span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px 0' }}>
                4-Quadrant Cohort Segmentation
              </h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                Breakdown of students mapped across High Performers, Placement Focus, Academic Support, and Intensive Support quadrants for resource planning.
              </p>
            </div>

            <button
              onClick={() => handleDownload('segments', 'campusiq_student_segments.csv')}
              disabled={downloading === 'segments'}
              style={{
                marginTop: '18px',
                padding: '10px',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: '8px',
                color: '#67e8f9',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <Download size={14} />
              <span>{downloading === 'segments' ? 'Generating...' : 'Download Cohorts CSV'}</span>
            </button>
          </div>

          {/* Card 3: Interventions */}
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                  <FileText size={18} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#818cf8', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                  ACTION INTELLIGENCE
                </span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px 0' }}>
                Interventions & Outcomes Log
              </h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                Complete faculty assignment register detailing baseline indicators, assigned mentoring actions, target due dates, and verified measured outcomes.
              </p>
            </div>

            <button
              onClick={() => handleDownload('interventions', 'campusiq_interventions_log.csv')}
              disabled={downloading === 'interventions'}
              style={{
                marginTop: '18px',
                padding: '10px',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '8px',
                color: '#a5b4fc',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <Download size={14} />
              <span>{downloading === 'interventions' ? 'Generating...' : 'Download Interventions CSV'}</span>
            </button>
          </div>

          {/* Card 4: Campus Master */}
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <Award size={18} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                  COMPLETE
                </span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px 0' }}>
                Campus Master Student Registry
              </h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                Comprehensive multi-modal records across all 200 benchmark students, including composite success scores, completeness %, and dual-risk indicators.
              </p>
            </div>

            <button
              onClick={() => handleDownload('master', 'campusiq_students_master.csv')}
              disabled={downloading === 'master'}
              style={{
                marginTop: '18px',
                padding: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                color: '#6ee7b7',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <Download size={14} />
              <span>{downloading === 'master' ? 'Generating...' : 'Download Master Registry CSV'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transparent Scoring Methodology Section */}
      <div
        style={{
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '28px',
          marginBottom: '28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <ShieldCheck size={22} color="#6366f1" />
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Mathematical Formulation: Student Success Score (S)
          </h2>
        </div>

        <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 20px 0' }}>
          Unlike black-box proprietary machine learning models that generate unexplainable probabilities, CampusIQ employs a transparent, mathematically rigorous multi-criteria decision algorithm. Every student's score is deterministic, inspectable, and reproducible.
        </p>

        {/* Formula Box */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '12px',
            padding: '20px',
            fontFamily: 'monospace',
            color: '#a5b4fc',
            fontSize: '14px',
            lineHeight: 1.6,
            marginBottom: '24px',
          }}
        >
          <div style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '8px' }}>
            Success Score Formula:
          </div>
          <div>S = (0.30 × Academic) + (0.20 × Attendance) + (0.20 × Placement) + (0.15 × LMS) + (0.10 × Skills) + (0.05 × Engagement)</div>
          <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '10px' }}>
            * Where all component sub-scores are normalized to [0, 100]. Active academic backlogs apply an escalating penalty factor of -4 pts per subject.
          </div>
        </div>

        {/* Formula Weights Table */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>1. Academic Performance (30%)</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              Normalized from CGPA: (GPA / 10) × 100 with backlog deductions. Directly tracks degree progression.
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>2. Attendance Regularity (20%)</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              Biometric ERP percentage. Mandatory statutory cutoff is 75%; below 65% triggers Critical Alert.
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>3. Placement Readiness (20%)</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              Composite of Coding Assessments (50%), Aptitude (30%), and Mock Technical Interviews (20%).
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>4. LMS Engagement (15%)</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              Video completion rate, on-time assignment submissions, and weekly login regularity.
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>5. Skill Matrix Assessments (10%)</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              Standardized rubric measuring core technical stack proficiency (60%) and soft skills (40%).
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>6. Campus Participation (5%)</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              Technical club leadership, competitive hackathon involvement, and faculty peer tutoring.
            </div>
          </div>
        </div>

        {/* Provisional Score Callout */}
        <div
          style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <CheckCircle2 size={18} color="#818cf8" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', marginBottom: '2px' }}>
              Provisional Score Normalization for Incomplete Records
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5 }}>
              In real-world campus ERPs, first-year students often lack placement assessments or mock interviews. Traditional algorithms penalize missing fields with zero, erroneously classifying students as critical risk. CampusIQ dynamically normalizes weights across available indicators:
              <br />
              <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', color: '#a5b4fc', display: 'inline-block', marginTop: '4px' }}>
                S_provisional = Σ (w_i × I_i) / Σ (w_i for active indicators)
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Ethical AI Charter */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '16px',
          padding: '24px',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
          Institutional Ethics & Algorithmic Governance Charter
        </div>
        <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6 }}>
          1. <strong>Augmented Decision Support:</strong> CampusIQ never automates disciplinary actions or expulsion decisions. All recommendations are advisories for human faculty mentors.<br />
          2. <strong>Zero Protected Demographic Bias:</strong> The scoring engine strictly excludes student gender, caste, religion, socio-economic bracket, and geographic origin from scoring calculations.<br />
          3. <strong>Right to Explanation:</strong> Every alert presents clickable, timestamped evidence (e.g. "Attendance: 62% on Oct 10") so students and advisors understand the exact cause of concern.
        </div>
      </div>
    </div>
  );
}
