import React, { useState } from 'react';
import StarPicker from './StarPicker';
import styles from '../review.module.css';

const MAX = 1000;

/**
 * ReviewForm — write-a-review card.
 *
 * @param {Array}    completedBookings  - [{ _id, propertyId: { address } }]
 * @param {boolean}  submitting
 * @param {string}   submitError
 * @param {boolean}  submitSuccess
 * @param {Function} onSubmit           - ({ bookingId, rating, comment }) => void
 */
export default function ReviewForm({
  completedBookings = [],
  submitting = false,
  submitError = '',
  submitSuccess = false,
  onSubmit,
}) {
  const [rating,    setRating]    = useState(0);
  const [comment,   setComment]   = useState('');
  const [bookingId, setBookingId] = useState(completedBookings[0]?._id ?? '');
  const [formErr,   setFormErr]   = useState('');

  const charLeft = MAX - comment.length;
  const overLimit = comment.length > MAX;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating)    { setFormErr('Please select a star rating.'); return; }
    if (!bookingId) { setFormErr('Please select a booking to review.'); return; }
    if (overLimit)  { setFormErr(`Comment must be under ${MAX} characters.`); return; }
    setFormErr('');
    onSubmit({ bookingId, rating, comment: comment.trim() });
  };

  const error = formErr || submitError;

  return (
    <div className={styles.form}>
      <p className={styles.formTitle}>✍ Write a Review</p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Booking selector — only shown when multiple completed bookings */}
        {completedBookings.length > 1 && (
          <div className={styles.formField}>
            <label htmlFor="review-booking" className={styles.formLabel}>
              Select Booking
            </label>
            <select
              id="review-booking"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              style={{
                width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)',
                borderRadius: 8, fontFamily: 'inherit', fontSize: 14,
                background: 'var(--bg)', color: 'var(--text)', outline: 'none',
              }}
            >
              {completedBookings.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.propertyId?.address ?? b._id}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Star picker */}
        <div className={styles.formField}>
          <span className={styles.formLabel}>Your Rating</span>
          <StarPicker value={rating} onChange={setRating} disabled={submitting} />
        </div>

        {/* Comment */}
        <div className={styles.formField}>
          <label htmlFor="review-comment" className={styles.formLabel}>
            Your Experience <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
          </label>
          <textarea
            id="review-comment"
            className={styles.textarea}
            placeholder="What did you like or dislike about this property?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={submitting}
            aria-describedby="char-count"
          />
          <p
            id="char-count"
            className={[
              styles.charCount,
              overLimit ? styles.charOver : comment.length > MAX * 0.85 ? styles.charWarn : '',
            ].filter(Boolean).join(' ')}
          >
            {charLeft} characters remaining
          </p>
        </div>

        {/* Feedback */}
        {error && (
          <div className={styles.formError} role="alert">
            <span>⚠</span> {error}
          </div>
        )}
        {submitSuccess && (
          <div className={styles.formSuccess} role="status">
            ✓ Review submitted successfully!
          </div>
        )}

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting || submitSuccess}
          >
            {submitting && <span className={styles.spinner} aria-hidden="true" />}
            {submitting ? 'Submitting…' : submitSuccess ? '✓ Submitted' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
}
