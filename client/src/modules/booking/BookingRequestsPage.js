import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getBookings, updateBookingStatus } from '../../services/bookingService';
import { getBookingReviewStatus } from '../../services/reviewService';
import RequestCard   from './components/RequestCard';
import RequestDetail from './components/RequestDetail';
import RequestBadge  from './components/RequestBadge';
import ReviewModal   from '../review/ReviewModal';
import { useAuth }   from '../../shared/hooks/useAuth';
import styles from './requests.module.css';

const LIMIT = 10;
const ALL_TABS = ['all', 'pending', 'approved', 'rejected', 'cancelled', 'completed'];

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonList() {
  return (
    <div className={styles.list}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 15, width: '40%', marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 12, width: '55%', marginBottom: 12 }} />
              <div style={{ display: 'flex', gap: 16 }}>
                {[80, 70, 75].map((w, j) => (
                  <div key={j}>
                    <div className="skeleton" style={{ height: 10, width: w * 0.6, marginBottom: 4 }} />
                    <div className="skeleton" style={{ height: 13, width: w }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="skeleton" style={{ height: 26, width: 80, borderRadius: 20 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BookingRequestsPage() {
  const { user } = useAuth();
  const [bookings,   setBookings]   = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [activeTab,  setActiveTab]  = useState('all');
  const [search,     setSearch]     = useState('');
  const [updating,   setUpdating]   = useState(null);
  const [selected,   setSelected]   = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);

  const totalPages = Math.ceil(total / LIMIT);

  // ── Summary counts ────────────────────────────────────────────────────────
  const counts = useMemo(() => {
    const c = { all: bookings.length };
    ['pending', 'approved', 'rejected', 'cancelled', 'completed'].forEach((s) => {
      c[s] = bookings.filter((b) => b.status === s).length;
    });
    return c;
  }, [bookings]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await getBookings({ page: targetPage, limit: LIMIT });
      const { bookings: data, total: t } = res.data.data;
      setBookings(data);
      setTotal(t);
      setPage(targetPage);
    } catch (err) {
      setError(err.message || 'Failed to load booking requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(1); }, [fetchBookings]);

  // ── Auto-prompt review for completed bookings (landlord reviews tenant) ──
  useEffect(() => {
    const completed = bookings.filter((b) => b.status === 'completed');
    if (!completed.length) return;
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
  }, [bookings]); // eslint-disable-line

  // ── Client-side filter + search ───────────────────────────────────────────
  const displayed = useMemo(() => {
    let list = activeTab === 'all' ? bookings : bookings.filter((b) => b.status === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) =>
        b.tenantId?.name?.toLowerCase().includes(q) ||
        b.tenantId?.email?.toLowerCase().includes(q) ||
        b.propertyId?.address?.toLowerCase().includes(q) ||
        b.propertyId?.city?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [bookings, activeTab, search]);

  // ── Approve / Reject ──────────────────────────────────────────────────────
  const handleAction = useCallback(async (bookingId, status) => {
    setUpdating(bookingId);
    try {
      await updateBookingStatus(bookingId, status);
      setBookings((prev) =>
        prev.map((b) => b._id === bookingId ? { ...b, status } : b)
      );
      // Update selected drawer if open
      setSelected((prev) =>
        prev?._id === bookingId ? { ...prev, status } : prev
      );
    } catch (err) {
      setError(err.message || `Failed to ${status} booking.`);
    } finally {
      setUpdating(null);
    }
  }, []);

  const handleApprove = (id) => handleAction(id, 'approved');
  const handleReject  = (id) => handleAction(id, 'rejected');
  const handleComplete = (id) => handleAction(id, 'completed');

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Booking Requests</h1>
          <p className={styles.subtitle}>
            {loading ? 'Loading…' : `${total} request${total !== 1 ? 's' : ''} total`}
          </p>
        </div>

        {/* Summary strip */}
        {!loading && bookings.length > 0 && (
          <div className={styles.summary}>
            {[
              { key: 'pending',   label: 'Pending',   cls: styles.summaryCardPending   },
              { key: 'approved',  label: 'Approved',  cls: styles.summaryCardApproved  },
              { key: 'rejected',  label: 'Rejected',  cls: styles.summaryCardRejected  },
              { key: 'completed', label: 'Completed', cls: styles.summaryCardCompleted },
            ].map(({ key, label, cls }) => (
              <div key={key} className={`${styles.summaryCard} ${cls}`}>
                <p className={styles.summaryLabel}>{label}</p>
                <p className={styles.summaryValue}>{counts[key] ?? 0}</p>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className={styles.errorBox} role="alert">
            <span>⚠ {error}</span>
            <button className={styles.retryBtn} onClick={() => fetchBookings(page)}>Retry</button>
          </div>
        )}

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.tabs} role="tablist" aria-label="Filter by status">
            {ALL_TABS.map((tab) => {
              const isActive = activeTab === tab;
              const count    = counts[tab] ?? 0;
              return (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={isActive}
                  className={[styles.tab, isActive ? styles.tabActive : ''].join(' ')}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'all' ? 'All' : <RequestBadge status={tab} showDot={false} />}
                  {count > 0 && (
                    <span className={isActive ? styles.tabCount : styles.tabCountInactive}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search tenant, property…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search bookings"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <SkeletonList />
        ) : displayed.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              {activeTab === 'pending' ? '⏳' : activeTab === 'approved' ? '✅' : '📋'}
            </div>
            <p className={styles.emptyTitle}>
              {search
                ? 'No results found'
                : activeTab === 'all'
                  ? 'No booking requests yet'
                  : `No ${activeTab} requests`}
            </p>
            <p className={styles.emptyText}>
              {search
                ? 'Try a different search term.'
                : activeTab === 'all'
                  ? 'Booking requests from tenants will appear here.'
                  : `You don't have any ${activeTab} requests right now.`}
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            {displayed.map((booking) => (
              <RequestCard
                key={booking._id}
                booking={booking}
                updating={updating}
                onApprove={handleApprove}
                onReject={handleReject}
                onClick={setSelected}
              />
            ))}
          </div>
        )}

        {/* Pagination — only on "all" tab */}
        {activeTab === 'all' && !search && totalPages > 1 && !loading && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => fetchBookings(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
            >←</button>

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
            >→</button>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <RequestDetail
          booking={selected}
          updating={updating}
          onApprove={handleApprove}
          onReject={handleReject}
          onComplete={handleComplete}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Review modal — landlord reviews tenant after completion */}
      {reviewBooking && (
        <ReviewModal
          isOpen={!!reviewBooking}
          onClose={() => setReviewBooking(null)}
          booking={reviewBooking}
          role="landlord"
          onSuccess={() => setReviewBooking(null)}
        />
      )}
    </div>
  );
}
