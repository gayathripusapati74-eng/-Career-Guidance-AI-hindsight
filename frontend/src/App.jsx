import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
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

function DashboardLayout() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
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
