import React from 'react';
import StarRating from './StarRating';
import styles from '../review.module.css';

/**
 * RatingBreakdown — shows the average score + per-star bar chart.
 *
 * @param {number} averageRating
 * @param {number} totalReviews
 * @param {Array}  reviews        - full review list (used to compute per-star counts)
 */
export default function RatingBreakdown({ averageRating, totalReviews, reviews = [] }) {
  if (totalReviews === 0) return null;

  // Count per star level
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Score + stars */}
      <div className={styles.overview} style={{ marginBottom: 20 }}>
        <span className={styles.overviewScore}>{averageRating.toFixed(1)}</span>
        <div className={styles.overviewMeta}>
          <StarRating rating={averageRating} size="lg" />
          <span className={styles.overviewCount}>
            {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Per-star bars */}
      <div className={styles.breakdown}>
        {counts.map(({ star, count }) => (
          <div key={star} className={styles.breakdownRow}>
            <span className={styles.breakdownLabel}>{star} ★</span>
            <div className={styles.breakdownTrack}>
              <div
                className={styles.breakdownFill}
                style={{ width: totalReviews ? `${(count / totalReviews) * 100}%` : '0%' }}
                role="progressbar"
                aria-valuenow={count}
                aria-valuemax={totalReviews}
                aria-label={`${star} star: ${count} review${count !== 1 ? 's' : ''}`}
              />
            </div>
            <span className={styles.breakdownCount}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
