import React from 'react';
import styles from '../payment.module.css';

const CONFIG = {
  success: { label: 'Paid',    badge: styles.badgeSuccess, dot: styles.dotSuccess, icon: '✅' },
  pending: { label: 'Pending', badge: styles.badgePending, dot: styles.dotPending, icon: '⏳' },
  failed:  { label: 'Failed',  badge: styles.badgeFailed,  dot: styles.dotFailed,  icon: '❌' },
};

/**
 * PaymentBadge
 * @param {'success'|'pending'|'failed'} status
 * @param {boolean} showDot
 */
export default function PaymentBadge({ status, showDot = true }) {
  const cfg = CONFIG[status] ?? CONFIG.pending;
  return (
    <span className={`${styles.badge} ${cfg.badge}`} aria-label={`Payment status: ${cfg.label}`}>
      {showDot && <span className={`${styles.badgeDot} ${cfg.dot}`} aria-hidden="true" />}
      {cfg.label}
    </span>
  );
}
