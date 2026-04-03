import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from '../properties.module.css';

/**
 * DeleteConfirm — portal confirmation dialog.
 * @param {boolean}  isOpen
 * @param {boolean}  loading
 * @param {string}   propertyName
 * @param {Function} onConfirm
 * @param {Function} onClose
 */
export default function DeleteConfirm({ isOpen, loading, propertyName, onConfirm, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={styles.confirmOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
    >
      <div className={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
        <p className={styles.confirmTitle} id="delete-title">Delete property?</p>
        <p className={styles.confirmText}>
          <strong>{propertyName}</strong> will be permanently removed. This cannot be undone.
        </p>
        <div className={styles.confirmActions}>
          <button className={styles.confirmKeepBtn} onClick={onClose} disabled={loading}>
            Keep
          </button>
          <button
            className={styles.confirmDeleteBtn}
            onClick={onConfirm}
            disabled={loading}
            autoFocus
          >
            {loading && (
              <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
            )}
            {loading ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
