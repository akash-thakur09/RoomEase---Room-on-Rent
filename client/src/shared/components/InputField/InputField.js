import React, { forwardRef } from 'react';
import styles from './InputField.module.css';

/**
 * InputField
 *
 * @param {string}  label       - visible label text
 * @param {string}  error       - validation error message
 * @param {string}  hint        - helper text below input
 * @param {boolean} required    - shows asterisk on label
 * @param {React.ReactNode} iconLeft  - leading icon
 * @param {React.ReactNode} iconRight - trailing icon (e.g. password toggle)
 * @param {string}  id          - links label to input; auto-derived from name if omitted
 *
 * All native <input> props (type, value, onChange, placeholder, …) are forwarded.
 */
const InputField = forwardRef(function InputField(
  { label, error, hint, required, iconLeft, iconRight, id, className = '', ...inputProps },
  ref
) {
  const inputId = id || inputProps.name;

  const inputClass = [
    styles.input,
    error ? styles.hasError : '',
    iconLeft ? styles.hasIcon : '',
    iconRight ? styles.hasRightIcon : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true">*</span>}
        </label>
      )}

      <div className={styles.inputWrap}>
        {iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
        <input
          ref={ref}
          id={inputId}
          className={inputClass}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...inputProps}
        />
        {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
      </div>

      {error && (
        <span id={`${inputId}-error`} className={styles.error} role="alert">
          ⚠ {error}
        </span>
      )}
      {!error && hint && (
        <span id={`${inputId}-hint`} className={styles.hint}>
          {hint}
        </span>
      )}
    </div>
  );
});

export default InputField;
