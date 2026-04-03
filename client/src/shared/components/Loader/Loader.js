import React from 'react';
import styles from './Loader.module.css';

/**
 * Loader / Spinner
 *
 * @param {'sm'|'md'|'lg'}          size
 * @param {'primary'|'white'|'muted'} color
 * @param {boolean} overlay  - renders a full-page backdrop
 * @param {boolean} center   - wraps in a centered flex container
 * @param {string}  label    - accessible screen-reader label
 */
export default function Loader({
  size = 'md',
  color = 'primary',
  overlay = false,
  center = false,
  label = 'Loading…',
}) {
  const spinner = (
    <span
      className={[styles.spinner, styles[size], color !== 'primary' ? styles[color] : '']
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-label={label}
    />
  );

  if (overlay) {
    return (
      <div className={styles.overlay} aria-live="polite">
        {spinner}
      </div>
    );
  }

  if (center) {
    return <div className={styles.center}>{spinner}</div>;
  }

  return spinner;
}
