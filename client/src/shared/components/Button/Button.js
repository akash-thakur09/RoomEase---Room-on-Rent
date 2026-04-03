import React from 'react';
import styles from './Button.module.css';

/**
 * Button
 *
 * @param {'primary'|'secondary'|'danger'|'ghost'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} loading   - shows spinner, disables interaction
 * @param {boolean} fullWidth - stretches to container width
 * @param {React.ReactNode} icon - optional leading icon
 * @param {string} as - render as 'button' (default) or 'a'
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon = null,
  as: Tag = 'button',
  className = '',
  disabled,
  ...props
}) {
  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth ? styles.full : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} disabled={disabled || loading} {...props}>
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        icon && <span className={styles.icon}>{icon}</span>
      )}
      {children}
    </Tag>
  );
}
