import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Career Guidance & Hindsight Pages (Preserved 100%)
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

// CampusIQ — Role-Based Dashboards
import ManagementDashboardPage from './pages/roles/ManagementDashboardPage';
import AdminDashboardPage from './pages/roles/AdminDashboardPage';
import HODDashboardPage from './pages/roles/HODDashboardPage';
import FacultyDashboardPage from './pages/roles/FacultyDashboardPage';
import StudentDashboardPage from './pages/roles/StudentDashboardPage';
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

function DashboardLayout() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main style={{ flex: 1, backgroundColor: 'var(--bg-primary)' }}>
          <Routes>
            {/* Role-Based Dashboards */}
            <Route path="/management" element={<ManagementDashboardPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/hod" element={<HODDashboardPage />} />
            <Route path="/faculty" element={<FacultyDashboardPage />} />
            <Route path="/student" element={<StudentDashboardPage />} />
            <Route path="/system-admin" element={<SystemAdminDashboardPage />} />

            {/* CampusIQ Analytics & Success Intelligence */}
            <Route path="/campusiq" element={<Navigate to="/management" replace />} />
            <Route path="/campusiq/dashboard" element={<CampusIQDashboardPage />} />
            <Route path="/student-success" element={<CampusIQEarlyWarningPage />} />
            <Route path="/campusiq/early-warning" element={<CampusIQEarlyWarningPage />} />
            <Route path="/campusiq/students" element={<CampusIQStudentsPage />} />
            <Route path="/campusiq/students/:studentId" element={<CampusIQStudentProfilePage />} />
            <Route path="/campusiq/segments" element={<CampusIQSegmentsPage />} />
            <Route path="/campusiq/simulator" element={<CampusIQSimulatorPage />} />
            <Route path="/interventions" element={<CampusIQInterventionsPage />} />
            <Route path="/campusiq/interventions" element={<CampusIQInterventionsPage />} />
            <Route path="/impact-analytics" element={<CampusIQImpactAnalyticsPage />} />
            <Route path="/campusiq/data-hub" element={<CampusIQDataHubPage />} />
            <Route path="/reports" element={<CampusIQReportsPage />} />
            <Route path="/campusiq/reports" element={<CampusIQReportsPage />} />

            {/* Career Guidance & Hindsight Suite (100% Preserved) */}
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

            <Route path="*" element={<Navigate to="/management" replace />} />
          </Routes>
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
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<DashboardLayout />} />
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/management" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
