import React, { useState, useCallback } from 'react';
import { submitReview } from '../../services/reviewService';
import StarRating      from './components/StarRating';
import ReviewCard      from './components/ReviewCard';
import RatingBreakdown from './components/RatingBreakdown';
import ReviewForm      from './components/ReviewForm';
import styles from './review.module.css';

// ── Skeleton ──────────────────────────────────────────────────────────────────
function ReviewSkeleton() {
  return (
    <div className={styles.skeletonCard}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <div className="skeleton" style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 13, width: '40%', marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 11, width: '25%' }} />
        </div>
        <div className="skeleton" style={{ height: 16, width: 80, borderRadius: 4 }} />
      </div>
      <div className="skeleton" style={{ height: 13, width: '90%', marginBottom: 5 }} />
      <div className="skeleton" style={{ height: 13, width: '70%' }} />
    </div>
  );
}

/**
 * ReviewList — full reviews section for a property.
 *
 * Props:
 * @param {number}   averageRating
 * @param {number}   totalReviews
 * @param {Array}    reviews              - populated review documents
 * @param {boolean}  loading              - show skeleton
 * @param {boolean}  canReview            - show the form (tenant with completed booking)
 * @param {Array}    completedBookings    - bookings eligible for review
 * @param {Function} onReviewSubmitted    - called after successful submit to refresh data
 */
export default function ReviewList({
  averageRating     = 0,
  totalReviews      = 0,
  reviews           = [],
  loading           = false,
  canReview         = false,
  completedBookings = [],
  onReviewSubmitted,
}) {
  const [submitting,    setSubmitting]    = useState(false);
  const [submitError,   setSubmitError]   = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = useCallback(async ({ bookingId, rating, comment }) => {
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);
    try {
      await submitReview({ bookingId, rating, comment });
      setSubmitSuccess(true);
      onReviewSubmitted?.();
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [onReviewSubmitted]);

  return (
    <section className={styles.section} aria-labelledby="reviews-heading">
      {/* Header */}
      <div className={styles.header}>
        <h2 id="reviews-heading" className={styles.title}>
          Reviews {totalReviews > 0 && `(${totalReviews})`}
        </h2>
        {totalReviews > 0 && (
          <StarRating rating={averageRating} size="md" showNum />
        )}
      </div>

      {/* Rating breakdown */}
      {totalReviews > 0 && (
        <RatingBreakdown
          averageRating={averageRating}
          totalReviews={totalReviews}
          reviews={reviews}
        />
      )}

      {/* Review form */}
      {canReview && !submitSuccess && (
        <ReviewForm
          completedBookings={completedBookings}
          submitting={submitting}
          submitError={submitError}
          submitSuccess={submitSuccess}
          onSubmit={handleSubmit}
        />
      )}

      {/* Locked notice for tenants without completed bookings */}
      {!canReview && (
        <div className={styles.locked}>
          <span className={styles.lockedIcon}>🔒</span>
          <span>Reviews can only be submitted after a completed stay.</span>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className={styles.list}>
          {Array.from({ length: 3 }).map((_, i) => <ReviewSkeleton key={i} />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>💬</div>
          <p className={styles.emptyTitle}>No reviews yet</p>
          <p className={styles.emptyText}>Be the first to share your experience with this property.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {reviews.map((r) => (
            <ReviewCard key={r._id} review={r} />
          ))}
        </div>
      )}
    </section>
  );
}
