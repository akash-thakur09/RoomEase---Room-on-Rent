import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Redirects unauthenticated users to /login.
 * Wrap route elements or use as a layout route.
 */
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children ?? <Outlet />;
}
