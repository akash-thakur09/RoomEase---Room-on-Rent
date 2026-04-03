import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { updateBookingStatus } from '../../../services/bookingService';
import styles from '../dashboard.module.css';

const BADGE_MAP = {
  pending:   styles.badgePending,
  approved:  styles.badgeApproved,
  rejected:  styles.badgeRejected,
  cancelled: styles.badgeCancelled,
  completed: styles.badgeCompleted,
};

/**
 * RecentBookings — latest 5 booking requests with inline approve/reject.
 * @param {Array}    bookings
 * @param {Function} onStatusChange  - (bookingId, newStatus) => void
 */
export default function RecentBookings({ bookings = [], onStatusChange }) {
  const [updating, setUpdating] = useState(null);

  const handleAction = async (bookingId, status) => {
    setUpdating(bookingId);
    try {
      await updateBookingStatus(bookingId, status);
      onStatusChange?.(bookingId, status);
    } catch {
      // silently fail — parent can show error if needed
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Recent Booking Requests</span>
        <Link to="/landlord/bookings" className={styles.sectionLink}>View all →</Link>
      </div>

      <div className={styles.bookingList}>
        {bookings.length === 0 ? (
          <div className={styles.emptyRow}>No booking requests yet</div>
        ) : (
          bookings.map((b) => {
            const tenant   = b.tenantId;
            const property = b.propertyId;
            const isPending = b.status === 'pending';

            return (
              <div key={b._id} className={styles.bookingRow}>
                {/* Tenant avatar */}
                <div className={styles.tenantAvatar} aria-hidden="true">
                  {tenant?.name?.[0]?.toUpperCase() ?? 'T'}
                </div>

                {/* Info */}
                <div className={styles.bookingInfo}>
                  <p className={styles.tenantName}>{tenant?.name ?? 'Unknown tenant'}</p>
                  <p className={styles.propAddr}>
                    {property?.type} · {property?.address}, {property?.city}
                  </p>
                </div>

                {/* Right: badge + actions */}
                <div className={styles.bookingRight}>
                  <span className={`${styles.badge} ${BADGE_MAP[b.status] ?? ''}`}>
                    {b.status}
                  </span>
                  {isPending && (
                    <div className={styles.bookingActions}>
                      <button
                        className={styles.approveBtn}
                        onClick={() => handleAction(b._id, 'approved')}
                        disabled={updating === b._id}
                        aria-label={`Approve booking from ${tenant?.name}`}
                      >
                        ✓
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={() => handleAction(b._id, 'rejected')}
                        disabled={updating === b._id}
                        aria-label={`Reject booking from ${tenant?.name}`}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
