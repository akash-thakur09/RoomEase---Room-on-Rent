import React, { useState } from 'react';
import styles from './ErrorMessage.module.css';

/**
 * ErrorMessage
 *
 * @param {string}  message          - main error text (required)
 * @param {string}  title            - optional bold heading
 * @param {'inline'|'banner'|'toast'} variant
 * @param {boolean} dismissible      - shows × button
 * @param {Function} onDismiss       - called when dismissed
 */
export default function ErrorMessage({
  message,
  title,
  variant = 'inline',
  dismissible = false,
  onDismiss,
}) {
  const [visible, setVisible] = useState(true);

  if (!message || !visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div className={[styles.error, styles[variant]].join(' ')} role="alert">
      <span className={styles.icon} aria-hidden="true">⚠</span>
      <div className={styles.content}>
        {title && <p className={styles.title}>{title}</p>}
        <p>{message}</p>
      </div>
      {dismissible && (
        <button
          className={styles.dismiss}
          onClick={handleDismiss}
          aria-label="Dismiss error"
        >
          ✕
        </button>
      )}
    </div>
  );
}
