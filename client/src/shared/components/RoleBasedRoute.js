import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Extends ProtectedRoute with role enforcement.
 * @param {string} role - required role ('tenant' | 'landlord')
 */
export default function RoleBasedRoute({ role, children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) {
    const fallback = user.role === 'landlord' ? '/landlord/dashboard' : '/home';
    return <Navigate to={fallback} replace />;
  }

  return children ?? <Outlet />;
}
