import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isLandlord = user?.role === 'landlord';
  const isActive = (path) => location.pathname === path;

  const tenantLinks = [
    { to: '/home', label: 'Home' },
    { to: '/search', label: 'Explore Rooms' },
    { to: '/chat', label: 'Messages' },
  ];

  const landlordLinks = [
    { to: '/landlord/dashboard', label: 'My Properties' },
    { to: '/landlord/bookings', label: 'Booking Requests' },
    { to: '/chat', label: 'Messages' },
  ];

  const links = isLandlord ? landlordLinks : tenantLinks;
  const profilePath = isLandlord ? '/landlord/profile' : '/tenant/profile';

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <Link to={isLandlord ? '/landlord/dashboard' : '/home'} className="navbar__logo">
        RoomEase
      </Link>

      <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        <span /><span /><span />
      </button>

      <ul className={`navbar__links${menuOpen ? ' navbar__links--open' : ''}`}>
        {links.map(({ to, label }) => (
          <li key={to}>
            <Link to={to} className={isActive(to) ? 'active' : ''} onClick={() => setMenuOpen(false)}>
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="navbar__actions">
        <Link to={profilePath} className="navbar__avatar" title="Profile">
          {user?.email?.[0]?.toUpperCase() ?? 'U'}
        </Link>
        <button className="btn btn-outline btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
