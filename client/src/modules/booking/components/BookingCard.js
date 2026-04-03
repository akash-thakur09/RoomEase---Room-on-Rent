import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import styles from '../bookings.module.css';

const TYPE_ICONS = { single: '🛏️', sharing: '🏠', apartment: '🏢' };

const CARD_BORDER = {
  pending:   styles.cardPending,
  approved:  styles.cardApproved,
  rejected:  styles.cardRejected,
  cancelled: styles.cardCancelled,
  completed: styles.cardCompleted,
};

/**
 * BookingCard — tenant-facing booking row.
 *
 * @param {Object}   booking      - populated booking document
 * @param {boolean}  cancelling   - true while cancel request is in-flight
 * @param {Function} onCancel     - (bookingId) => void — triggers confirm dialog
 */
export default function BookingCard({ booking, cancelling, onCancel }) {
  const property = booking.propertyId;
  const landlord = booking.landlordId;
  const canCancel = ['pending', 'approved'].includes(booking.status);
  const photo = property?.photos?.[0];

  return (
    <article
      className={`${styles.card} ${CARD_BORDER[booking.status] ?? ''}`}
      aria-label={`Booking for ${property?.address ?? 'property'}`}
    >
      {/* ── Top row ── */}
      <div className={styles.cardTop}>
        <div className={styles.cardLeft}>
          {/* Property thumbnail */}
          <div className={styles.propThumb}>
            {photo
              ? <img src={`/uploads/${photo}`} alt={property?.type} />
              : <span aria-hidden="true">{TYPE_ICONS[property?.type] ?? '🏠'}</span>
            }
          </div>

          {/* Property info */}
          <div className={styles.propInfo}>
            <p className={styles.propType}>{property?.type ?? '—'}</p>
            <p className={styles.propAddress}>{property?.address ?? 'Unknown address'}</p>
            <p className={styles.propCity}>📍 {property?.city ?? '—'}</p>
          </div>
        </div>

        {/* Status + date */}
        <div className={styles.cardRight}>
          <StatusBadge status={booking.status} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {new Date(booking.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* ── Meta row ── */}
      <div className={styles.cardMeta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Landlord</span>
          <span className={styles.metaValue}>{landlord?.name ?? '—'}</span>
        </div>

        {property?.rent != null && (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Rent</span>
            <span className={styles.metaValue}>
              ₹{property.rent.toLocaleString('en-IN')}/mo
            </span>
          </div>
        )}

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Payment</span>
          <span className={styles.metaValue} style={{ textTransform: 'capitalize' }}>
            {booking.paymentStatus}
          </span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Booking ID</span>
          <span className={styles.metaValue} style={{ fontFamily: 'monospace', fontSize: 11 }}>
            #{booking._id.slice(-8).toUpperCase()}
          </span>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className={styles.cardActions}>
        {property?._id && (
          <Link
            to={`/property/${property._id}`}
            className={styles.btnViewProperty}
          >
            View Property →
          </Link>
        )}

        {canCancel && (
          <button
            className={styles.btnCancel}
            onClick={() => onCancel(booking._id)}
            disabled={cancelling}
            aria-label="Cancel this booking"
          >
            {cancelling ? 'Cancelling…' : '✕ Cancel Booking'}
          </button>
        )}

        {booking.status === 'rejected' && (
          <span className={styles.cancelNote}>
            This booking was declined by the landlord.
          </span>
        )}

        {booking.status === 'cancelled' && (
          <span className={styles.cancelNote}>
            You cancelled this booking.
          </span>
        )}
      </div>
    </article>
  );
}
