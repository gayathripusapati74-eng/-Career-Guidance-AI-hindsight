import React, { useState, useEffect } from 'react';
import {
  Database,
  Upload,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Table,
} from 'lucide-react';
import {
  getDataHubHistory,
  uploadDataset,
  resetDemoData,
} from '../../services/campusiqApi';

const SAMPLE_TEMPLATES = {
  Attendance: {
    fileName: 'sample_attendance.csv',
    content: `student_id,attendance_percentage\nSTU-2024-001,88\nSTU-2024-002,62\nSTU-2024-003,79\nSTU-2024-004,95\nSTU-2024-005,58`,
  },
  'Academic Records': {
    fileName: 'sample_academic_records.csv',
    content: `student_id,gpa,backlogs\nSTU-2024-001,8.4,0\nSTU-2024-002,5.9,2\nSTU-2024-003,7.2,0\nSTU-2024-004,9.1,0\nSTU-2024-005,6.1,1`,
  },
  'Placement Assessments': {
    fileName: 'sample_placement_assessments.csv',
    content: `student_id,coding_score,aptitude_score\nSTU-2024-001,75,80\nSTU-2024-002,35,42\nSTU-2024-003,58,65\nSTU-2024-004,90,92\nSTU-2024-005,42,48`,
  },
};

