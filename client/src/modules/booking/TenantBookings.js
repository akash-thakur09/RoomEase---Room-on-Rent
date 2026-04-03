import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getBookings, cancelBooking } from '../../services/bookingService';
import { getBookingReviewStatus } from '../../services/reviewService';
import BookingCard        from './components/BookingCard';
import BookingCardSkeleton from './components/BookingCardSkeleton';
import CancelConfirm      from './components/CancelConfirm';
import StatusBadge        from './components/StatusBadge';
import ReviewModal        from '../review/ReviewModal';
import { useAuth }        from '../../shared/hooks/useAuth';
import styles from './bookings.module.css';

const LIMIT = 8;

const ALL_STATUSES = ['all', 'pending', 'approved', 'rejected', 'cancelled', 'completed'];

// ── Count bookings per status for tab badges ──────────────────────────────────
function countByStatus(bookings) {
  return bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {});
}

// ── Skeleton list ─────────────────────────────────────────────────────────────
function SkeletonList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {Array.from({ length: 4 }).map((_, i) => <BookingCardSkeleton key={i} />)}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TenantBookings() {
  const { user } = useAuth();
  const [allBookings, setAllBookings]   = useState([]);
  const [total, setTotal]               = useState(0);
  const [page, setPage]                 = useState(1);
  const [activeTab, setActiveTab]       = useState('all');
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  // Cancel flow
  const [confirmId, setConfirmId]       = useState(null);
  const [cancelling, setCancelling]     = useState(null);

  // Review flow
  const [reviewBooking, setReviewBooking] = useState(null);

  const totalPages = Math.ceil(total / LIMIT);
  const counts     = countByStatus(allBookings);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await getBookings({ page: targetPage, limit: LIMIT });
      const { bookings, total: t } = res.data.data;
      setAllBookings(bookings);
      setTotal(t);
      setPage(targetPage);
    } catch (err) {
      setError(err.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(1); }, [fetchBookings]);

  // ── Auto-prompt review for completed bookings not yet reviewed ───────────
  useEffect(() => {
    const completed = allBookings.filter((b) => b.status === 'completed');
    if (!completed.length) return;
    // Check the first unreviewed completed booking
    (async () => {
      for (const b of completed) {
        try {
          const res = await getBookingReviewStatus(b._id);
          if (!res.data.data?.hasReviewed) {
            setReviewBooking(b);
            break;
          }
        } catch { /* skip */ }
      }
    })();
  }, [allBookings]); // eslint-disable-line

  // ── Filtered view (client-side — all bookings for current page are loaded) ──
  const displayed = activeTab === 'all'
    ? allBookings
    : allBookings.filter((b) => b.status === activeTab);

  // ── Cancel handlers ─────────────────────────────────────────────────────────
  const handleCancelRequest = (bookingId) => setConfirmId(bookingId);

  const handleCancelConfirm = async () => {
    if (!confirmId) return;
    setCancelling(confirmId);
    setConfirmId(null);
    try {
      await cancelBooking(confirmId);
      // Optimistic update
      setAllBookings((prev) =>
        prev.map((b) => b._id === confirmId ? { ...b, status: 'cancelled' } : b)
      );
    } catch (err) {
      setError(err.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(null);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>My Bookings</h1>
          <p className={styles.subtitle}>
            {loading ? 'Loading…' : `${total} booking${total !== 1 ? 's' : ''} total`}
          </p>
        </div>

        {/* Status filter tabs */}
        <div className={styles.tabs} role="tablist" aria-label="Filter bookings by status">
          {ALL_STATUSES.map((s) => {
            const isActive = activeTab === s;
            const count    = s === 'all' ? allBookings.length : (counts[s] ?? 0);
            return (
              <button
                key={s}
                role="tab"
                aria-selected={isActive}
                className={[styles.tab, isActive ? styles.tabActive : ''].join(' ')}
                onClick={() => setActiveTab(s)}
              >
                {s === 'all' ? 'All' : <StatusBadge status={s} showDot={false} />}
                {count > 0 && (
                  <span className={isActive ? styles.tabCount : styles.tabCountInactive}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className={styles.errorBox} role="alert">
            <span>⚠ {error}</span>
            <button className={styles.retryBtn} onClick={() => fetchBookings(page)}>
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <SkeletonList />
        ) : displayed.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              {activeTab === 'all' ? '📋' : activeTab === 'approved' ? '✅' : '🔍'}
            </div>
            <p className={styles.emptyTitle}>
              {activeTab === 'all'
                ? 'No bookings yet'
                : `No ${activeTab} bookings`}
            </p>
            <p className={styles.emptyText}>
              {activeTab === 'all'
                ? 'Browse properties and send a booking request to get started.'
                : `You don't have any ${activeTab} bookings right now.`}
            </p>
            {activeTab === 'all' && (
              <Link to="/search" className={styles.btnExplore}>
                🔍 Explore Properties
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {displayed.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                cancelling={cancelling === booking._id}
                onCancel={handleCancelRequest}
              />
            ))}
          </div>
        )}

        {/* Pagination — only shown on "all" tab since others are client-filtered */}
        {activeTab === 'all' && totalPages > 1 && !loading && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => fetchBookings(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
            >
              ←
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={[styles.pageBtn, p === page ? styles.pageBtnActive : ''].join(' ')}
                onClick={() => fetchBookings(p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            ))}

            <button
              className={styles.pageBtn}
              onClick={() => fetchBookings(page + 1)}
              disabled={page >= totalPages}
              aria-label="Next page"
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* Cancel confirmation dialog */}
      <CancelConfirm
        isOpen={!!confirmId}
        loading={cancelling !== null}
        onConfirm={handleCancelConfirm}
        onClose={() => setConfirmId(null)}
      />

      {/* Review modal — shown for completed bookings */}
      {reviewBooking && (
        <ReviewModal
          isOpen={!!reviewBooking}
          onClose={() => setReviewBooking(null)}
          booking={reviewBooking}
          role="tenant"
          onSuccess={() => setReviewBooking(null)}
        />
      )}
    </div>
  );
}
