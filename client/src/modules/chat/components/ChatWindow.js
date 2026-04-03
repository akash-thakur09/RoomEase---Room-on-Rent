import React, { useState, useEffect, useRef, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import styles from '../chat.module.css';

const MAX_CHARS = 1000;

/** Group consecutive messages from the same sender */
function groupMessages(messages) {
  const groups = [];
  messages.forEach((msg, i) => {
    const senderId = msg.senderId?._id ?? msg.senderId;
    const prevId   = i > 0 ? (messages[i - 1].senderId?._id ?? messages[i - 1].senderId) : null;
    const nextId   = i < messages.length - 1 ? (messages[i + 1].senderId?._id ?? messages[i + 1].senderId) : null;
    const isFirst  = senderId !== prevId;
    const isLast   = senderId !== nextId;
    const position = isFirst && isLast ? 'solo' : isFirst ? 'first' : isLast ? 'last' : 'middle';
    groups.push({ msg, position, showAvatar: isLast });
  });
  return groups;
}

/** Format a date for the separator label */
function formatDateSep(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString())     return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

/** Insert date separators between messages from different days */
function withDateSeps(grouped) {
  const result = [];
  let lastDate = null;
  grouped.forEach(({ msg, position, showAvatar }) => {
    const dateKey = msg.createdAt ? new Date(msg.createdAt).toDateString() : null;
    if (dateKey && dateKey !== lastDate) {
      result.push({ type: 'sep', label: formatDateSep(msg.createdAt), key: `sep-${dateKey}` });
      lastDate = dateKey;
    }
    result.push({ type: 'msg', msg, position, showAvatar });
  });
  return result;
}

/**
 * ChatWindow
 *
 * @param {Object}   conversation   - active conversation document
 * @param {Array}    messages       - message list
 * @param {boolean}  loadingMsgs
 * @param {boolean}  sending
 * @param {boolean}  isTyping       - other person is typing
 * @param {string}   currentUserId
 * @param {string}   socketStatus   - 'connected'|'connecting'|'disconnected'
 * @param {Function} onSend         - (text) => void
 * @param {Function} onRetry        - (message) => void
 * @param {Function} onBack         - mobile back button
 */
export default function ChatWindow({
  conversation,
  messages = [],
  loadingMsgs = false,
  sending = false,
  isTyping = false,
  currentUserId,
  socketStatus = 'disconnected',
  onSend,
  onRetry,
  onBack,
}) {
  const [text, setText]         = useState('');
  const bottomRef               = useRef(null);
  const inputRef                = useRef(null);
  const prevMsgCount            = useRef(0);

  const other = conversation?.participants?.find(
    (p) => (p._id ?? p) !== currentUserId
  ) ?? {};

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length !== prevMsgCount.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      prevMsgCount.current = messages.length;
    }
  }, [messages.length]);

  // Focus input when conversation changes
  useEffect(() => {
    if (conversation) inputRef.current?.focus();
  }, [conversation?._id]); // eslint-disable-line

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > MAX_CHARS || sending) return;
    onSend(trimmed);
    setText('');
  }, [text, sending, onSend]);

  // Send on Enter (Shift+Enter = newline)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const charCount   = text.length;
  const overLimit   = charCount > MAX_CHARS;
  const nearLimit   = charCount > MAX_CHARS * 0.85;
  const canSend     = text.trim().length > 0 && !overLimit && !sending;

  const grouped  = groupMessages(messages);
  const withSeps = withDateSeps(grouped);

  // Socket status badge
  const statusCls = {
    connected:    styles.socketConnected,
    connecting:   styles.socketConnecting,
    disconnected: styles.socketDisconnected,
  }[socketStatus] ?? styles.socketDisconnected;

  const dotCls = {
    connected:    styles.socketDotConnected,
    connecting:   styles.socketDotConnecting,
    disconnected: styles.socketDotDisconnected,
  }[socketStatus] ?? styles.socketDotDisconnected;

  const statusLabel = { connected: 'Live', connecting: 'Connecting…', disconnected: 'Offline' }[socketStatus];

  if (!conversation) {
    return (
      <div className={styles.window}>
        <div className={styles.placeholder}>
          <span className={styles.placeholderIcon}>💬</span>
          <p className={styles.placeholderTitle}>Your messages</p>
          <p className={styles.placeholderText}>
            Select a conversation from the sidebar, or start one from a property page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.window}>
      {/* Mobile back */}
      {onBack && (
        <button className={styles.mobileBack} onClick={onBack} aria-label="Back to conversations">
          ← Back
        </button>
      )}

      {/* Header */}
      <div className={styles.windowHeader}>
        <div className={styles.windowHeaderLeft}>
          <div className={styles.convAvatar} style={{ width: 38, height: 38, fontSize: 14 }}>
            {other.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className={styles.windowHeaderName}>{other.name ?? 'Unknown'}</p>
            <p className={styles.windowHeaderSub} style={{ textTransform: 'capitalize' }}>
              {other.role ?? ''}
            </p>
          </div>
        </div>

        {/* Socket status */}
        <span className={`${styles.socketBadge} ${statusCls}`}>
          <span className={`${styles.socketDot} ${dotCls}`} />
          {statusLabel}
        </span>
      </div>

      {/* Messages */}
      <div className={styles.messages} role="log" aria-live="polite" aria-label="Messages">
        {loadingMsgs ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                height: 38,
                width: `${35 + (i % 3) * 15}%`,
                borderRadius: 18,
                alignSelf: i % 2 === 0 ? 'flex-start' : 'flex-end',
                marginBottom: 4,
              }}
            />
          ))
        ) : messages.length === 0 ? (
          <div className={styles.placeholder} style={{ flex: 'none', padding: '40px 0' }}>
            <span style={{ fontSize: 36 }}>👋</span>
            <p style={{ fontWeight: 600, color: 'var(--text)' }}>Say hello!</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Start the conversation with {other.name ?? 'this person'}.
            </p>
          </div>
        ) : (
          withSeps.map((item) =>
            item.type === 'sep' ? (
              <div key={item.key} className={styles.dateSep}>{item.label}</div>
            ) : (
              <MessageBubble
                key={item.msg._id ?? item.msg._tempId}
                message={item.msg}
                isMine={(item.msg.senderId?._id ?? item.msg.senderId) === currentUserId}
                showAvatar={item.showAvatar}
                senderName={other.name}
                position={item.position}
                isNew={item.msg._isNew === true}
                onRetry={onRetry}
              />
            )
          )
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className={styles.typingRow}>
            <div className={styles.convAvatar} style={{ width: 28, height: 28, fontSize: 11 }}>
              {other.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className={styles.typingBubble}>
              <span className={styles.typingDot} />
              <span className={styles.typingDot} />
              <span className={styles.typingDot} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form className={styles.inputBar} onSubmit={handleSubmit}>
        <div className={styles.inputWrap}>
          <textarea
            ref={inputRef}
            className={styles.input}
            placeholder="Type a message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={MAX_CHARS + 10}
            aria-label="Message input"
            disabled={sending}
          />
          {nearLimit && (
            <span className={[
              styles.charCount,
              overLimit ? styles.charCountOver : styles.charCountWarn,
            ].join(' ')}>
              {MAX_CHARS - charCount}
            </span>
          )}
        </div>

        <button
          type="submit"
          className={styles.sendBtn}
          disabled={!canSend}
          aria-label="Send message"
        >
          {sending ? (
            <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
          ) : '➤'}
        </button>
      </form>
    </div>
  );
}
