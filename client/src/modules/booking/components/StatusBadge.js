import React from 'react';
import styles from '../bookings.module.css';

const CONFIG = {
  pending:   { label: 'Pending',   badge: styles.badgePending,   dot: styles.dotPending   },
  approved:  { label: 'Approved',  badge: styles.badgeApproved,  dot: styles.dotApproved  },
  rejected:  { label: 'Rejected',  badge: styles.badgeRejected,  dot: styles.dotRejected  },
  cancelled: { label: 'Cancelled', badge: styles.badgeCancelled, dot: styles.dotCancelled },
  completed: { label: 'Completed', badge: styles.badgeCompleted, dot: styles.dotCompleted },
};

/**
 * StatusBadge
 * @param {'pending'|'approved'|'rejected'|'cancelled'|'completed'} status
 * @param {boolean} showDot - show the coloured dot indicator (default true)
 */
export default function StatusBadge({ status, showDot = true }) {
  const cfg = CONFIG[status] ?? { label: status, badge: styles.badgePending, dot: styles.dotPending };

  return (
    <span className={`${styles.badge} ${cfg.badge}`} aria-label={`Status: ${cfg.label}`}>
      {showDot && <span className={`${styles.badgeDot} ${cfg.dot}`} aria-hidden="true" />}
      {cfg.label}
    </span>
  );
}
