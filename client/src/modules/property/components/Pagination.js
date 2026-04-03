import React from 'react';
import styles from '../search.module.css';

/**
 * Pagination
 *
 * @param {number}   page       - current page (1-indexed)
 * @param {number}   totalPages
 * @param {Function} onPage     - (pageNumber) => void
 */
export default function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;

  // Build page number array with ellipsis: [1, …, 4, 5, 6, …, 12]
  const pages = buildPages(page, totalPages);

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        className={styles.pageBtn}
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        ←
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className={styles.pageEllipsis}>…</span>
        ) : (
          <button
            key={p}
            className={[styles.pageBtn, p === page ? styles.pageBtnActive : ''].join(' ')}
            onClick={() => onPage(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        className={styles.pageBtn}
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        →
      </button>
    </nav>
  );
}

function buildPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [];
  const addPage = (p) => pages.push(p);
  const addEllipsis = () => { if (pages[pages.length - 1] !== '…') pages.push('…'); };

  addPage(1);
  if (current > 3) addEllipsis();

  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    addPage(p);
  }

  if (current < total - 2) addEllipsis();
  addPage(total);

  return pages;
}
