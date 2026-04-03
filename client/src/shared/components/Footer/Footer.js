import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const LINKS = {
  Explore: [
    { label: 'Find a Room',   to: '/search' },
    { label: 'How it Works',  to: '/home' },
  ],
  Account: [
    { label: 'Sign Up',  to: '/signup' },
    { label: 'Log In',   to: '/login' },
    { label: 'Profile',  to: '/tenant/profile' },
  ],
};

/**
 * Footer — site-wide footer with brand, link groups, and copyright.
 * Pass `linkGroups` prop to override the default link set.
 *
 * @param {Object} linkGroups - { GroupName: [{ label, to }] }
 */
export default function Footer({ linkGroups = LINKS }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>RoomEase</Link>
          <p>Find your perfect room — simple, fast, and hassle-free.</p>
        </div>

        <nav className={styles.links} aria-label="Footer navigation">
          {Object.entries(linkGroups).map(([group, items]) => (
            <div key={group} className={styles.linkGroup}>
              <h4>{group}</h4>
              <ul>
                {items.map(({ label, to }) => (
                  <li key={to}>
                    <Link to={to}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className={styles.bottom}>
        <p className={styles.copy}>
          © {new Date().getFullYear()} RoomEase. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
