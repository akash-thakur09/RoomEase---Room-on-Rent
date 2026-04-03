import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../shared/components/Navbar/Navbar';

/**
 * DashboardLayout
 * Provides the sticky Navbar. Pages manage their own padding/container.
 */
export default function DashboardLayout() {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
}
