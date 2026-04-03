import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './shared/AuthContext';
import { publicRoutes, tenantRoutes, landlordRoutes } from './routes';
import './shared/global.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          {publicRoutes}

          {/* Tenant routes — role-guarded, DashboardLayout */}
          {tenantRoutes}

          {/* Landlord routes — role-guarded, DashboardLayout */}
          {landlordRoutes}

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
