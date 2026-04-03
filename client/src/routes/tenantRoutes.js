import React from 'react';
import { Route } from 'react-router-dom';
import RoleBasedRoute from '../shared/components/RoleBasedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import PropertySearch from '../modules/property/PropertySearch';
import PropertyDetail from '../modules/property/PropertyDetail';
import TenantBookings from '../modules/booking/TenantBookings';
import ChatUI from '../modules/chat/ChatUI';
import TenantProfile from '../modules/profile/TenantProfile';
import MyReviews from '../modules/review/MyReviews';
import VerificationPage from '../modules/verification/VerificationPage';
import PaymentsPage from '../modules/payment/PaymentsPage';

const tenantRoutes = (
  <Route
    element={<RoleBasedRoute role="tenant"><DashboardLayout /></RoleBasedRoute>}
  >
    <Route path="/tenant/dashboard" element={<PropertySearch />} />
    <Route path="/search"           element={<PropertySearch />} />
    <Route path="/property/:id"     element={<PropertyDetail />} />
    <Route path="/bookings"         element={<TenantBookings />} />
    <Route path="/reviews"          element={<MyReviews />} />
    <Route path="/verification"     element={<VerificationPage />} />
    <Route path="/payments"         element={<PaymentsPage />} />
    <Route path="/chat"             element={<ChatUI />} />
    <Route path="/tenant/profile"   element={<TenantProfile />} />
  </Route>
);

export default tenantRoutes;
