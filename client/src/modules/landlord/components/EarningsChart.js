import React from 'react';
import styles from '../dashboard.module.css';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatRupees(paise) {
  const rupees = paise / 100;
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(1)}L`;
  if (rupees >= 1000)   return `₹${(rupees / 1000).toFixed(1)}K`;
  return `₹${rupees.toFixed(0)}`;
}

/**
 * EarningsChart — 6-month bar chart + totals.
 *
 * @param {Array}  monthly  - [{ _id: { year, month }, amount, count }]
 * @param {number} total    - total earnings in paise
 * @param {number} paid     - total paid transactions
 */
export default function EarningsChart({ monthly = [], total = 0, paid = 0 }) {
  // Build last 6 months scaffold
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1, label: MONTH_NAMES[d.getMonth()] };
  });

  // Merge actual data
  const bars = months.map(({ year, month, label }) => {
    const found = monthly.find((m) => m._id.year === year && m._id.month === month);
    return { label, amount: found?.amount ?? 0 };
  });

  const maxAmount = Math.max(...bars.map((b) => b.amount), 1);

  return (
    <div className={styles.earningsSection}>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Earnings (last 6 months)</span>
        </div>

        <div className={styles.chartWrap}>
          <div className={styles.chartBars} role="img" aria-label="Monthly earnings bar chart">
            {bars.map(({ label, amount }) => {
              const pct = (amount / maxAmount) * 100;
              return (
                <div key={label} className={styles.chartCol}>
                  <span className={styles.chartAmount}>
                    {amount > 0 ? formatRupees(amount) : ''}
                  </span>
                  <div
                    className={`${styles.chartBar} ${amount === 0 ? styles.chartBarEmpty : ''}`}
                    style={{ height: `${Math.max(pct, 3)}%` }}
                    title={`${label}: ${formatRupees(amount)}`}
                  />
                  <span className={styles.chartLabel}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.earningsTotals}>
          <div className={styles.earningsItem}>
            <p className={styles.earningsItemLabel}>Total Earned</p>
            <p className={styles.earningsItemValue}>{formatRupees(total)}</p>
          </div>
          <div className={styles.earningsItem}>
            <p className={styles.earningsItemLabel}>Paid Bookings</p>
            <p className={styles.earningsItemValue}>{paid}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
