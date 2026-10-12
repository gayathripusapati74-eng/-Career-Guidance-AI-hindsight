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

// CampusIQ — Smart Campus Analytics Suite
import CampusIQDashboardPage from './pages/campusiq/CampusIQDashboardPage';
import CampusIQEarlyWarningPage from './pages/campusiq/CampusIQEarlyWarningPage';
import CampusIQStudentsPage from './pages/campusiq/CampusIQStudentsPage';
import CampusIQStudentProfilePage from './pages/campusiq/CampusIQStudentProfilePage';
import CampusIQSegmentsPage from './pages/campusiq/CampusIQSegmentsPage';
import CampusIQSimulatorPage from './pages/campusiq/CampusIQSimulatorPage';
import CampusIQInterventionsPage from './pages/campusiq/CampusIQInterventionsPage';
import CampusIQDataHubPage from './pages/campusiq/CampusIQDataHubPage';
import CampusIQReportsPage from './pages/campusiq/CampusIQReportsPage';

function DashboardLayout() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Existing Career Guidance & Hindsight Suite */}
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

            {/* CampusIQ Analytics Suite */}
            <Route path="/campusiq" element={<Navigate to="/campusiq/dashboard" replace />} />
            <Route path="/campusiq/dashboard" element={<CampusIQDashboardPage />} />
            <Route path="/campusiq/early-warning" element={<CampusIQEarlyWarningPage />} />
            <Route path="/campusiq/students" element={<CampusIQStudentsPage />} />
            <Route path="/campusiq/students/:studentId" element={<CampusIQStudentProfilePage />} />
            <Route path="/campusiq/segments" element={<CampusIQSegmentsPage />} />
            <Route path="/campusiq/simulator" element={<CampusIQSimulatorPage />} />
            <Route path="/campusiq/interventions" element={<CampusIQInterventionsPage />} />
            <Route path="/campusiq/data-hub" element={<CampusIQDataHubPage />} />
            <Route path="/campusiq/reports" element={<CampusIQReportsPage />} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
