import React from 'react';
import RequestBadge from './RequestBadge';
import styles from '../requests.module.css';

const TYPE_ICONS = { single: '🛏️', sharing: '🏠', apartment: '🏢' };

const BORDER = {
  pending:   styles.cardPending,
  approved:  styles.cardApproved,
  rejected:  styles.cardRejected,
  cancelled: styles.cardCancelled,
  completed: styles.cardCompleted,
};

/**
 * RequestCard — single booking request row.
 *
 * @param {Object}   booking
 * @param {string}   updating    - bookingId currently being updated
 * @param {Function} onApprove   - (bookingId) => void
 * @param {Function} onReject    - (bookingId) => void
 * @param {Function} onClick     - (booking) => void  — opens detail drawer
 */
export default function RequestCard({ booking, updating, onApprove, onReject, onClick }) {
  const tenant   = booking.tenantId;
  const property = booking.propertyId;
  const isPending  = booking.status === 'pending';
  const isUpdating = updating === booking._id;

  return (
    <article
      className={`${styles.card} ${BORDER[booking.status] ?? ''}`}
      onClick={() => onClick(booking)}
      role="button"
      tabIndex={0}
      aria-label={`Booking from ${tenant?.name ?? 'tenant'} — ${booking.status}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick(booking)}
    >
      <div className={styles.cardTop}>
        {/* Tenant avatar */}
        <div className={styles.avatar} aria-hidden="true">
          {tenant?.name?.[0]?.toUpperCase() ?? 'T'}
        </div>

        {/* Main info */}
        <div className={styles.cardBody}>
          <p className={styles.tenantName}>{tenant?.name ?? 'Unknown tenant'}</p>
          <p className={styles.tenantEmail}>{tenant?.email}</p>

          <div className={styles.cardMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Property</span>
              <span className={styles.metaValue}>
                {TYPE_ICONS[property?.type] ?? '🏠'} {property?.type}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Location</span>
              <span className={styles.metaValue}>{property?.city ?? '—'}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Payment</span>
              <span className={styles.metaValue}>{booking.paymentStatus}</span>
            </div>
          </div>
        </div>

        {/* Right: badge + date */}
        <div className={styles.cardRight} onClick={(e) => e.stopPropagation()}>
          <RequestBadge status={booking.status} />
          <span className={styles.cardDate}>
            {new Date(booking.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Inline approve / reject for pending */}
      {isPending && (
        <div className={styles.cardActions} onClick={(e) => e.stopPropagation()}>
          <button
            className={styles.approveBtn}
            onClick={() => onApprove(booking._id)}
            disabled={isUpdating}
            aria-label={`Approve booking from ${tenant?.name}`}
          >
            {isUpdating
              ? <span className={styles.btnSpinner} />
              : '✓'
            }
            {isUpdating ? 'Approving…' : 'Approve'}
          </button>
          <button
            className={styles.rejectBtn}
            onClick={() => onReject(booking._id)}
            disabled={isUpdating}
            aria-label={`Reject booking from ${tenant?.name}`}
          >
            {isUpdating ? '…' : '✕'} Reject
          </button>
        </div>
      )}
    </article>
  );
}
