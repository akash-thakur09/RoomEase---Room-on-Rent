import React, { useState } from 'react';
import Modal from '../../shared/components/Modal/Modal';
import { submitReview } from '../../services/reviewService';
import styles from './review.module.css';

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className={styles.stars} role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={[styles.star, (hovered || value) >= n ? styles.starFilled : ''].join(' ')}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

/**
 * ReviewModal — shown when a booking is completed.
 *
 * @param {boolean}  isOpen
 * @param {Function} onClose
 * @param {Object}   booking   - completed booking document (populated)
 * @param {string}   role      - 'tenant' | 'landlord'
 * @param {Function} onSuccess - called after successful submission
 */
export default function ReviewModal({ isOpen, onClose, booking, role, onSuccess }) {
  const [rating,    setRating]    = useState(0);
  const [comment,   setComment]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,     setError]     = useState('');

  const targetName = role === 'tenant'
    ? booking?.landlordId?.name ?? 'the landlord'
    : booking?.tenantId?.name  ?? 'the tenant';

  const property = booking?.propertyId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { setError('Please select a rating.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await submitReview({ bookingId: booking._id, rating, comment });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Leave a Review" size="sm">
      <form onSubmit={handleSubmit} className={styles.form}>
        <p className={styles.reviewTarget}>
          Reviewing <strong>{targetName}</strong>
          {property && <span className={styles.reviewProp}> · {property.type} in {property.city}</span>}
        </p>

        <div className={styles.field}>
          <label className={styles.label}>Rating</label>
          <StarRating value={rating} onChange={setRating} />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="review-comment">Comment (optional)</label>
          <textarea
            id="review-comment"
            className={styles.textarea}
            rows={4}
            maxLength={1000}
            placeholder="Share your experience…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <span className={styles.charCount}>{comment.length}/1000</span>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button type="button" className={styles.btnCancel} onClick={onClose} disabled={submitting}>
            Skip
          </button>
          <button type="submit" className={styles.btnSubmit} disabled={submitting || !rating}>
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
