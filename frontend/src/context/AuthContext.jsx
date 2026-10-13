import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export const INSTITUTIONAL_ROLES = [
  { id: 'admin', label: 'Institutional Admin', path: '/admin/dashboard', badge: 'Admin', desc: 'Campus-wide analytics, at-risk radar, interventions, reports & config' },
  { id: 'faculty', label: 'Faculty / Advisor', path: '/faculty/dashboard', badge: 'Faculty', desc: 'Assigned cohort mentees, early warnings, interventions & reviews' },
  { id: 'student', label: 'Student Portal', path: '/student/dashboard', badge: 'Student', desc: 'Personal academics, attendance, study recommendations & AI mentor' },
];

export function getRoleDashboardPath(role) {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'faculty':
      return '/faculty/dashboard';
    case 'student':
      return '/student/dashboard';
    default:
      return '/student/dashboard';
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Sync session with server-side record on mount / token change
  useEffect(() => {
    async function checkAuth() {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            const userData = res.data.user;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (err) {
          console.warn('[Session Verification] Invalid or expired session. Logging out.');
          logout();
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, [token]);

  // Login: Server determines and verifies role exclusively
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        const verifiedUser = res.data.user;
        const verifiedRole = verifiedUser.role || 'student';

        setToken(res.data.token);
        setUser(verifiedUser);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(verifiedUser));

        return {
          success: true,
          role: verifiedRole,
          dashboardPath: getRoleDashboardPath(verifiedRole),
          user: verifiedUser,
        };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Server connection failed',
      };
    }
  };

  // Register: New registrations default to student role
  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data?.success) {
        const verifiedUser = res.data.user;
        const verifiedRole = verifiedUser.role || 'student';

        setToken(res.data.token);
        setUser(verifiedUser);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(verifiedUser));

        return {
          success: true,
          role: verifiedRole,
          dashboardPath: getRoleDashboardPath(verifiedRole),
          user: verifiedUser,
        };
      }
      return { success: false, message: res.data?.message || 'Registration failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Registration failed',
      };
    }
  };

  // Logout: Invalidate token on server and wipe client state
  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    if (res.data?.success) {
      const updatedUser = res.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true };
    }
    return { success: false, message: res.data?.message || 'Profile update failed' };
  };

  const currentRole = user?.role || 'student';
  const isAdmin = currentRole === 'admin';
  const isFaculty = currentRole === 'faculty';
  const isStudent = currentRole === 'student';

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    currentRole,
    isAdmin,
    isFaculty,
    isStudent,
    login,
    register,
    logout,
    updateProfile,
    getRoleDashboardPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
