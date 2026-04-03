import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Navbar.module.css';

const NAV_LINKS = {
  guest: [],
  tenant: [
    { to: '/home',    label: 'Home' },
    { to: '/search',  label: 'Explore Rooms' },
    { to: '/chat',    label: 'Messages' },
  ],
  landlord: [
    { to: '/landlord/dashboard', label: 'My Properties' },
    { to: '/landlord/bookings',  label: 'Bookings' },
    { to: '/chat',               label: 'Messages' },
  ],
};

/**
 * Navbar — role-aware navigation.
 * Reads role from AuthContext; renders guest, tenant, or landlord links.
 */
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

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const role = user?.role ?? 'guest';
  const links = NAV_LINKS[role] ?? [];
  const profilePath = role === 'landlord' ? '/landlord/profile' : '/tenant/profile';
  const homePath    = role === 'landlord' ? '/landlord/dashboard' : '/home';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={[styles.navbar, scrolled ? styles.scrolled : ''].filter(Boolean).join(' ')}>
      <Link to={user ? homePath : '/'} className={styles.logo}>
        RoomEase
      </Link>

      {/* Mobile hamburger */}
      <button
        className={styles.hamburger}
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
      >
        <span /><span /><span />
      </button>

      {/* Nav links */}
      {links.length > 0 && (
        <ul className={[styles.links, menuOpen ? styles.linksOpen : ''].filter(Boolean).join(' ')}>
          {links.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={location.pathname === to ? styles.active : ''}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        {user ? (
          <>
            <Link to={profilePath} className={styles.avatar} title="My profile">
              {user.email?.[0]?.toUpperCase() ?? 'U'}
            </Link>
            <button
              className="btn btn-outline btn-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline btn-sm">Log in</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
