import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import { getStudents } from '../../services/campusiqApi';

export default function CampusIQStudentsPage() {
  const [students, setStudents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedSegment, setSelectedSegment] = useState('All');
  const [selectedAcadRisk, setSelectedAcadRisk] = useState('All');
  const [selectedPlaceRisk, setSelectedPlaceRisk] = useState('All');
  const [sortBy, setSortBy] = useState('successScore');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchStudentList = async () => {
    setLoading(true);
    try {
      const res = await getStudents({
        search,
        department: selectedDept,
        year: selectedYear,
        segment: selectedSegment,
        academicRisk: selectedAcadRisk,
        placementRisk: selectedPlaceRisk,
        sortBy,
        order: sortOrder,
        page,
        limit: 20,
      });
      if (res.data.success) {
        setStudents(res.data.students);
        setTotalCount(res.data.totalCount);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentList();
  }, [search, selectedDept, selectedYear, selectedSegment, selectedAcadRisk, selectedPlaceRisk, sortBy, sortOrder, page]);

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Unified Student Directory
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px', margin: 0 }}>
            Search, filter, and inspect records across academics, attendance, LMS, and placement readiness.
          </p>
        </div>

        <div style={{ fontSize: '13px', color: '#94a3b8' }}>
          Showing <strong>{students.length}</strong> of <strong>{totalCount}</strong> unified records
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          background: 'rgba(30, 41, 59, 0.65)',
          padding: '16px',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search by student ID (STU2026-...) or name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '8px',
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
                fontSize: '13px',
              }}
            />
          </div>

          {/* Department */}
          <select
            value={selectedDept}
            onChange={(e) => { setSelectedDept(e.target.value); setPage(1); }}
            style={{ padding: '8px 12px', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#f8fafc', fontSize: '13px' }}
          >
            <option value="All">All Departments</option>
            <option value="Computer Science & Engineering">CSE</option>
            <option value="Information Technology">IT</option>
            <option value="Electronics & Communication Engineering">ECE</option>
            <option value="Mechanical Engineering">MECH</option>
          </select>

          {/* Year */}
          <select
            value={selectedYear}
            onChange={(e) => { setSelectedYear(e.target.value); setPage(1); }}
            style={{ padding: '8px 12px', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#f8fafc', fontSize: '13px' }}
          >
            <option value="All">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>

          {/* Segment */}
          <select
            value={selectedSegment}
            onChange={(e) => { setSelectedSegment(e.target.value); setPage(1); }}
            style={{ padding: '8px 12px', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#f8fafc', fontSize: '13px' }}
          >
            <option value="All">All Segments</option>
            <option value="High Performers">High Performers</option>
            <option value="Placement Focus">Placement Focus</option>
            <option value="Academic Support">Academic Support</option>
            <option value="Intensive Support">Intensive Support</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-');
              setSortBy(sb);
              setSortOrder(so);
            }}
            style={{ padding: '8px 12px', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#f8fafc', fontSize: '13px' }}
          >
            <option value="successScore-desc">Success Score (High to Low)</option>
            <option value="successScore-asc">Success Score (Low to High)</option>
            <option value="urgencyScore-desc">Urgency Priority (Highest First)</option>
            <option value="attendance-asc">Attendance (Lowest First)</option>
            <option value="gpa-asc">GPA (Lowest First)</option>
            <option value="coding-asc">Coding Score (Lowest First)</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="card" style={{ padding: '0', background: 'rgba(30, 41, 59, 0.65)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                <th style={{ padding: '14px 18px' }}>STUDENT</th>
                <th style={{ padding: '14px 18px' }}>DEPARTMENT</th>
                <th style={{ padding: '14px 18px' }}>YEAR</th>
                <th style={{ padding: '14px 18px' }}>SUCCESS SCORE</th>
                <th style={{ padding: '14px 18px' }}>ATTENDANCE</th>
                <th style={{ padding: '14px 18px' }}>GPA</th>
                <th style={{ padding: '14px 18px' }}>CODING</th>
                <th style={{ padding: '14px 18px' }}>ACADEMIC RISK</th>
                <th style={{ padding: '14px 18px' }}>PLACEMENT RISK</th>
                <th style={{ padding: '14px 18px' }}>SEGMENT</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    <RefreshCw size={20} className="spin" style={{ marginBottom: '8px' }} />
                    <div>Loading student database...</div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No matching student records found.
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const score = s.computed?.successScore ?? 0;
                  const acadLevel = s.computed?.academicRisk?.level || 'Low';
                  const placeLevel = s.computed?.placementRisk?.level || 'Low';
                  const segment = s.computed?.segment || 'High Performers';

                  return (
                    <tr key={s.studentId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#e2e8f0' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <Link to={`/campusiq/students/${s.studentId}`} style={{ fontWeight: 700, color: '#f8fafc', textDecoration: 'none' }}>
                          {s.name}
                        </Link>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{s.studentId}</div>
                      </td>

                      <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>
                        {s.department.replace('Engineering', 'Eng.').replace('& Communication', '& Comm.')}
                      </td>

                      <td style={{ padding: '14px 18px', color: '#94a3b8' }}>Year {s.year}</td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 800, fontSize: '14px', color: score >= 70 ? '#34d399' : score >= 55 ? '#fbbf24' : '#f87171' }}>
                            {score}
                          </span>
                          {s.computed?.isProvisional && (
                            <span title="Provisional score calculated from partial indicators" style={{ fontSize: '10px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '1px 4px', borderRadius: '3px' }}>
                              Prov.
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ color: (s.academic?.attendancePercentage ?? 100) < 75 ? '#f87171' : '#f8fafc' }}>
                          {s.academic?.attendancePercentage ?? 'N/A'}%
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        {s.academic?.gpa ? `${s.academic.gpa}/10` : 'N/A'}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        {s.placement?.codingScore !== null ? `${s.placement.codingScore}/100` : 'N/A'}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: acadLevel === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : acadLevel === 'High' ? 'rgba(245, 158, 11, 0.2)' : acadLevel === 'Medium' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: acadLevel === 'Critical' ? '#f87171' : acadLevel === 'High' ? '#fbbf24' : acadLevel === 'Medium' ? '#38bdf8' : '#34d399',
                          }}
                        >
                          {acadLevel}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: placeLevel === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : placeLevel === 'High' ? 'rgba(245, 158, 11, 0.2)' : placeLevel === 'Medium' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: placeLevel === 'Critical' ? '#f87171' : placeLevel === 'High' ? '#fbbf24' : placeLevel === 'Medium' ? '#38bdf8' : '#34d399',
                          }}
                        >
                          {placeLevel}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontSize: '11px', color: '#cbd5e1' }}>{segment}</span>
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <Link
                          to={`/campusiq/students/${s.studentId}`}
                          className="btn"
                          style={{ padding: '6px 10px', fontSize: '12px', background: 'rgba(255, 255, 255, 0.08)', color: '#f8fafc', borderRadius: '6px' }}
                        >
                          <Eye size={13} /> View Profile
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'rgba(15, 23, 42, 0.6)', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            Page {page} of {totalPages}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn"
              style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(255, 255, 255, 0.06)', color: page <= 1 ? '#475569' : '#f8fafc' }}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn"
              style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(255, 255, 255, 0.06)', color: page >= totalPages ? '#475569' : '#f8fafc' }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
