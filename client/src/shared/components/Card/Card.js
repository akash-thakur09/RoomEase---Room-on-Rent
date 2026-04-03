import React from 'react';
import styles from './Card.module.css';

/**
 * Card — generic surface container.
 *
 * @param {'none'|'sm'|'md'|'lg'} padding
 * @param {boolean} hoverable  - lift on hover
 * @param {boolean} bordered   - border instead of shadow
 * @param {string}  className  - extra classes
 * @param {Function} onClick
 */
export default function Card({
  children,
  padding = 'md',
  hoverable = false,
  bordered = false,
  className = '',
  onClick,
  ...props
}) {
  const padClass = {
    none: styles.padNone,
    sm:   styles.padSm,
    md:   styles.padMd,
    lg:   styles.padLg,
  }[padding] ?? styles.padMd;

  const classes = [
    styles.card,
    padClass,
    hoverable ? styles.hoverable : '',
    bordered  ? styles.bordered  : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
}

/** Convenience sub-components for structured cards */
Card.Header = function CardHeader({ children, className = '' }) {
  return <div className={`${styles.header} ${className}`}>{children}</div>;
};

Card.Body = function CardBody({ children, className = '' }) {
  return <div className={`${styles.body} ${className}`}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = '' }) {
  return <div className={`${styles.footer} ${className}`}>{children}</div>;
};
