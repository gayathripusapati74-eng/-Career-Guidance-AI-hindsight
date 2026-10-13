import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Send,
  Brain,
  Sparkles,
  Bot,
  User as UserIcon,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Shield,
  CheckCircle2,
  Clock,
  Calendar,
  ListTodo,
  Plus,
  Check,
  X,
  AlertTriangle,
  GraduationCap,
  Briefcase,
  ExternalLink,
} from 'lucide-react';

// Persona-specific suggested prompt chips
const ROLE_SUGGESTIONS = {
  student: [
    { label: 'Analyze my current performance', icon: Sparkles },
    { label: 'Why is my Student Success Score low?', icon: AlertTriangle },
    { label: 'How many classes do I need to reach 75% attendance?', icon: Clock },
    { label: 'Create a 30-day placement preparation plan', icon: Briefcase },
    { label: 'Show my pending academic tasks and deadlines', icon: ListTodo },
  ],
  faculty: [
    { label: 'What are my priority tasks today? (Work Planner)', icon: ListTodo },
    { label: 'Which students have attendance below 75%?', icon: AlertTriangle },
    { label: 'Remind me Friday to follow up with coding assessment defaulters', icon: Clock },
    { label: 'Prepare a weekly student progress report for my assigned class', icon: Sparkles },
    { label: 'Which assigned students need immediate academic support?', icon: Shield },
  ],
  admin: [
    { label: 'What percentage of students are currently classified as high risk?', icon: AlertTriangle },
    { label: 'Which departments need additional academic support?', icon: Shield },
    { label: 'Are interventions improving attendance and academic outcomes?', icon: CheckCircle2 },
    { label: 'Summarize campus-wide institutional priorities', icon: Sparkles },
  ],
};

