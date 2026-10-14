import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Users,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  AlertTriangle,
  Award,
  Layers,
  Sparkles,
} from 'lucide-react';
import { getStudents } from '../../services/campusiqApi';
import EmptyState from '../../components/EmptyState';

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
    <div className="page-container" style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Unified Student Directory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px', margin: 0 }}>
            Search, filter, and inspect records across academics, attendance, LMS, and placement readiness.
          </p>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
          Showing <strong>{students.length}</strong> of <strong>{totalCount}</strong> unified records
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          background: 'var(--bg-card)',
          padding: '16px',
          borderRadius: '14px',
          border: '1px solid var(--border-card)',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
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
                background: '#0D0D0D',
                border: '1px solid var(--border-card)',
                color: 'var(--text-main)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          {/* Department */}
          <select
            value={selectedDept}
            onChange={(e) => { setSelectedDept(e.target.value); setPage(1); }}
            style={{ padding: '8px 12px', borderRadius: '8px', background: '#0D0D0D', border: '1px solid var(--border-card)', color: 'var(--text-main)', fontSize: '12.5px', outline: 'none' }}
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
            style={{ padding: '8px 12px', borderRadius: '8px', background: '#0D0D0D', border: '1px solid var(--border-card)', color: 'var(--text-main)', fontSize: '12.5px', outline: 'none' }}
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
            style={{ padding: '8px 12px', borderRadius: '8px', background: '#0D0D0D', border: '1px solid var(--border-card)', color: 'var(--text-main)', fontSize: '12.5px', outline: 'none' }}
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
            style={{ padding: '8px 12px', borderRadius: '8px', background: '#0D0D0D', border: '1px solid var(--border-card)', color: 'var(--text-main)', fontSize: '12.5px', outline: 'none' }}
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
      <div className="card" style={{ padding: '0', borderRadius: '16px', border: '1px solid var(--border-card)', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-card)', color: 'var(--text-dim)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>STUDENT</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>DEPARTMENT</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>YEAR</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>SUCCESS SCORE</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>ATTENDANCE</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>GPA</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>CODING</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>ACADEMIC RISK</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>PLACEMENT RISK</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>SEGMENT</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, rIdx) => (
                  <tr key={`skel-${rIdx}`} style={{ borderBottom: '1px solid var(--border-card)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div className="skeleton-pulse" style={{ width: '120px', height: '14px', borderRadius: '4px', marginBottom: '6px' }} />
                      <div className="skeleton-pulse" style={{ width: '80px', height: '10px', borderRadius: '4px' }} />
                    </td>
                    <td style={{ padding: '14px 16px' }}><div className="skeleton-pulse" style={{ width: '80px', height: '14px', borderRadius: '4px' }} /></td>
                    <td style={{ padding: '14px 16px' }}><div className="skeleton-pulse" style={{ width: '40px', height: '14px', borderRadius: '4px' }} /></td>
                    <td style={{ padding: '14px 16px' }}><div className="skeleton-pulse" style={{ width: '50px', height: '14px', borderRadius: '4px' }} /></td>
                    <td style={{ padding: '14px 16px' }}><div className="skeleton-pulse" style={{ width: '40px', height: '14px', borderRadius: '4px' }} /></td>
                    <td style={{ padding: '14px 16px' }}><div className="skeleton-pulse" style={{ width: '35px', height: '14px', borderRadius: '4px' }} /></td>
                    <td style={{ padding: '14px 16px' }}><div className="skeleton-pulse" style={{ width: '40px', height: '14px', borderRadius: '4px' }} /></td>
                    <td style={{ padding: '14px 16px' }}><div className="skeleton-pulse" style={{ width: '55px', height: '18px', borderRadius: '10px' }} /></td>
                    <td style={{ padding: '14px 16px' }}><div className="skeleton-pulse" style={{ width: '55px', height: '18px', borderRadius: '10px' }} /></td>
                    <td style={{ padding: '14px 16px' }}><div className="skeleton-pulse" style={{ width: '90px', height: '14px', borderRadius: '4px' }} /></td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}><div className="skeleton-pulse" style={{ width: '60px', height: '24px', borderRadius: '6px', marginLeft: 'auto' }} /></td>
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: '24px' }}>
                    <EmptyState
                      icon={Search}
                      title="No students match the criteria"
                      description={search ? `No student records found matching "${search}". Try clearing search keywords or loosening filters.` : "No student records found for the selected department or segment filters."}
                      actionLabel="Reset All Filters"
                      onAction={() => {
                        setSearch('');
                        setSelectedDept('All');
                        setSelectedYear('All');
                        setSelectedSegment('All');
                        setSelectedAcadRisk('All');
                        setSelectedPlaceRisk('All');
                        setPage(1);
                      }}
                    />
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student.studentId}
                    style={{
                      borderBottom: '1px solid var(--border-card)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <Link to={`/campusiq/students/${student.studentId}`} style={{ fontWeight: 700, color: 'var(--text-main)', textDecoration: 'none' }}>
                        {student.name}
                      </Link>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                        {student.studentId}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                      {student.department}
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--text-main)' }}>
                      Year {student.year}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          color: (student.computed?.successScore ?? 0) >= 70 ? 'var(--accent-emerald)' : (student.computed?.successScore ?? 0) >= 55 ? 'var(--accent-amber)' : 'var(--primary-hover)',
                        }}
                      >
                        {student.computed?.successScore ?? '—'}/100
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: (student.academic?.attendancePercentage ?? 100) >= 75 ? 'var(--text-main)' : 'var(--accent-amber)' }}>
                        {student.academic?.attendancePercentage !== null ? `${student.academic?.attendancePercentage}%` : '—'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--text-main)' }}>
                      {student.academic?.gpa !== null ? student.academic?.gpa : '—'}
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--text-main)' }}>
                      {student.placement?.codingScore !== null ? student.placement?.codingScore : '—'}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${student.computed?.academicRisk?.level === 'Critical' ? 'badge-danger' : student.computed?.academicRisk?.level === 'High' ? 'badge-warning' : 'badge-primary'}`}>
                        {student.computed?.academicRisk?.level || 'Low'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${student.computed?.placementRisk?.level === 'Critical' ? 'badge-danger' : student.computed?.placementRisk?.level === 'High' ? 'badge-warning' : 'badge-primary'}`}>
                        {student.computed?.placementRisk?.level || 'Low'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {student.computed?.segment || 'High Performers'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <Link
                        to={`/campusiq/students/${student.studentId}`}
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '11.5px' }}
                      >
                        <span>Profile</span>
                        <ChevronRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-card)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            Page {page} of {totalPages}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="btn btn-secondary"
              style={{ padding: '5px 10px', fontSize: '12px' }}
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="btn btn-secondary"
              style={{ padding: '5px 10px', fontSize: '12px' }}
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
