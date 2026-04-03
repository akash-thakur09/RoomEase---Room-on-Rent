import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../shared/hooks/useAuth';
import { getVerificationStatus, uploadDocuments } from '../../services/verificationService';
import StatusBanner    from './components/StatusBanner';
import DocumentUploader from './components/DocumentUploader';
import DocumentList    from './components/DocumentList';
import styles from './verification.module.css';

// ── Process steps sidebar ─────────────────────────────────────────────────────
function ProcessSteps({ status }) {
  const steps = [
    {
      num: 1,
      title: 'Upload documents',
      text: 'Submit a government-issued ID (Aadhar, PAN, passport).',
      done: status !== 'none',
    },
    {
      num: 2,
      title: 'Admin review',
      text: 'Our team reviews your documents within 1–2 business days.',
      done: status === 'verified' || status === 'rejected',
    },
    {
      num: 3,
      title: 'Get verified',
      text: 'Once approved, you can book properties and access all features.',
      done: status === 'verified',
    },
  ];

  return (
    <div className={styles.steps}>
      {steps.map((s) => (
        <div key={s.num} className={styles.step}>
          <div className={`${styles.stepNum} ${s.done ? styles.stepNumDone : ''}`}>
            {s.done ? '✓' : s.num}
          </div>
          <div className={styles.stepBody}>
            <p className={styles.stepTitle}>{s.title}</p>
            <p className={styles.stepText}>{s.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <>
      <div className={`skeleton ${styles.skeletonBanner}`} />
      <div className={`skeleton ${styles.skeletonCard}`} />
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function VerificationPage() {
  const { user } = useAuth();

  const [record,     setRecord]     = useState(null);   // verification document or null
  const [status,     setStatus]     = useState('none'); // 'none'|'pending'|'verified'|'rejected'
  const [loading,    setLoading]    = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [submitErr,  setSubmitErr]  = useState('');
  const [submitted,  setSubmitted]  = useState(false);

  // ── Fetch current status ──────────────────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    if (!user?.userId) return;
    try {
      const res = await getVerificationStatus(user.userId);
      setRecord(res.data.data);
      setStatus(res.data.data.status);
    } catch (err) {
      // 404 = no record yet — that's fine
      if (err.response?.status === 404) {
        setRecord(null);
        setStatus('none');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  // ── Upload handler ────────────────────────────────────────────────────────
  const handleUpload = async (formData) => {
    setSubmitting(true);
    setSubmitErr('');
    try {
      const res = await uploadDocuments(formData);
      setRecord(res.data.data);
      setStatus('pending');
      setSubmitted(true);
    } catch (err) {
      setSubmitErr(err.message || 'Upload failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Decide whether to show the upload form ────────────────────────────────
  // Show form if: never submitted, or previously rejected (allow resubmission)
  const showUploader = status === 'none' || status === 'rejected';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Identity Verification</h1>
        <p className={styles.pageSub}>
          Verify your identity to unlock full access — booking properties, messaging landlords, and more.
        </p>

        {loading ? (
          <PageSkeleton />
        ) : (
          <>
            {/* Status banner */}
            <StatusBanner
              status={submitted ? 'pending' : status}
              note={record?.note}
              submittedAt={record?.submittedAt}
              reviewedAt={record?.reviewedAt}
            />

            {/* Process steps */}
            <ProcessSteps status={submitted ? 'pending' : status} />

            {/* Previously submitted documents */}
            {record?.documents?.length > 0 && !submitted && (
              <DocumentList
                documents={record.documents}
                submittedAt={record.submittedAt}
              />
            )}

            {/* Upload form */}
            {showUploader && (
              <DocumentUploader
                submitting={submitting}
                submitted={submitted}
                error={submitErr}
                success={submitted}
                onSubmit={handleUpload}
              />
            )}

            {/* Already verified — nothing more to do */}
            {status === 'verified' && (
              <div
                style={{
                  textAlign: 'center', padding: '32px 24px',
                  background: 'var(--surface)', borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow)',
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                  You're fully verified!
                </p>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                  Your identity has been confirmed. Enjoy full access to RoomEase.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
