import React from 'react';
import styles from '../chat.module.css';

/**
 * MessageBubble
 *
 * @param {Object}  message       - message document
 * @param {boolean} isMine        - true if sent by current user
 * @param {boolean} showAvatar    - show sender avatar (first in a group)
 * @param {string}  senderName    - display name for avatar initial
 * @param {'first'|'middle'|'last'|'solo'} position - within a consecutive group
 * @param {boolean} isNew         - animate in
 * @param {Function} onRetry      - called if message failed
 */
export default function MessageBubble({
  message,
  isMine,
  showAvatar,
  senderName = '',
  position = 'solo',
  isNew = false,
  onRetry,
}) {
  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const isPending = message._pending === true;
  const isFailed  = message._failed  === true;

  // Shape class based on position in group
  const shapeClass = isMine
    ? { first: styles.bubbleMineFirst, middle: styles.bubbleMineMiddle, last: styles.bubbleMineLast, solo: '' }[position] ?? ''
    : { first: styles.bubbleFirst,     middle: styles.bubbleMiddle,     last: styles.bubbleLast,     solo: '' }[position] ?? '';

  return (
    <div
      className={[
        styles.bubbleRow,
        isMine ? styles.bubbleRowMine : '',
        position === 'middle' || position === 'last' ? styles.bubbleRowGrouped : '',
      ].filter(Boolean).join(' ')}
    >
      {/* Avatar — only shown for other person's first message in a group */}
      <div className={[styles.bubbleAvatar, (isMine || !showAvatar) ? styles.bubbleAvatarHidden : ''].join(' ')}
        aria-hidden="true"
      >
        {senderName?.[0]?.toUpperCase() ?? '?'}
      </div>

      {/* Bubble */}
      <div
        className={[
          styles.bubble,
          isMine    ? styles.bubbleMine    : '',
          isPending ? styles.bubblePending : '',
          isFailed  ? styles.bubbleFailed  : '',
          shapeClass,
          isNew     ? styles.bubbleAnimate : '',
        ].filter(Boolean).join(' ')}
      >
        <p className={styles.bubbleText}>{message.text ?? message.content}</p>

        <div className={styles.bubbleMeta}>
          {time && <span className={styles.bubbleTime}>{time}</span>}
          {isMine && (
            <span className={styles.bubbleTick} aria-hidden="true">
              {isFailed ? '✕' : isPending ? '○' : '✓✓'}
            </span>
          )}
        </div>

        {isFailed && onRetry && (
          <button className={styles.bubbleRetry} onClick={() => onRetry(message)}>
            Tap to retry
          </button>
        )}
      </div>
    </div>
  );
}
