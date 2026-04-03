import React from 'react';
import styles from '../verification.module.css';

const BANNER = {
  none: {
    icon: '📋',
    title: 'Not submitted yet',
    text: 'Upload your identity documents to get verified. Verified users can book properties and access all features.',
    cls: styles.bannerNone,
  },
  pending: {
    icon: '⏳',
    title: 'Under review',
    text: 'Your documents have been submitted and are being reviewed. This usually takes 1–2 business days.',
    cls: styles.bannerPending,
  },
  verified: {
    icon: '✅',
    title: 'Verified',
    text: 'Your identity has been verified. You have full access to all platform features.',
    cls: styles.bannerVerified,
  },
  rejected: {
    icon: '❌',
    title: 'Verification rejected',
    text: 'Your documents were not accepted. Please review the note below and resubmit.',
    cls: styles.bannerRejected,
  },
};

/**
 * StatusBanner
 * @param {'none'|'pending'|'verified'|'rejected'} status
 * @param {string} note    - admin rejection note
 * @param {Date}   submittedAt
 * @param {Date}   reviewedAt
 */
export default function StatusBanner({ status = 'none', note, submittedAt, reviewedAt }) {
  const cfg = BANNER[status] ?? BANNER.none;

  return (
    <div className={`${styles.banner} ${cfg.cls}`} role="status" aria-live="polite">
      <span className={styles.bannerIcon} aria-hidden="true">{cfg.icon}</span>
      <div className={styles.bannerContent}>
        <p className={styles.bannerTitle}>{cfg.title}</p>
        <p className={styles.bannerText}>{cfg.text}</p>

        {submittedAt && (
          <p className={styles.bannerText} style={{ marginTop: 4, opacity: 0.75 }}>
            Submitted: {new Date(submittedAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        )}

        {reviewedAt && (
          <p className={styles.bannerText} style={{ marginTop: 2, opacity: 0.75 }}>
            Reviewed: {new Date(reviewedAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        )}

        {note && (
          <div className={styles.bannerNote}>
            <strong>Admin note:</strong> {note}
          </div>
        )}
      </div>
    </div>
  );
}
