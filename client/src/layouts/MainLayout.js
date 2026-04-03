import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../shared/components/Navbar/Navbar';
import Footer from '../shared/components/Footer/Footer';

export default function MainLayout() {
  return (
    <div>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
