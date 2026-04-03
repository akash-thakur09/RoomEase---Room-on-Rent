import React from 'react';
import styles from '../dashboard.module.css';

const VARIANTS = {
  properties: {
    icon: '🏠', iconCls: styles.statIconProperties, cardCls: styles.statCardProperties,
  },
  occupied: {
    icon: '✅', iconCls: styles.statIconOccupied, cardCls: styles.statCardOccupied,
  },
  pending: {
    icon: '⏳', iconCls: styles.statIconPending, cardCls: styles.statCardPending,
  },
  earnings: {
    icon: '💰', iconCls: styles.statIconEarnings, cardCls: styles.statCardEarnings,
  },
};

/**
 * StatCard
 * @param {'properties'|'occupied'|'pending'|'earnings'} variant
 * @param {string} label
 * @param {string|number} value
 * @param {string} sub  - secondary line
 */
export default function StatCard({ variant = 'properties', label, value, sub }) {
  const cfg = VARIANTS[variant] ?? VARIANTS.properties;
  return (
    <div className={`${styles.statCard} ${cfg.cardCls}`}>
      <div className={`${styles.statIcon} ${cfg.iconCls}`} aria-hidden="true">
        {cfg.icon}
      </div>
      <div className={styles.statBody}>
        <p className={styles.statLabel}>{label}</p>
        <p className={styles.statValue}>{value}</p>
        {sub && <p className={styles.statSub}>{sub}</p>}
      </div>
    </div>
  );
}
