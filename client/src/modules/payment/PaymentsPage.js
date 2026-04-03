import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getPaymentHistory } from '../../services/paymentService';
import PaymentBadge     from './components/PaymentBadge';
import TransactionRow   from './components/TransactionRow';
import TransactionDetail from './components/TransactionDetail';
import styles from './payment.module.css';

const LIMIT = 10;
const ALL_TABS = ['all', 'success', 'pending', 'failed'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatAmount(paise) {
  return `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

function buildSummary(payments) {
  const total   = payments.reduce((s, p) => s + p.amount, 0);
  const success = payments.filter((p) => p.status === 'success');
  const pending = payments.filter((p) => p.status === 'pending');
  const failed  = payments.filter((p) => p.status === 'failed');
  return { total, success, pending, failed };
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonList() {
  return (
    <div className={styles.list}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={styles.skeletonRow}>
          <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 14, width: '55%', marginBottom: 7 }} />
            <div className="skeleton" style={{ height: 11, width: '75%' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
            <div className="skeleton" style={{ height: 18, width: 70 }} />
            <div className="skeleton" style={{ height: 11, width: 55 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PaymentsPage() {
  const [allPayments, setAllPayments] = useState([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [activeTab,   setActiveTab]   = useState('all');
  const [selected,    setSelected]    = useState(null); // payment for detail drawer

  const totalPages = Math.ceil(total / LIMIT);
  const summary    = useMemo(() => buildSummary(allPayments), [allPayments]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchPayments = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await getPaymentHistory({ page: targetPage, limit: LIMIT });
      const { payments, total: t } = res.data.data;
      setAllPayments(payments);
      setTotal(t);
      setPage(targetPage);
    } catch (err) {
      setError(err.message || 'Failed to load payment history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayments(1); }, [fetchPayments]);

  // Client-side filter by tab
  const displayed = activeTab === 'all'
    ? allPayments
    : allPayments.filter((p) => p.status === activeTab);

  const tabCounts = useMemo(() => ({
    all:     allPayments.length,
    success: summary.success.length,
    pending: summary.pending.length,
    failed:  summary.failed.length,
  }), [allPayments, summary]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Payments</h1>
          <p className={styles.subtitle}>
            {loading ? 'Loading…' : `${total} transaction${total !== 1 ? 's' : ''} total`}
          </p>
        </div>

        {/* Summary cards */}
        {!loading && allPayments.length > 0 && (
          <div className={styles.summaryGrid}>
            <div className={`${styles.summaryCard} ${styles.summaryCardTotal}`}>
              <p className={styles.summaryLabel}>Total Paid</p>
              <p className={styles.summaryValue}>
                {formatAmount(summary.success.reduce((s, p) => s + p.amount, 0))}
              </p>
              <p className={styles.summaryCount}>{summary.success.length} successful</p>
            </div>
            <div className={`${styles.summaryCard} ${styles.summaryCardPending}`}>
              <p className={styles.summaryLabel}>Pending</p>
              <p className={styles.summaryValue}>
                {formatAmount(summary.pending.reduce((s, p) => s + p.amount, 0))}
              </p>
              <p className={styles.summaryCount}>{summary.pending.length} transaction{summary.pending.length !== 1 ? 's' : ''}</p>
            </div>
            <div className={`${styles.summaryCard} ${styles.summaryCardFailed}`}>
              <p className={styles.summaryLabel}>Failed</p>
              <p className={styles.summaryValue}>{summary.failed.length}</p>
              <p className={styles.summaryCount}>transaction{summary.failed.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className={styles.tabs} role="tablist" aria-label="Filter by payment status">
          {ALL_TABS.map((tab) => {
            const isActive = activeTab === tab;
            const count    = tabCounts[tab] ?? 0;
            return (
              <button
                key={tab}
                role="tab"
                aria-selected={isActive}
                className={[styles.tab, isActive ? styles.tabActive : ''].join(' ')}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'all' ? 'All' : <PaymentBadge status={tab} showDot={false} />}
                {count > 0 && (
                  <span className={isActive ? styles.tabCount : styles.tabCountInactive}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className={styles.errorBox} role="alert">
            <span>⚠ {error}</span>
            <button className={styles.retryBtn} onClick={() => fetchPayments(page)}>Retry</button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <SkeletonList />
        ) : displayed.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              {activeTab === 'all' ? '💳' : activeTab === 'success' ? '✅' : activeTab === 'failed' ? '❌' : '⏳'}
            </div>
            <p className={styles.emptyTitle}>
              {activeTab === 'all' ? 'No transactions yet' : `No ${activeTab} payments`}
            </p>
            <p className={styles.emptyText}>
              {activeTab === 'all'
                ? 'Your payment history will appear here once you make a payment.'
                : `You don't have any ${activeTab} payments.`}
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            {displayed.map((payment) => (
              <TransactionRow
                key={payment._id}
                payment={payment}
                onClick={setSelected}
              />
            ))}
          </div>
        )}

        {/* Pagination — only on "all" tab */}
        {activeTab === 'all' && totalPages > 1 && !loading && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => fetchPayments(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
            >←</button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={[styles.pageBtn, p === page ? styles.pageBtnActive : ''].join(' ')}
                onClick={() => fetchPayments(p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            ))}

            <button
              className={styles.pageBtn}
              onClick={() => fetchPayments(page + 1)}
              disabled={page >= totalPages}
              aria-label="Next page"
            >→</button>
          </div>
        )}
      </div>

      {/* Transaction detail drawer */}
      {selected && (
        <TransactionDetail
          payment={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