export default function CampusIQDataHubPage() {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Attendance');
  const [csvText, setCsvText] = useState(SAMPLE_TEMPLATES.Attendance.content);
  const [fileName, setFileName] = useState('uploaded_dataset.csv');
  const [uploadResult, setUploadResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getDataHubHistory();
      if (res.data?.success) {
        setHistoryData(res.data);
      }
    } catch (err) {
      console.error('Error fetching data hub history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    if (SAMPLE_TEMPLATES[cat]) {
      setCsvText(SAMPLE_TEMPLATES[cat].content);
      setFileName(SAMPLE_TEMPLATES[cat].fileName);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvText(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = (cat) => {
    const template = SAMPLE_TEMPLATES[cat] || SAMPLE_TEMPLATES.Attendance;
    const blob = new Blob([template.content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', template.fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmitUpload = async (e) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    setUploading(true);
    setUploadResult(null);
    try {
      const res = await uploadDataset({
        datasetCategory: selectedCategory,
        csvContent: csvText,
        fileName,
      });

      if (res.data?.success) {
        setUploadResult(res.data.summary);
        fetchHistory();
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadResult({
        status: 'Failed',
        errorMessage: err.response?.data?.message || err.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleResetBenchmark = async () => {
    if (!window.confirm('Reset all records to the original 200 synthetic benchmark student dataset?')) return;
    setResetting(true);
    try {
      const res = await resetDemoData();
      if (res.data?.success) {
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 4000);
        fetchHistory();
      }
    } catch (err) {
      console.error('Failed to reset demo dataset:', err);
    } finally {
      setResetting(false);
    }
  };

  const completeness = historyData?.completeness || {};
  const historyList = historyData?.history || [];

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CampusIQ • Data Architecture
            </span>
            <span style={{ color: '#475569' }}>/</span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Multi-Modal Ingestion Hub</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Data Integration & Validation Hub
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
            Unified ingestion across 8 campus data pillars with automated schema checking, error quarantine, and instant re-scoring
          </p>
        </div>

        {/* Reset Benchmark Button */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={handleResetBenchmark}
            disabled={resetting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              color: '#f87171',
              fontSize: '13px',
              fontWeight: 600,
              cursor: resetting ? 'not-allowed' : 'pointer',
            }}
          >
            <RotateCcw size={14} className={resetting ? 'spin' : ''} />
            <span>Reset to 200 Benchmark Students</span>
          </button>
        </div>
      </div>

      {resetSuccess && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            color: '#6ee7b7',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>Benchmark dataset restored to 200 clean student records with PRNG seed=42 reproducibility.</span>
        </div>
      )}

      {/* 8 Data Pillars Coverage Grid */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
          Institutional Data Completeness (8 Modalities)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' }}>
          {[
            { name: 'Academic Records', val: completeness.academicRecords ?? 98, note: 'SIS Grades & CGPA' },
            { name: 'Attendance ERP', val: completeness.attendanceRecords ?? 100, note: 'Biometric Daily Logs' },
            { name: 'LMS Platform', val: completeness.lmsActivity ?? 95, note: 'Video & Submissions' },
            { name: 'Placement Cell', val: completeness.placementAssessments ?? 94, note: 'Coding & Mock Scores' },
            { name: 'Skill Matrix', val: completeness.skillsAssessments ?? 92, note: 'Tech & Soft Skills' },
            { name: 'Engagement Hub', val: completeness.engagementRecords ?? 90, note: 'Clubs & Hackathons' },
          ].map((col, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '14px',
              }}
            >
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>{col.name}</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: col.val >= 90 ? '#10b981' : '#f59e0b' }}>
                {col.val}%
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{col.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CSV Ingestion & Validation Studio */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '28px' }}>
        {/* Upload Form Box */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={18} color="#6366f1" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                CSV Dataset Ingestion Studio
              </h3>
            </div>
            {/* Quick Sample Download */}
            <button
              type="button"
              onClick={() => handleDownloadSample(selectedCategory)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#cbd5e1',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              <Download size={12} />
              <span>Sample CSV</span>
            </button>
          </div>

          <form onSubmit={handleSubmitUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Category Select */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Select Dataset Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  fontSize: '13px',
                  outline: 'none',
                }}
              >
                <option value="Attendance">Attendance Tracking (Biometric/ERP)</option>
                <option value="Academic Records">Academic Records (GPA & Backlogs)</option>
                <option value="Placement Assessments">Placement Assessments (Coding Scores)</option>
              </select>
            </div>

            {/* File Pick / Drop */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Choose CSV File or Edit Raw Text Below
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  width: '100%',
                }}
              />
            </div>

            {/* CSV Raw Text Area */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                CSV Content Preview & Verification
              </label>
              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  background: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  outline: 'none',
                  whiteSpace: 'pre',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                border: 'none',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: uploading ? 'not-allowed' : 'pointer',
              }}
            >
              <Upload size={16} className={uploading ? 'spin' : ''} />
              <span>{uploading ? 'Validating & Merging...' : 'Validate and Ingest Dataset'}</span>
            </button>
          </form>
        </div>

        {/* Validation Feedback & Summary Card */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <ShieldCheck size={18} color="#6366f1" />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Ingestion Validation Report
            </h3>
          </div>

          {!uploadResult ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', textAlign: 'center', padding: '30px' }}>
              <Table size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <div style={{ fontSize: '13px', fontWeight: 600 }}>No active ingestion report</div>
              <div style={{ fontSize: '11px', marginTop: '4px' }}>
                Upload or paste a CSV file on the left to trigger the automatic validation engine.
              </div>
            </div>
          ) : uploadResult.errorMessage ? (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '16px', color: '#fca5a5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '6px' }}>
                <AlertCircle size={16} />
                <span>Validation Failure</span>
              </div>
              <div style={{ fontSize: '12px' }}>{uploadResult.errorMessage}</div>
            </div>
          ) : (
            <div>
              {/* Outcome Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#6ee7b7' }}>SUCCESSFUL ROWS</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981' }}>
                    {uploadResult.successfulRows} / {uploadResult.totalRows}
                  </div>
                </div>

                <div style={{ background: uploadResult.rejectedRows > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.04)', border: `1px solid ${uploadResult.rejectedRows > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`, borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: uploadResult.rejectedRows > 0 ? '#fca5a5' : '#94a3b8' }}>REJECTED ROWS</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: uploadResult.rejectedRows > 0 ? '#ef4444' : '#cbd5e1' }}>
                    {uploadResult.rejectedRows}
                  </div>
                </div>
              </div>

              {/* Rejected Rows Details */}
              {uploadResult.rejectedDetails && uploadResult.rejectedDetails.length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444', marginBottom: '8px' }}>
                    Rejected Row Audit Details ({uploadResult.rejectedDetails.length})
                  </div>
                  <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {uploadResult.rejectedDetails.map((rej, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'rgba(239, 68, 68, 0.06)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          fontSize: '11px',
                        }}
                      >
                        <div style={{ fontWeight: 700, color: '#fca5a5' }}>
                          Line {rej.rowNumber}: {rej.reason}
                        </div>
                        <div style={{ color: '#94a3b8', fontFamily: 'monospace', marginTop: '2px' }}>
                          {rej.dataSnippet}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '16px', fontSize: '11px', color: '#94a3b8', lineHeight: 1.5 }}>
                ✓ Successfully parsed rows have triggered instant score recalculations across all 200 enrolled students.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Import Audit History Table */}
      <div
        style={{
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Recent Ingestion Logs & Audit Trail
            </h3>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
              Historical traceability of data imports across institutional modalities
            </div>
          </div>
          <button
            onClick={fetchHistory}
            style={{ background: 'transparent', border: 'none', color: '#a5b4fc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>IMPORT ID</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>CATEGORY</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>FILE NAME</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>ROWS (VALID / TOTAL)</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              {historyList.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                    No previous import records logged yet.
                  </td>
                </tr>
              ) : (
                historyList.map((h, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#818cf8', fontWeight: 700 }}>
                      {h.importId}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#e2e8f0' }}>{h.datasetCategory}</td>
                    <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>{h.fileName}</td>
                    <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>{h.successfulRows}</span> / {h.totalRows}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: h.status === 'Success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: h.status === 'Success' ? '#10b981' : '#f59e0b',
                        }}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>
                      {new Date(h.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
