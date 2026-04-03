import React from 'react';
import { Route } from 'react-router-dom';
import Login from '../modules/auth/Login';
import Register from '../modules/auth/Register';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../modules/home/HomePage';
import ProtectedRoute from '../shared/components/ProtectedRoute';

/**
 * Public routes — accessible without authentication.
 * / and /login → Login page
 * /signup       → Register page
 * /home         → Landing page (requires auth, uses MainLayout with Navbar + Footer)
 */
const publicRoutes = [
  <Route key="root" path="/" element={<Login />} />,
  <Route key="login" path="/login" element={<Login />} />,
  <Route key="signup" path="/signup" element={<Register />} />,
  <Route
    key="home-layout"
    element={<ProtectedRoute><MainLayout /></ProtectedRoute>}
  >
    <Route path="/home" element={<HomePage />} />,
  </Route>,
];

export default publicRoutes;
