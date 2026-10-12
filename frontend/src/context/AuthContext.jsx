import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export const INSTITUTIONAL_ROLES = [
  { id: 'management', label: 'Management / Leadership', path: '/management', badge: 'Leadership', desc: 'Strategic campus KPIs, retention & ROI' },
  { id: 'admin', label: 'College Administrator', path: '/admin', badge: 'Admin', desc: 'Department, course & accounts ops' },
  { id: 'hod', label: 'HOD / Coordinator', path: '/hod', badge: 'HOD', desc: 'Department analytics & cohort reviews' },
  { id: 'faculty', label: 'Faculty / Mentor', path: '/faculty', badge: 'Faculty', desc: 'Assigned mentees, alerts & interventions' },
  { id: 'student', label: 'Student Portal', path: '/student', badge: 'Student', desc: 'Personal academics, revision & growth' },
  { id: 'system_admin', label: 'System Administrator', path: '/system-admin', badge: 'SysAdmin', desc: 'Audit logs, security & integration health' },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('campusiq_role') || 'management';
  });

  useEffect(() => {
    async function checkAuth() {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            const userData = res.data.user;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            if (userData.role && !localStorage.getItem('campusiq_role')) {
              setCurrentRole(userData.role);
            }
          }
        } catch (err) {
          console.warn('Session verification failed, logging out.');
          logout();
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, [token]);

  const switchRole = (newRole) => {
    setCurrentRole(newRole);
    localStorage.setItem('campusiq_role', newRole);
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const login = async (email, password, desiredRole = null) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const roleToSet = desiredRole || res.data.user?.role || currentRole || 'management';
      const updatedUser = { ...res.data.user, role: roleToSet };
      setToken(res.data.token);
      setUser(updatedUser);
      setCurrentRole(roleToSet);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('campusiq_role', roleToSet);
      return { success: true, role: roleToSet };
    }
    return { success: false, message: res.data?.message || 'Login failed' };
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data?.success) {
      const roleToSet = formData.role || 'management';
      const updatedUser = { ...res.data.user, role: roleToSet };
      setToken(res.data.token);
      setUser(updatedUser);
      setCurrentRole(roleToSet);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('campusiq_role', roleToSet);
      return { success: true };
    }
    return { success: false, message: res.data?.message || 'Registration failed' };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    if (res.data?.success) {
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return { success: true, user: res.data.user };
    }
    return { success: false, message: res.data?.message || 'Profile update failed' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        loading,
        currentRole,
        availableRoles: INSTITUTIONAL_ROLES,
        switchRole,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
