import React, { useRef, useEffect } from 'react';
import styles from '../search.module.css';

/**
 * SearchBar
 * Controlled input with debounced onChange and a clear button.
 *
 * @param {string}   value
 * @param {Function} onChange   - called with the raw string value
 * @param {string}   placeholder
 * @param {boolean}  autoFocus
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search by city or address…',
  autoFocus = false,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <div className={styles.searchWrap}>
      <span className={styles.searchIcon} aria-hidden="true">🔍</span>
      <input
        ref={inputRef}
        type="search"
        className={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search properties"
      />
      {value && (
        <button
          className={styles.clearBtn}
          onClick={() => onChange('')}
          aria-label="Clear search"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
}
