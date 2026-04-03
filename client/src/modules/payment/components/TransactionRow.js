import React from 'react';
import PaymentBadge from './PaymentBadge';
import styles from '../payment.module.css';

const ICON_MAP = { success: '✅', pending: '⏳', failed: '❌' };
const BORDER_MAP = { success: styles.rowSuccess, pending: styles.rowPending, failed: styles.rowFailed };
const ICON_BG_MAP = { success: styles.rowIconSuccess, pending: styles.rowIconPending, failed: styles.rowIconFailed };

function formatAmount(paise) {
  return `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * TransactionRow
 * @param {Object}   payment   - populated payment document
 * @param {Function} onClick   - (payment) => void
 */
export default function TransactionRow({ payment, onClick }) {
  const property = payment.bookingId?.propertyId;
  const status   = payment.status;

  return (
    <div
      className={`${styles.row} ${BORDER_MAP[status] ?? ''}`}
      onClick={() => onClick(payment)}
      role="button"
      tabIndex={0}
      aria-label={`View payment details for ${property?.address ?? 'property'}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick(payment)}
    >
      {/* Icon */}
      <div className={`${styles.rowIcon} ${ICON_BG_MAP[status] ?? ''}`} aria-hidden="true">
        {ICON_MAP[status] ?? '💳'}
      </div>

      {/* Body */}
      <div className={styles.rowBody}>
        <p className={styles.rowTitle}>{property?.address ?? 'Unknown property'}</p>
        <div className={styles.rowSub}>
          <span>{property?.type ?? '—'}</span>
          <span className={styles.rowDivider} />
          <span>{property?.city ?? '—'}</span>
          <span className={styles.rowDivider} />
          <PaymentBadge status={status} showDot={false} />
        </div>
      </div>

      {/* Amount + date */}
      <div className={styles.rowRight}>
        <span
          className={[
            styles.rowAmount,
            status === 'success' ? styles.rowAmountSuccess : '',
            status === 'failed'  ? styles.rowAmountFailed  : '',
          ].filter(Boolean).join(' ')}
        >
          {formatAmount(payment.amount)}
        </span>
        <span className={styles.rowDate}>
          {new Date(payment.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </span>
      </div>

      <span className={styles.rowChevron} aria-hidden="true">›</span>
    </div>
  );
}
