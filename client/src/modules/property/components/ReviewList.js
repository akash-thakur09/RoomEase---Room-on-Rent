import React, { useState } from 'react';
import styles from '../detail.module.css';

// ── Star renderer ─────────────────────────────────────────────────────────────
function Stars({ rating, size = 'md' }) {
  const cls = size === 'sm' ? styles.reviewStar : styles.star;
  return (
    <div className={size === 'sm' ? styles.reviewStars : styles.stars} aria-label={`${rating} out of 5 stars`}>
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
    </div>
  );
}

// ── Interactive star picker ───────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }} role="group" aria-label="Select rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 28, color: n <= (hover || value) ? '#f6ad55' : '#e2e8f0',
            transition: 'color 0.1s', padding: '0 2px',
          }}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
          aria-pressed={value === n}
        >
          ★
        </button>
      ))}
    </div>
  );
}

/**
 * ReviewList
 *
 * @param {number}   averageRating
 * @param {number}   totalReviews
 * @param {Array}    reviews
 * @param {boolean}  canReview      - show the submit form
 * @param {boolean}  submitting
 * @param {string}   submitError
 * @param {Function} onSubmit       - ({ rating, comment }) => void
 */
export default function ReviewList({
  averageRating = 0,
  totalReviews  = 0,
  reviews       = [],
  canReview     = false,
  submitting    = false,
  submitError   = '',
  onSubmit,
}) {
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState('');
  const [formErr, setFormErr] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) { setFormErr('Please select a star rating.'); return; }
    setFormErr('');
    onSubmit?.({ rating, comment });
    setRating(0);
    setComment('');
  };

  return (
    <section className={styles.reviews} aria-labelledby="reviews-heading">
      <div className={styles.reviewsHeader}>
        <h2 id="reviews-heading" className={styles.reviewsTitle}>
          Reviews
        </h2>

        {totalReviews > 0 && (
          <div className={styles.ratingOverview}>
            <span className={styles.ratingBig}>{averageRating.toFixed(1)}</span>
            <div className={styles.ratingMeta}>
              <Stars rating={averageRating} />
              <span className={styles.ratingCount}>{totalReviews} review{totalReviews !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}
      </div>

      {/* Submit form */}
      {canReview && (
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', padding: 20, marginBottom: 24 }}>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Leave a Review</p>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <StarPicker value={rating} onChange={setRating} />
            </div>
            <textarea
              placeholder="Share your experience (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={3}
              style={{
                width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)',
                borderRadius: 8, fontFamily: 'inherit', fontSize: 14, resize: 'vertical',
                outline: 'none', color: 'var(--text)', background: 'var(--surface)',
              }}
              aria-label="Review comment"
            />
            {(formErr || submitError) && (
              <p style={{ color: 'var(--danger)', fontSize: 13, margin: '8px 0' }} role="alert">
                {formErr || submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: 10, padding: '9px 20px', background: 'var(--primary)', color: '#fff',
                border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14,
                cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1,
                fontFamily: 'inherit',
              }}
            >
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* Review items */}
      {reviews.length === 0 ? (
        <div className={styles.reviewEmpty}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>💬</p>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>No reviews yet</p>
          <p style={{ fontSize: 13 }}>Be the first to review this property</p>
        </div>
      ) : (
        <div className={styles.reviewList}>
          {reviews.map((r) => (
            <article key={r._id} className={styles.reviewItem}>
              <div className={styles.reviewItemHeader}>
                <div className={styles.reviewerInfo}>
                  <div className={styles.reviewerAvatar}>
                    {r.reviewerId?.name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div>
                    <p className={styles.reviewerName}>{r.reviewerId?.name ?? 'Anonymous'}</p>
                    <p className={styles.reviewDate}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <Stars rating={r.rating} size="sm" />
              </div>
              {r.comment && <p className={styles.reviewComment}>{r.comment}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
