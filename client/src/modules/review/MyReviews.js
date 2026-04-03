import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyReviews } from '../../services/reviewService';
import ReviewCard from './components/ReviewCard';
import styles from './review.module.css';

function Skeleton() {
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
 * MyReviews — tenant's own review history.
 */
export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    getMyReviews()
      .then((res) => setReviews(res.data.data ?? []))
      .catch((err) => setError(err.message || 'Failed to load your reviews.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 64px' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>
            My Reviews
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
            {loading ? 'Loading…' : `${reviews.length} review${reviews.length !== 1 ? 's' : ''} written`}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 10, color: 'var(--danger)', fontSize: 14, marginBottom: 20 }} role="alert">
            <span>⚠</span> {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className={styles.list}>
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📝</div>
            <p className={styles.emptyTitle}>No reviews yet</p>
            <p className={styles.emptyText}>
              Complete a booking to leave a review for a property.
            </p>
            <Link
              to="/search"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px',
                borderRadius: 8, background: 'var(--primary)', color: '#fff', fontSize: 14,
                fontWeight: 600, textDecoration: 'none', marginTop: 16, transition: 'background 0.15s',
              }}
            >
              🔍 Explore Properties
            </Link>
          </div>
        ) : (
          <div className={styles.list}>
            {reviews.map((r) => (
              <ReviewCard key={r._id} review={r} showProperty />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
