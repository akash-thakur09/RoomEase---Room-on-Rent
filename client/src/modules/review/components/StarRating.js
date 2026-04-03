import React from 'react';
import styles from '../review.module.css';

const SIZE_CLASS = { lg: styles.starLg, md: styles.starMd, sm: styles.starSm };

/**
 * StarRating — read-only star display supporting half-stars.
 *
 * @param {number}          rating  - 0–5, supports decimals
 * @param {'sm'|'md'|'lg'}  size
 * @param {boolean}         showNum - show numeric value next to stars
 */
export default function StarRating({ rating = 0, size = 'md', showNum = false }) {
  const cls = SIZE_CLASS[size] ?? styles.starMd;

  return (
    <div
      className={styles.stars}
      aria-label={`${rating} out of 5 stars`}
      role="img"
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const full = rating >= n;
        const half = !full && rating >= n - 0.5;
        return (
          <span
            key={n}
            className={[cls, full ? styles.starFull : half ? styles.starHalf : styles.starEmpty].join(' ')}
            aria-hidden="true"
          >
            ★
          </span>
        );
      })}
      {showNum && (
        <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 4 }}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
