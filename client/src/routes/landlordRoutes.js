import React from 'react';
import { Route } from 'react-router-dom';
import RoleBasedRoute from '../shared/components/RoleBasedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import LandlordDashboardPage from '../modules/landlord/LandlordDashboardPage';
import PropertiesPage from '../modules/property/PropertiesPage';
import BookingRequestsPage from '../modules/booking/BookingRequestsPage';
import LandlordProfile from '../modules/profile/LandlordProfile';
import ChatUI from '../modules/chat/ChatUI';

const landlordRoutes = (
  <Route
    element={<RoleBasedRoute role="landlord"><DashboardLayout /></RoleBasedRoute>}
  >
    <Route path="/landlord/dashboard"    element={<LandlordDashboardPage />} />
    <Route path="/landlord/properties"   element={<PropertiesPage />} />
    <Route path="/landlord/add-property" element={<PropertiesPage />} />
    <Route path="/landlord/bookings"     element={<BookingRequestsPage />} />
    <Route path="/landlord/profile"      element={<LandlordProfile />} />
    <Route path="/landlord/chat"         element={<ChatUI />} />
    <Route path="/chat"                  element={<ChatUI />} />
  </Route>
);

export default landlordRoutes;
