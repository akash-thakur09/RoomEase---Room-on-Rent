import React from 'react';
import { createPortal } from 'react-dom';
import styles from '../bookings.module.css';

/**
 * CancelConfirm — modal dialog asking the tenant to confirm cancellation.
 *
 * @param {boolean}  isOpen
 * @param {boolean}  loading
 * @param {Function} onConfirm
 * @param {Function} onClose
 */
export default function CancelConfirm({ isOpen, loading, onConfirm, onClose }) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className={styles.confirmOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-title"
    >
      <div className={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
        <p className={styles.confirmTitle} id="cancel-title">Cancel booking?</p>
        <p className={styles.confirmText}>
          This will cancel your booking request. The landlord will be notified.
          This action cannot be undone.
        </p>
        <div className={styles.confirmActions}>
          <button
            className={styles.btnConfirmKeep}
            onClick={onClose}
            disabled={loading}
          >
            Keep Booking
          </button>
          <button
            className={styles.btnConfirmCancel}
            onClick={onConfirm}
            disabled={loading}
            autoFocus
          >
            {loading ? 'Cancelling…' : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
