import React, { useState } from 'react';
import styles from '../review.module.css';

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

/**
 * StarPicker — interactive star rating input.
 *
 * @param {number}   value     - current rating (0 = none)
 * @param {Function} onChange  - (rating: number) => void
 * @param {boolean}  disabled
 */
export default function StarPicker({ value, onChange, disabled = false }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div>
      <div
        className={styles.picker}
        role="group"
        aria-label="Select star rating"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={[
              styles.pickerBtn,
              n <= active ? styles.pickerBtnActive : '',
              hover && n <= hover ? styles.pickerBtnHovered : '',
            ].filter(Boolean).join(' ')}
            onMouseEnter={() => !disabled && setHover(n)}
            onMouseLeave={() => !disabled && setHover(0)}
            onClick={() => !disabled && onChange(n === value ? 0 : n)}
            aria-label={`${n} star${n > 1 ? 's' : ''} — ${LABELS[n]}`}
            aria-pressed={value === n}
            disabled={disabled}
          >
            ★
          </button>
        ))}
      </div>
      <p className={styles.pickerLabel}>
        {LABELS[active] ?? ''}
      </p>
    </div>
  );
}
