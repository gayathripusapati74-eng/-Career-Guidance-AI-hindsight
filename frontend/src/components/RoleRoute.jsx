import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, getRoleDashboardPath } from '../context/AuthContext';

export default function RoleRoute({ allowedRoles = [] }) {
  const { user, isAuthenticated, loading, currentRole } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Verifying Institutional Permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // If user role is not within the permitted whitelist, redirect to their permitted dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    console.warn(`[Access Guard] Unauthorized route access attempt by role '${currentRole}'. Redirecting to authorized dashboard.`);
    return <Navigate to={getRoleDashboardPath(currentRole)} replace />;
  }

  return <Outlet />;
}
