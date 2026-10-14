import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Career Guidance & Hindsight Pages (100% Preserved)
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import SkillsPage from './pages/SkillsPage';
import ResumePage from './pages/ResumePage';
import RoadmapPage from './pages/RoadmapPage';
import QuizPage from './pages/QuizPage';
import InterviewPage from './pages/InterviewPage';
import JobsPage from './pages/JobsPage';
import ProgressPage from './pages/ProgressPage';
import StatusPage from './pages/StatusPage';

// CampusIQ — Role-Specific Dashboards
import AdminDashboardPage from './pages/roles/AdminDashboardPage';
import FacultyDashboardPage from './pages/roles/FacultyDashboardPage';
import StudentDashboardPage from './pages/roles/StudentDashboardPage';
import ManagementDashboardPage from './pages/roles/ManagementDashboardPage';
import HODDashboardPage from './pages/roles/HODDashboardPage';
import SystemAdminDashboardPage from './pages/roles/SystemAdminDashboardPage';

// CampusIQ — Analytics & Success Intelligence Suite
import CampusIQDashboardPage from './pages/campusiq/CampusIQDashboardPage';
import CampusIQEarlyWarningPage from './pages/campusiq/CampusIQEarlyWarningPage';
import CampusIQStudentsPage from './pages/campusiq/CampusIQStudentsPage';
import CampusIQStudentProfilePage from './pages/campusiq/CampusIQStudentProfilePage';
import CampusIQSegmentsPage from './pages/campusiq/CampusIQSegmentsPage';
import CampusIQSimulatorPage from './pages/campusiq/CampusIQSimulatorPage';
import CampusIQInterventionsPage from './pages/campusiq/CampusIQInterventionsPage';
import CampusIQImpactAnalyticsPage from './pages/campusiq/CampusIQImpactAnalyticsPage';
import CampusIQDataHubPage from './pages/campusiq/CampusIQDataHubPage';
import CampusIQReportsPage from './pages/campusiq/CampusIQReportsPage';

// Component that dynamically routes authenticated users to their permitted dashboard, or to /login if unauthenticated
function RoleDashboardRedirect() {
  const { currentRole, getRoleDashboardPath, isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#080808' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px auto', borderTopColor: '#8B0000' }}></div>
          <p style={{ color: '#F5F5F5', fontSize: '14px' }}>Loading CampusIQ...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getRoleDashboardPath(currentRole)} replace />;
}

function DashboardLayout() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main style={{ flex: 1, backgroundColor: 'var(--bg-primary)' }}>
          <ErrorBoundary>
            <Routes>
              {/* 1. ADMIN EXCLUSIVE ROUTES (Protected against Faculty & Student manual URL typing) */}
              <Route element={<RoleRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/management" element={<ManagementDashboardPage />} />
                <Route path="/system-admin" element={<SystemAdminDashboardPage />} />
                <Route path="/campusiq/data-hub" element={<CampusIQDataHubPage />} />
                <Route path="/campusiq/reports" element={<CampusIQReportsPage />} />
                <Route path="/reports" element={<Navigate to="/campusiq/reports" replace />} />
              </Route>

              {/* 2. FACULTY & ADVISOR ROUTES (Accessible to Faculty & Admin) */}
              <Route element={<RoleRoute allowedRoles={['faculty', 'admin']} />}>
                <Route path="/faculty/dashboard" element={<FacultyDashboardPage />} />
                <Route path="/faculty" element={<Navigate to="/faculty/dashboard" replace />} />
                <Route path="/hod" element={<HODDashboardPage />} />
                <Route path="/campus" element={<Navigate to="/campusiq/dashboard" replace />} />
                <Route path="/campus-overview" element={<Navigate to="/campusiq/dashboard" replace />} />
                <Route path="/campus/overview" element={<Navigate to="/campusiq/dashboard" replace />} />
                <Route path="/campusiq" element={<Navigate to="/campusiq/dashboard" replace />} />
                <Route path="/campusiq/dashboard" element={<CampusIQDashboardPage />} />
                <Route path="/campusiq/early-warning" element={<CampusIQEarlyWarningPage />} />
                <Route path="/student-success" element={<Navigate to="/campusiq/early-warning" replace />} />
                <Route path="/campusiq/students" element={<CampusIQStudentsPage />} />
                <Route path="/campusiq/students/:studentId" element={<CampusIQStudentProfilePage />} />
                <Route path="/campusiq/segments" element={<CampusIQSegmentsPage />} />
                <Route path="/campusiq/simulator" element={<CampusIQSimulatorPage />} />
                <Route path="/campusiq/interventions" element={<CampusIQInterventionsPage />} />
                <Route path="/interventions" element={<Navigate to="/campusiq/interventions" replace />} />
                <Route path="/impact-analytics" element={<CampusIQImpactAnalyticsPage />} />
              </Route>

              {/* 3. STUDENT EXCLUSIVE PORTAL (Constructive, Non-Stigmatizing) */}
              <Route element={<RoleRoute allowedRoles={['student', 'admin']} />}>
                <Route path="/student/dashboard" element={<StudentDashboardPage />} />
                <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
              </Route>

              {/* 4. CAREER GUIDANCE & HINDSIGHT SUITE (Accessible to all authenticated personas) */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/skills" element={<SkillsPage />} />
              <Route path="/resume" element={<ResumePage />} />
              <Route path="/roadmap" element={<RoadmapPage />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/interview" element={<InterviewPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/status" element={<StatusPage />} />

              {/* Default Catch-all: Route user to their own role-specific dashboard */}
              <Route path="*" element={<RoleDashboardRedirect />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<DashboardLayout />} />
          </Route>

          {/* Root Redirect to role-specific dashboard */}
          <Route path="/" element={<RoleDashboardRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
