import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './shared/AuthContext';
import ProtectedRoute from './shared/ProtectedRoute';
import './shared/global.css';

// Auth
import Login from './modules/auth/Login';
import Register from './modules/auth/Register';

// Home
import HomePage from './modules/home/HomePage';

// Property
import PropertyListing from './modules/property/PropertyListing';
import LandlordDashboard from './modules/property/LandlordDashboard';

// Booking
import BookingDashboard from './modules/booking/BookingDashboard';

// Chat
import ChatUI from './modules/chat/ChatUI';

// Profile
import TenantProfile from './modules/profile/TenantProfile';
import LandlordProfile from './modules/profile/LandlordProfile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Register />} />

          {/* Tenant routes */}
          <Route path="/home" element={<ProtectedRoute role="tenant"><HomePage /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute role="tenant"><PropertyListing /></ProtectedRoute>} />
          <Route path="/tenant/profile" element={<ProtectedRoute role="tenant"><TenantProfile /></ProtectedRoute>} />

          {/* Landlord routes */}
          <Route path="/landlord/dashboard" element={<ProtectedRoute role="landlord"><LandlordDashboard /></ProtectedRoute>} />
          <Route path="/landlord/bookings" element={<ProtectedRoute role="landlord"><BookingDashboard /></ProtectedRoute>} />
          <Route path="/landlord/profile" element={<ProtectedRoute role="landlord"><LandlordProfile /></ProtectedRoute>} />

          {/* Shared */}
          <Route path="/chat" element={<ProtectedRoute><ChatUI /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
