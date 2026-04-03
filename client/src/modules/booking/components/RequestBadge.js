import React from 'react';
import styles from '../requests.module.css';

const CFG = {
  pending:   { label: 'Pending',   badge: styles.badgePending,   dot: styles.dotPending   },
  approved:  { label: 'Approved',  badge: styles.badgeApproved,  dot: styles.dotApproved  },
  rejected:  { label: 'Rejected',  badge: styles.badgeRejected,  dot: styles.dotRejected  },
  cancelled: { label: 'Cancelled', badge: styles.badgeCancelled, dot: styles.dotCancelled },
  completed: { label: 'Completed', badge: styles.badgeCompleted, dot: styles.dotCompleted },
};

export default function RequestBadge({ status, showDot = true }) {
  const cfg = CFG[status] ?? CFG.pending;
  return (
    <span className={`${styles.badge} ${cfg.badge}`} aria-label={`Status: ${cfg.label}`}>
      {showDot && <span className={`${styles.badgeDot} ${cfg.dot}`} aria-hidden="true" />}
      {cfg.label}
    </span>
  );
}