export default function ChatPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedMemoryId, setExpandedMemoryId] = useState(null);
  const [showPlanner, setShowPlanner] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [pendingRemindersCount, setPendingRemindersCount] = useState(0);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderPriority, setNewReminderPriority] = useState('medium');
  const [newReminderCategory, setNewReminderCategory] = useState('academic');
  const [addingReminder, setAddingReminder] = useState(false);
  const messagesEndRef = useRef(null);

  const role = user?.role || 'student';
  const suggestions = ROLE_SUGGESTIONS[role] || ROLE_SUGGESTIONS.student;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch reminders for active user
  const fetchReminders = async () => {
    try {
      const res = await api.get('/reminders');
      if (res.data?.success) {
        setReminders(res.data.reminders || []);
        setPendingRemindersCount(res.data.pendingCount || 0);
      }
    } catch (e) {
      console.warn('Could not load reminders');
    }
  };

  // Load chat history & initial greeting
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.get('/ai/chat/history');
        if (res.data?.success && res.data.messages.length > 0) {
          setMessages(res.data.messages);
        } else {
          let roleTitle = 'AI Student Success Copilot';
          let welcomeContext = '';

          if (role === 'student') {
            roleTitle = `Student AI Copilot (${user?.studentId || 'STU2026-001'})`;
            welcomeContext = `I have loaded your verified academic and placement records. You can ask me to **analyze your performance**, **calculate classes needed for 75% attendance**, or **build a 30-day placement sprint**.`;
          } else if (role === 'faculty') {
            roleTitle = `Faculty AI Work Assistant (${user?.assignedMentor || user?.firstName})`;
            welcomeContext = `Connected to your mentee cohort in **${user?.department || 'Computer Science & Engineering'}**. Ask me for your **Daily Work Planner**, **attendance alerts (<75%)**, or say *"Remind me Friday to follow up on coding tests"* to auto-schedule tasks.`;
          } else {
            roleTitle = 'Institutional AI Decision Assistant';
            welcomeContext = `Accessing institution-wide analytics across 200 enrolled students. Ask me for **high-risk distributions**, **cross-department benchmarks**, and **intervention outcomes**.`;
          }

          setMessages([
            {
              sender: 'ai',
              text: `### Welcome, ${user?.firstName || 'User'}! 👋\n\nI am your **CampusIQ ${roleTitle}**, powered by **Hindsight Long-term Memory**.\n\n${welcomeContext}\n\n*Select a prompt chip above or ask any question below.*`,
              metricCards: [],
              quickActions: [],
              createdAt: new Date(),
            },
          ]);
        }
      } catch (err) {
        console.warn('Could not load chat history');
      }
    }
    loadHistory();
    fetchReminders();
  }, [user, role]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      sender: 'user',
      text: textToSend.trim(),
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: textToSend });
      if (res.data?.success) {
        const aiMsg = {
          _id: res.data.messageId,
          sender: 'ai',
          text: res.data.reply,
          metricCards: res.data.metricCards || [],
          quickActions: res.data.quickActions || [],
          createdReminder: res.data.createdReminder,
          memoriesRecalled: res.data.memoriesRecalled || [],
          retainedMemory: res.data.retainedMemory,
          hindsightConfigured: res.data.hindsightConfigured,
          liveLlm: res.data.liveLlm,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);

        // If a reminder was created, refresh reminders drawer
        if (res.data.createdReminder) {
          fetchReminders();
        }

        if (aiMsg.memoriesRecalled && aiMsg.memoriesRecalled.length > 0) {
          setExpandedMemoryId(aiMsg._id);
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `⚠️ **Error Processing Request:** ${err.response?.data?.message || err.message}`,
          createdAt: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear conversation view? (Your memories in Hindsight Cloud remain preserved)')) return;
    try {
      await api.delete('/ai/chat/history');
      setMessages([
        {
          sender: 'ai',
          text: `Conversation view cleared. All long-term memories in your Hindsight bank \`${user?.hindsightBankId}\` and your Work Planner remain intact.`,
          createdAt: new Date(),
        },
      ]);
    } catch (e) {
      console.warn('Failed to clear chat view');
    }
  };

  const handleToggleReminder = async (id) => {
    try {
      const res = await api.patch(`/reminders/${id}/toggle`);
      if (res.data?.success) {
        fetchReminders();
      }
    } catch (err) {
      console.warn('Failed to toggle reminder');
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      const res = await api.delete(`/reminders/${id}`);
      if (res.data?.success) {
        fetchReminders();
      }
    } catch (err) {
      console.warn('Failed to delete reminder');
    }
  };

  const handleCreateReminderSubmit = async (e) => {
    e.preventDefault();
    if (!newReminderTitle.trim()) return;
    try {
      setAddingReminder(true);
      const res = await api.post('/reminders', {
        title: newReminderTitle.trim(),
        category: newReminderCategory,
        priority: newReminderPriority,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      });
      if (res.data?.success) {
        setNewReminderTitle('');
        fetchReminders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create reminder');
    } finally {
      setAddingReminder(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 90px)',
        backgroundColor: '#080808',
        color: '#F5F5F5',
        margin: '-24px',
        padding: '20px 28px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '14px',
          borderBottom: '1px solid #241416',
          marginBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8B0000 0%, #A31520 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(139, 0, 0, 0.4)',
            }}
          >
            <Bot size={22} color="#FFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#F5F5F5', margin: 0 }}>
                CampusIQ AI Student Success Copilot
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(139, 0, 0, 0.2)',
                  color: '#FF6B6B',
                  border: '1px solid rgba(139, 0, 0, 0.4)',
                }}
              >
                {role === 'student' ? '🎓 Student Mode' : role === 'faculty' ? '👨‍🏫 Faculty Work Copilot' : '🏛️ Admin Ops'}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10B981',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                <Brain size={12} />
                <span>Hindsight Active</span>
              </span>
            </div>
            <p style={{ color: '#857A7A', fontSize: '12px', margin: '2px 0 0 0' }}>
              {role === 'student'
                ? `Authenticated: ${user?.firstName} ${user?.lastName} (${user?.studentId || 'STU2026-001'}) • FERPA privacy protected`
                : role === 'faculty'
                ? `Assigned: ${user?.assignedMentor || user?.firstName} • Department: ${user?.department || 'CSE'}`
                : `Executive Access • Campus-wide predictive analytics across 200 benchmark students`}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowPlanner(!showPlanner)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: showPlanner ? '#8B0000' : '#151010',
              color: '#FFF',
              border: '1px solid #352020',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <ListTodo size={14} />
            <span>Work Planner & Reminders</span>
            {pendingRemindersCount > 0 && (
              <span
                style={{
                  background: '#EF4444',
                  color: '#FFF',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '999px',
                }}
              >
                {pendingRemindersCount}
              </span>
            )}
          </button>

          <button
            onClick={handleClear}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#151010',
              color: '#B8B0B0',
              border: '1px solid #352020',
              cursor: 'pointer',
            }}
            title="Clear Chat View"
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '10px',
          marginBottom: '10px',
          scrollbarWidth: 'none',
        }}
      >
        {suggestions.map((s, i) => {
          const IconComp = s.icon;
          return (
            <button
              key={i}
              onClick={() => handleSend(s.label)}
              style={{
                fontSize: '12px',
                padding: '6px 14px',
                borderRadius: '999px',
                background: '#151010',
                border: '1px solid #352020',
                color: '#E5E5E5',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1E1214';
                e.currentTarget.style.borderColor = '#8B0000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#151010';
                e.currentTarget.style.borderColor = '#352020';
              }}
            >
              <IconComp size={12} color="#C62828" />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Workspace Layout (Chat Area + Reminders Drawer) */}
      <div style={{ display: 'flex', flex: 1, gap: '16px', overflow: 'hidden' }}>
        {/* Messages Stream */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            background: '#0D0D0D',
            borderRadius: '12px',
            border: '1px solid #241416',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {messages.map((m, idx) => {
            const isUser = m.sender === 'user';
            const hasMemories = m.memoriesRecalled && m.memoriesRecalled.length > 0;
            const isExpanded = expandedMemoryId === (m._id || idx);

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '100%',
                }}
              >
                {/* Bubble Container */}
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    maxWidth: isUser ? '80%' : '88%',
                    flexDirection: isUser ? 'row-reverse' : 'row',
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      flexShrink: 0,
                      background: isUser
                        ? 'linear-gradient(135deg, #8B0000 0%, #A31520 100%)'
                        : 'linear-gradient(135deg, #1C1112 0%, #291518 100%)',
                      border: isUser ? '1px solid #C62828' : '1px solid #352020',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF',
                    }}
                  >
                    {isUser ? <UserIcon size={16} /> : <Bot size={16} color="#FF6B6B" />}
                  </div>

                  {/* Message Card */}
                  <div
                    style={{
                      background: isUser ? '#1C1112' : '#151010',
                      border: isUser ? '1px solid #8B0000' : '1px solid #352020',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      color: '#F5F5F5',
                      fontSize: '13.5px',
                      lineHeight: '1.65',
                      boxShadow: '0 4px 18px rgba(0,0,0,0.45)',
                    }}
                  >
                    {/* Render Text Content */}
                    <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>

                    {/* Metric Cards Grid (if returned by Copilot) */}
                    {m.metricCards && m.metricCards.length > 0 && (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                          gap: '10px',
                          marginTop: '14px',
                          paddingTop: '12px',
                          borderTop: '1px solid #241416',
                        }}
                      >
                        {m.metricCards.map((card, ci) => {
                          const statusColor =
                            card.status === 'success'
                              ? '#10B981'
                              : card.status === 'danger'
                              ? '#EF4444'
                              : card.status === 'warning'
                              ? '#F59E0B'
                              : '#94A3B8';
                          return (
                            <div
                              key={ci}
                              style={{
                                background: '#0D0D0D',
                                border: '1px solid #241416',
                                borderRadius: '8px',
                                padding: '10px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                              }}
                            >
                              <span style={{ fontSize: '11px', color: '#857A7A', fontWeight: 600 }}>
                                {card.label}
                              </span>
                              <span style={{ fontSize: '15px', fontWeight: 800, color: statusColor }}>
                                {card.value}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Quick Action Navigation Buttons */}
                    {m.quickActions && m.quickActions.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          marginTop: '14px',
                          paddingTop: '12px',
                          borderTop: '1px solid #241416',
                        }}
                      >
                        {m.quickActions.map((qa, qi) => (
                          <button
                            key={qi}
                            onClick={() => navigate(qa.path)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              background: '#1C1112',
                              border: '1px solid #8B0000',
                              color: '#FFF',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#8B0000';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#1C1112';
                            }}
                          >
                            <span>{qa.label}</span>
                            <ArrowRight size={12} />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Persistent Reminder Confirmation Badge */}
                    {m.createdReminder && (
                      <div
                        style={{
                          marginTop: '12px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'rgba(16, 185, 129, 0.12)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle2 size={16} color="#10B981" />
                          <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>
                            Scheduled in persistent Work Planner: "{m.createdReminder.title}"
                          </span>
                        </div>
                        <button
                          onClick={() => setShowPlanner(true)}
                          style={{
                            background: '#10B981',
                            color: '#000',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          View Planner
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hindsight Retained Badge for User message */}
                {m.retainedMemory && m.retainedMemory.success && (
                  <div
                    style={{
                      marginTop: '4px',
                      marginRight: '46px',
                      fontSize: '11px',
                      color: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Brain size={12} />
                    <span>Retained in Hindsight Memory Bank</span>
                  </div>
                )}

                {/* Hindsight Recalled Memory Accordion for AI Message */}
                {!isUser && hasMemories && (
                  <div
                    style={{
                      marginLeft: '46px',
                      marginTop: '6px',
                      maxWidth: '85%',
                      background: '#151010',
                      border: '1px solid #352020',
                      borderRadius: '8px',
                      padding: '8px 12px',
                    }}
                  >
                    <div
                      onClick={() => setExpandedMemoryId(isExpanded ? null : (m._id || idx))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#FF6B6B',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Brain size={13} color="#C62828" />
                        <span>{m.memoriesRecalled.length} Hindsight Long-term Memories Injected</span>
                      </div>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #241416' }}>
                        <div style={{ fontSize: '11px', color: '#857A7A', marginBottom: '6px' }}>
                          Verified user facts retrieved from your persistent Hindsight bank:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {m.memoriesRecalled.map((mem, mi) => (
                            <div
                              key={mi}
                              style={{
                                fontSize: '11px',
                                padding: '6px 10px',
                                background: '#0D0D0D',
                                borderRadius: '6px',
                                borderLeft: '2px solid #8B0000',
                                color: '#D4D4D4',
                              }}
                            >
                              {mem.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '6px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1C1112 0%, #291518 100%)',
                  border: '1px solid #352020',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FF6B6B',
                }}
              >
                <Bot size={16} />
              </div>
              <div
                style={{
                  padding: '12px 18px',
                  background: '#151010',
                  border: '1px solid #352020',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#B8B0B0',
                  fontSize: '13px',
                }}
              >
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    border: '2px solid #8B0000',
                    borderTopColor: 'transparent',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                <span>Analyzing student records, computing attendance math & synthesizing plan...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reminders & Work Planner Side Drawer */}
        {showPlanner && (
          <div
            style={{
              width: '360px',
              background: '#0D0D0D',
              borderRadius: '12px',
              border: '1px solid #241416',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid #241416',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ListTodo size={16} color="#FF6B6B" />
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#FFF' }}>
                  Persistent Work Planner
                </h3>
              </div>
              <button
                onClick={() => setShowPlanner(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#857A7A',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleCreateReminderSubmit} style={{ padding: '12px 16px', borderBottom: '1px solid #241416' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="New task title..."
                  value={newReminderTitle}
                  onChange={(e) => setNewReminderTitle(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: '#151010',
                    border: '1px solid #352020',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                />
                <button
                  type="submit"
                  disabled={addingReminder || !newReminderTitle.trim()}
                  style={{
                    padding: '0 12px',
                    borderRadius: '6px',
                    background: '#8B0000',
                    border: 'none',
                    color: '#FFF',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  <Plus size={14} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={newReminderCategory}
                  onChange={(e) => setNewReminderCategory(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '4px 8px',
                    background: '#151010',
                    border: '1px solid #352020',
                    color: '#B8B0B0',
                    borderRadius: '4px',
                    fontSize: '11px',
                  }}
                >
                  <option value="academic">Academic</option>
                  <option value="attendance">Attendance</option>
                  <option value="mentoring">Mentoring</option>
                  <option value="placement">Placement</option>
                </select>
                <select
                  value={newReminderPriority}
                  onChange={(e) => setNewReminderPriority(e.target.value)}
                  style={{
                    width: '90px',
                    padding: '4px 8px',
                    background: '#151010',
                    border: '1px solid #352020',
                    color: '#B8B0B0',
                    borderRadius: '4px',
                    fontSize: '11px',
                  }}
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </form>

            {/* Reminders List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {reminders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#857A7A', fontSize: '12px' }}>
                  No active tasks. Say "Remind me Friday to..." in the chat or use the box above.
                </div>
              ) : (
                reminders.map((r) => {
                  const isDone = r.isCompleted;
                  return (
                    <div
                      key={r._id || r.id}
                      style={{
                        background: '#151010',
                        border: isDone ? '1px solid #1C1112' : '1px solid #352020',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        opacity: isDone ? 0.6 : 1,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
                          <button
                            onClick={() => handleToggleReminder(r._id || r.id)}
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              background: isDone ? '#10B981' : 'transparent',
                              border: isDone ? '1px solid #10B981' : '1px solid #666',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              padding: 0,
                              marginTop: '2px',
                              flexShrink: 0,
                            }}
                          >
                            {isDone && <Check size={12} color="#000" />}
                          </button>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: '12.5px',
                                fontWeight: 600,
                                color: isDone ? '#857A7A' : '#FFF',
                                textDecoration: isDone ? 'line-through' : 'none',
                              }}
                            >
                              {r.title}
                            </div>
                            {r.description && (
                              <div style={{ fontSize: '11px', color: '#857A7A', marginTop: '2px' }}>
                                {r.description}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteReminder(r._id || r.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#666',
                            cursor: 'pointer',
                            padding: '2px',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span
                            style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background:
                                r.priority === 'urgent'
                                  ? 'rgba(239, 68, 68, 0.2)'
                                  : r.priority === 'high'
                                  ? 'rgba(245, 158, 11, 0.2)'
                                  : 'rgba(59, 130, 246, 0.2)',
                              color:
                                r.priority === 'urgent'
                                  ? '#EF4444'
                                  : r.priority === 'high'
                                  ? '#F59E0B'
                                  : '#60A5FA',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                            }}
                          >
                            {r.priority}
                          </span>
                          <span style={{ fontSize: '10px', color: '#857A7A' }}>
                            {r.category}
                          </span>
                        </div>
                        {r.dueDate && (
                          <span style={{ fontSize: '10px', color: '#857A7A', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={10} />
                            <span>{new Date(r.dueDate).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{
          display: 'flex',
          gap: '12px',
          marginTop: '14px',
        }}
      >
        <input
          type="text"
          placeholder={
            role === 'student'
              ? "Ask Copilot: 'Analyze my performance', 'Classes needed for 75% attendance', '30-day placement plan'..."
              : role === 'faculty'
              ? "Ask Work Copilot: 'Generate my Daily Work Planner', 'Students below 75% attendance', 'Remind me Friday to follow up'..."
              : "Ask Decision Copilot: 'Percentage of high risk students', 'Compare departments', 'Intervention outcomes'..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{
            flex: 1,
            padding: '14px 20px',
            borderRadius: '10px',
            background: '#0D0D0D',
            border: '1px solid #352020',
            color: '#F5F5F5',
            fontSize: '13.5px',
            outline: 'none',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)',
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          style={{
            padding: '0 24px',
            borderRadius: '10px',
            background: !input.trim() || loading ? '#352020' : 'linear-gradient(135deg, #8B0000 0%, #A31520 100%)',
            border: 'none',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(139,0,0,0.4)',
          }}
        >
          <Send size={16} />
          <span>Send</span>
        </button>
      </form>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
