import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Filter,
  Search,
  User,
  Calendar,
  ChevronRight,
  TrendingUp,
  X,
  RefreshCw,
  FileText,
  Target,
  Sparkles,
  Award,
} from 'lucide-react';
import {
  getInterventions,
  createIntervention,
  updateIntervention,
  getStudents,
} from '../../services/campusiqApi';

export default function CampusIQInterventionsPage() {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState(null);

  // New intervention form state
  const [studentsList, setStudentsList] = useState([]);
  const [newStudentId, setNewStudentId] = useState('');
  const [newConcernTitle, setNewConcernTitle] = useState('');
  const [newConcernType, setNewConcernType] = useState('academic');
  const [newCategory, setNewCategory] = useState('Academic Remedial');
  const [newAction, setNewAction] = useState('');
  const [newPriority, setNewPriority] = useState('High');
  const [newMentor, setNewMentor] = useState('Dr. S. Sharma');
  const [submitting, setSubmitting] = useState(false);

  // Update modal form state
  const [updateStatus, setUpdateStatus] = useState('Completed');
  const [updateNote, setUpdateNote] = useState('');
  const [followUpAttendance, setFollowUpAttendance] = useState('');
  const [followUpCoding, setFollowUpCoding] = useState('');
  const [followUpScore, setFollowUpScore] = useState('');

  const fetchInterventionsList = async () => {
    setLoading(true);
    try {
      const res = await getInterventions({
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter,
      });
      if (res.data?.success) {
        setInterventions(res.data.interventions || []);
      }
    } catch (err) {
      console.error('Error fetching interventions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventionsList();
  }, [statusFilter, priorityFilter, categoryFilter]);

  // Load students for selector
  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await getStudents({ limit: 100 });
        if (res.data?.students) {
          setStudentsList(res.data.students);
          if (res.data.students.length > 0) {
            setNewStudentId(res.data.students[0].studentId);
          }
        }
      } catch (err) {
        console.error('Error loading students for intervention create:', err);
      }
    }
    loadStudents();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newStudentId || !newConcernTitle || !newAction) return;

    setSubmitting(true);
    try {
      const payload = {
        studentId: newStudentId,
        concernTitle: newConcernTitle,
        concernType: newConcernType,
        actionCategory: newCategory,
        recommendedAction: newAction,
        priority: newPriority,
        mentorAssigned: newMentor,
      };

      const res = await createIntervention(payload);
      if (res.data?.success) {
        setShowCreateModal(false);
        setNewConcernTitle('');
        setNewAction('');
        fetchInterventionsList();
      }
    } catch (err) {
      console.error('Error creating intervention:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIntervention) return;

    setSubmitting(true);
    try {
      const payload = {
        status: updateStatus,
        note: updateNote,
      };

      if (followUpAttendance || followUpCoding || followUpScore) {
        payload.followUpIndicators = {};
        if (followUpAttendance) payload.followUpIndicators.attendance = Number(followUpAttendance);
        if (followUpCoding) payload.followUpIndicators.codingScore = Number(followUpCoding);
        if (followUpScore) payload.followUpIndicators.successScore = Number(followUpScore);
      }

      const res = await updateIntervention(selectedIntervention.interventionId, payload);
      if (res.data?.success) {
        setShowUpdateModal(false);
        setSelectedIntervention(null);
        setUpdateNote('');
        setFollowUpAttendance('');
        setFollowUpCoding('');
        setFollowUpScore('');
        fetchInterventionsList();
      }
    } catch (err) {
      console.error('Error updating intervention:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered interventions
  const filtered = interventions.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.studentName?.toLowerCase().includes(q) ||
      item.studentId?.toLowerCase().includes(q) ||
      item.interventionId?.toLowerCase().includes(q) ||
      item.concernTitle?.toLowerCase().includes(q)
    );
  });

  const totalCount = interventions.length;
  const inProgressCount = interventions.filter((i) => i.status === 'In-Progress').length;
  const completedCount = interventions.filter((i) => i.status === 'Completed').length;
  const pendingCount = interventions.filter((i) => i.status === 'Pending').length;

  return (
    <div className="page-container" style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', background: 'var(--primary-light)', color: 'var(--primary-hover)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              CampusIQ • Action Intelligence
            </span>
            <span style={{ color: 'var(--border-card)' }}>/</span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Human-in-the-Loop Interventions</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Intervention Management & Outcomes
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Track targeted academic tutorials, placement bootcamps, and counseling actions from assignment to resolution
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-secondary))',
            border: 'none',
            borderRadius: '10px',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(139, 0, 0, 0.4)',
          }}
        >
          <Plus size={16} />
          <span>Assign New Intervention</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Interventions</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>{totalCount}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>Across all campus cohorts</div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--primary-border)', borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--primary-hover)', marginBottom: '4px' }}>Active In-Progress</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-hover)' }}>{inProgressCount}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>Under mentor supervision</div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#fcd34d', marginBottom: '4px' }}>Pending Assignment</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b' }}>{pendingCount}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>Awaiting faculty review</div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#6ee7b7', marginBottom: '4px' }}>Completed & Resolved</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>{completedCount}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>Post-outcome verified</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: '14px',
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-card)', width: '260px' }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by student or action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '12px',
              outline: 'none',
              width: '100%',
            }}
          />
        </div>

        {/* Dropdown Filters */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-main)',
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '12px',
              outline: 'none',
            }}
          >
            <option value="All" style={{ background: '#0D0D0D' }}>All Statuses</option>
            <option value="In-Progress" style={{ background: '#0D0D0D' }}>In-Progress</option>
            <option value="Pending" style={{ background: '#0D0D0D' }}>Pending</option>
            <option value="Completed" style={{ background: '#0D0D0D' }}>Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-main)',
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '12px',
              outline: 'none',
            }}
          >
            <option value="All" style={{ background: '#0D0D0D' }}>All Priorities</option>
            <option value="Critical" style={{ background: '#0D0D0D' }}>Critical</option>
            <option value="High" style={{ background: '#0D0D0D' }}>High</option>
            <option value="Medium" style={{ background: '#0D0D0D' }}>Medium</option>
            <option value="Low" style={{ background: '#0D0D0D' }}>Low</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-main)',
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '12px',
              outline: 'none',
            }}
          >
            <option value="All" style={{ background: '#0D0D0D' }}>All Categories</option>
            <option value="Academic Remedial" style={{ background: '#0D0D0D' }}>Academic Remedial</option>
            <option value="Placement Accelerator" style={{ background: '#0D0D0D' }}>Placement Accelerator</option>
            <option value="Attendance Recovery" style={{ background: '#0D0D0D' }}>Attendance Recovery</option>
            <option value="1-on-1 Mentorship" style={{ background: '#0D0D0D' }}>1-on-1 Mentorship</option>
            <option value="Wellness Support" style={{ background: '#0D0D0D' }}>Wellness Support</option>
          </select>

          <button
            onClick={fetchInterventionsList}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-card)',
              borderRadius: '8px',
              color: 'var(--text-main)',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} style={{ color: 'var(--primary-hover)' }} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Interventions Table / Cards */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>ACTION ID & STUDENT</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>CONCERN & RECOMMENDED ACTION</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>CATEGORY & PRIORITY</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>MENTOR & DATES</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>OBSERVED OUTCOME</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No interventions found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isCompleted = item.status === 'Completed';
                  const isPending = item.status === 'Pending';

                  return (
                    <tr
                      key={item.interventionId}
                      style={{
                        borderBottom: '1px solid #201515',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      {/* ID & Student */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--primary-hover)', fontWeight: 700 }}>
                          {item.interventionId}
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                          {item.studentName}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                          {item.studentId} • {item.department}
                        </div>
                      </td>

                      {/* Concern & Action */}
                      <td style={{ padding: '14px 16px', maxWidth: '300px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                          {item.concernTitle}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {item.recommendedAction}
                        </div>
                      </td>

                      {/* Category & Priority */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 700,
                            background: 'var(--primary-light)',
                            color: 'var(--primary-hover)',
                            border: '1px solid var(--primary-border)',
                            marginBottom: '4px',
                          }}
                        >
                          {item.actionCategory}
                        </span>
                        <div>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color:
                                item.priority === 'Critical'
                                  ? 'var(--primary-hover)'
                                  : item.priority === 'High'
                                  ? '#f97316'
                                  : '#10b981',
                            }}
                          >
                            ● {item.priority} Priority
                          </span>
                        </div>
                      </td>

                      {/* Mentor & Dates */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.mentorAssigned}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: isCompleted
                              ? 'rgba(16, 185, 129, 0.15)'
                              : isPending
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'var(--primary-light)',
                            color: isCompleted ? '#10b981' : isPending ? '#f59e0b' : 'var(--primary-hover)',
                            border: `1px solid ${isCompleted ? 'rgba(16, 185, 129, 0.3)' : isPending ? 'rgba(245, 158, 11, 0.3)' : 'var(--primary-border)'}`,
                          }}
                        >
                          {isCompleted ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          <span>{item.status}</span>
                        </span>
                      </td>

                      {/* Observed Outcome */}
                      <td style={{ padding: '14px 16px', maxWidth: '200px' }}>
                        {item.observedChanges?.qualitativeSummary ? (
                          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
                            {item.observedChanges.qualitativeSummary}
                          </div>
                        ) : (
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                            Awaiting follow-up assessment
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            setSelectedIntervention(item);
                            setUpdateStatus(item.status);
                            setShowUpdateModal(true);
                          }}
                          style={{
                            padding: '6px 12px',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-card)',
                            borderRadius: '6px',
                            color: 'var(--text-main)',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Update / Follow-up
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Create Intervention */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '24px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={20} color="var(--primary-hover)" />
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Assign Targeted Intervention
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Student Picker */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Target Student
                </label>
                <select
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  {studentsList.map((st) => (
                    <option key={st.studentId} value={st.studentId} style={{ background: '#0D0D0D' }}>
                      {st.name} ({st.studentId} - {st.department}) • Score: {st.computed?.successScore}
                    </option>
                  ))}
                </select>
              </div>

              {/* Concern Title */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Concern Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Critical Attendance Deficit or Data Structures Lag"
                  value={newConcernTitle}
                  onChange={(e) => setNewConcernTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Grid: Category & Priority */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Action Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-card)',
                      color: 'var(--text-main)',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  >
                    <option value="Academic Remedial" style={{ background: '#0D0D0D' }}>Academic Remedial</option>
                    <option value="Placement Accelerator" style={{ background: '#0D0D0D' }}>Placement Accelerator</option>
                    <option value="Attendance Recovery" style={{ background: '#0D0D0D' }}>Attendance Recovery</option>
                    <option value="1-on-1 Mentorship" style={{ background: '#0D0D0D' }}>1-on-1 Mentorship</option>
                    <option value="Wellness Support" style={{ background: '#0D0D0D' }}>Wellness Support</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Priority Level
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-card)',
                      color: 'var(--text-main)',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  >
                    <option value="Critical" style={{ background: '#0D0D0D' }}>Critical</option>
                    <option value="High" style={{ background: '#0D0D0D' }}>High</option>
                    <option value="Medium" style={{ background: '#0D0D0D' }}>Medium</option>
                    <option value="Low" style={{ background: '#0D0D0D' }}>Low</option>
                  </select>
                </div>
              </div>

              {/* Recommended Action */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Recommended Action Specification
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail the actionable remediation steps, required sessions, and target outcomes..."
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Mentor */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Assigning Mentor / Faculty Lead
                </label>
                <input
                  type="text"
                  value={newMentor}
                  onChange={(e) => setNewMentor(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '10px 16px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-muted)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-secondary))',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    boxShadow: '0 4px 14px rgba(139, 0, 0, 0.4)',
                  }}
                >
                  {submitting ? 'Creating...' : 'Confirm & Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Update / Follow-up */}
      {showUpdateModal && selectedIntervention && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Update Intervention Status & Outcome
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {selectedIntervention.interventionId} • {selectedIntervention.studentName}
                </div>
              </div>
              <button
                onClick={() => setShowUpdateModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Intervention Status
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  <option value="Completed" style={{ background: '#0D0D0D' }}>Completed (Outcome Achieved)</option>
                  <option value="In-Progress" style={{ background: '#0D0D0D' }}>In-Progress (Continuing Action)</option>
                  <option value="Pending" style={{ background: '#0D0D0D' }}>Pending (Under Initial Review)</option>
                </select>
              </div>

              {/* Follow-up Measured Indicators */}
              <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-hover)', marginBottom: '10px' }}>
                  Record Measured Follow-Up Indicators (Optional)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Follow-up Att %
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 78"
                      value={followUpAttendance}
                      onChange={(e) => setFollowUpAttendance(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-card)', border: '1px solid var(--border-card)', color: 'var(--text-main)', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Follow-up Coding
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 62"
                      value={followUpCoding}
                      onChange={(e) => setFollowUpCoding(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-card)', border: '1px solid var(--border-card)', color: 'var(--text-main)', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Success Score
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 70"
                      value={followUpScore}
                      onChange={(e) => setFollowUpScore(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-card)', border: '1px solid var(--border-card)', color: 'var(--text-main)', fontSize: '12px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Progress Note */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Mentor / Reviewer Note
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Student completed all 4 DSA remedial sessions. Midterm coding score rose from 35 to 62."
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  style={{
                    padding: '10px 16px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-muted)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-secondary))',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    boxShadow: '0 4px 14px rgba(139, 0, 0, 0.4)',
                  }}
                >
                  {submitting ? 'Saving...' : 'Save & Record Outcome'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
