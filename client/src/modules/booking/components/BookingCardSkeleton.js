import React from 'react';
import styles from '../bookings.module.css';

export default function BookingCardSkeleton() {
  return (
    <div className={styles.skeletonCard}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div className="skeleton" style={{ width: 72, height: 72, borderRadius: 10, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 12, width: '30%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 18, width: '65%', marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 13, width: '40%' }} />
        </div>
        <div className="skeleton" style={{ height: 26, width: 80, borderRadius: 20 }} />
      </div>
      <div style={{ display: 'flex', gap: 20, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
        {[100, 80, 90, 120].map((w, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div className="skeleton" style={{ height: 10, width: w * 0.6 }} />
            <div className="skeleton" style={{ height: 14, width: w }} />
          </div>
        ))}
      </div>
    </div>
  );
}
