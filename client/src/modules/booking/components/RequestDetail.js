import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import RequestBadge from './RequestBadge';
import styles from '../requests.module.css';

const TYPE_ICONS = { single: '🛏️', sharing: '🏠', apartment: '🏢' };

function DetailRow({ label, value }) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value ?? '—'}</span>
    </div>
  );
}

/**
 * RequestDetail — bottom-sheet drawer with full booking info + action buttons.
 *
 * @param {Object}   booking
 * @param {string}   updating
 * @param {Function} onApprove  - (bookingId) => void
 * @param {Function} onReject   - (bookingId) => void
 * @param {Function} onClose
 */
export default function RequestDetail({ booking, updating, onApprove, onReject, onComplete, onClose }) {
  const tenant   = booking.tenantId;
  const property = booking.propertyId;
  const isPending  = booking.status === 'pending';
  const isApproved = booking.status === 'approved';
  const isUpdating = updating === booking._id;

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return createPortal(
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Booking request details"
    >
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Handle */}
        <div className={styles.drawerHandle} aria-hidden="true" />

        {/* Header */}
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>Booking Request</h2>
          <button className={styles.drawerClose} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.drawerBody}>
          {/* Tenant block */}
          <div className={styles.tenantBlock}>
            <div className={styles.tenantBlockAvatar} aria-hidden="true">
              {tenant?.name?.[0]?.toUpperCase() ?? 'T'}
            </div>
            <div>
              <p className={styles.tenantBlockName}>{tenant?.name ?? 'Unknown'}</p>
              <p className={styles.tenantBlockEmail}>{tenant?.email}</p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <RequestBadge status={booking.status} />
            </div>
          </div>

          {/* Property block */}
          {property && (
            <Link
              to={`/property/${property._id}`}
              className={styles.propertyBlock}
              onClick={onClose}
            >
              <div className={styles.propertyThumb}>
                {TYPE_ICONS[property.type] ?? '🏠'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className={styles.propertyType}>{property.type}</p>
                <p className={styles.propertyAddress}>{property.address}</p>
                <p className={styles.propertyCity}>📍 {property.city}</p>
              </div>
              <span style={{ color: 'var(--primary)', fontSize: 14 }}>›</span>
            </Link>
          )}

          {/* Booking details */}
          <div className={styles.detailSection}>
            <p className={styles.detailSectionTitle}>Booking Details</p>
            <DetailRow label="Status"       value={<RequestBadge status={booking.status} />} />
            <DetailRow label="Payment"      value={
              <span style={{ textTransform: 'capitalize', fontWeight: 700, color: booking.paymentStatus === 'paid' ? 'var(--success)' : 'var(--warning)' }}>
                {booking.paymentStatus}
              </span>
            } />
            <DetailRow label="Requested on" value={new Date(booking.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric',
            })} />
            <DetailRow label="Last updated" value={new Date(booking.updatedAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric',
            })} />
            <DetailRow label="Booking ID"   value={
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>
                #{booking._id.slice(-10).toUpperCase()}
              </span>
            } />
          </div>
        </div>

        {/* Action buttons — pending: approve/reject; approved: mark complete */}
        {isPending && (
          <div className={styles.drawerActions}>
            <button
              className={styles.drawerApproveBtn}
              onClick={() => { onApprove(booking._id); onClose(); }}
              disabled={isUpdating}
            >
              {isUpdating ? <span className={styles.btnSpinner} /> : '✓'}
              {isUpdating ? 'Approving…' : 'Approve Request'}
            </button>
            <button
              className={styles.drawerRejectBtn}
              onClick={() => { onReject(booking._id); onClose(); }}
              disabled={isUpdating}
            >
              ✕ Reject
            </button>
          </div>
        )}
        {isApproved && onComplete && (
          <div className={styles.drawerActions}>
            <button
              className={styles.drawerApproveBtn}
              onClick={() => { onComplete(booking._id); onClose(); }}
              disabled={isUpdating}
              style={{ background: 'var(--success, #38a169)' }}
            >
              {isUpdating ? <span className={styles.btnSpinner} /> : '✓'}
              {isUpdating ? 'Updating…' : 'Mark as Completed'}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
