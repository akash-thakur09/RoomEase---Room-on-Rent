import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

/**
 * Modal
 *
 * @param {boolean}  isOpen
 * @param {Function} onClose
 * @param {string}   title
 * @param {'sm'|'md'|'lg'|'xl'|'full'} size
 * @param {boolean}  closeOnOverlay  - close when clicking backdrop (default true)
 * @param {boolean}  showClose       - show × button in header (default true)
 * @param {React.ReactNode} footer   - optional footer content
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnOverlay = true,
  showClose = true,
  footer,
  children,
}) {
  // Close on Escape key
  const handleKey = useCallback(
    (e) => { if (e.key === 'Escape') onClose?.(); },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKey]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={styles.overlay}
      onClick={closeOnOverlay ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={[styles.box, styles[size]].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showClose) && (
          <div className={styles.header}>
            {title && <h2 id="modal-title" className={styles.title}>{title}</h2>}
            {showClose && (
              <button className={styles.close} onClick={onClose} aria-label="Close modal">
                ✕
              </button>
            )}
          </div>
        )}

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
