import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import PaymentBadge from './PaymentBadge';
import styles from '../payment.module.css';

const TYPE_ICONS = { single: '🛏️', sharing: '🏠', apartment: '🏢' };

function formatAmount(paise) {
  return `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function DetailRow({ label, value, mono = false }) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={`${styles.detailValue} ${mono ? styles.detailValueMono : ''}`}>
        {value ?? '—'}
      </span>
    </div>
  );
}

/**
 * TransactionDetail — bottom-sheet / modal showing full payment info.
 * @param {Object}   payment
 * @param {Function} onClose
 */
export default function TransactionDetail({ payment, onClose }) {
  const property = payment.bookingId?.propertyId;
  const landlord = payment.bookingId?.landlordId;
  const status   = payment.status;

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

  const amountClass = [
    styles.amountHeroValue,
    status === 'success' ? styles.amountHeroSuccess : '',
    status === 'failed'  ? styles.amountHeroFailed  : '',
  ].filter(Boolean).join(' ');

  return createPortal(
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Transaction details"
    >
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Handle bar (mobile) */}
        <div className={styles.drawerHandle} aria-hidden="true" />

        {/* Header */}
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>Transaction Details</h2>
          <button className={styles.drawerClose} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Amount hero */}
        <div className={styles.amountHero}>
          <p className={amountClass}>{formatAmount(payment.amount)}</p>
          <PaymentBadge status={status} />
        </div>

        {/* Property mini card */}
        {property && (
          <Link
            to={`/property/${property._id}`}
            className={styles.propertyMini}
            onClick={onClose}
          >
            <div className={styles.propertyMiniThumb}>
              {TYPE_ICONS[property.type] ?? '🏠'}
            </div>
            <div className={styles.propertyMiniInfo}>
              <p className={styles.propertyMiniType}>{property.type}</p>
              <p className={styles.propertyMiniAddr}>{property.address}</p>
              <p className={styles.propertyMiniCity}>📍 {property.city}</p>
            </div>
            <span style={{ color: 'var(--primary)', fontSize: 14 }}>›</span>
          </Link>
        )}

        {/* Detail rows */}
        <div className={styles.detailList}>
          <DetailRow label="Status"       value={<PaymentBadge status={status} />} />
          <DetailRow label="Amount"       value={formatAmount(payment.amount)} />
          <DetailRow label="Date"         value={new Date(payment.createdAt).toLocaleString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })} />
          {landlord && (
            <DetailRow label="Landlord"   value={landlord.name} />
          )}
          <DetailRow label="Order ID"     value={payment.orderId}       mono />
          {payment.transactionId && (
            <DetailRow label="Transaction ID" value={payment.transactionId} mono />
          )}
          <DetailRow label="Payment ID"   value={`#${payment._id.slice(-10).toUpperCase()}`} mono />
          {payment.bookingId?.status && (
            <DetailRow label="Booking"    value={payment.bookingId.status} />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
