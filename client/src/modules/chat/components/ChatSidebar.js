import React, { useState, useMemo } from 'react';
import styles from '../chat.module.css';

/** Format a timestamp to a short relative label */
function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)  return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

function ConvSkeleton() {
  return (
    <div className={styles.convSkeleton}>
      <div className="skeleton" style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 13, width: '55%', marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 11, width: '80%' }} />
      </div>
    </div>
  );
}

/**
 * ChatSidebar
 *
 * @param {Array}    conversations  - populated conversation list
 * @param {Object}   activeConv     - currently selected conversation
 * @param {string}   currentUserId
 * @param {Set}      onlineUsers    - set of online userIds
 * @param {boolean}  loading
 * @param {Function} onSelect       - (conversation) => void
 */
export default function ChatSidebar({
  conversations = [],
  activeConv,
  currentUserId,
  onlineUsers = new Set(),
  loading = false,
  onSelect,
}) {
  const [search, setSearch] = useState('');

  const getOther = (conv) =>
    conv.participants?.find((p) => (p._id ?? p) !== currentUserId) ?? {};

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => {
      const other = getOther(c);
      return (
        other.name?.toLowerCase().includes(q) ||
        other.email?.toLowerCase().includes(q)
      );
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, search]);

  return (
    <aside className={styles.sidebar}>
      {/* Header */}
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Messages</h2>
        <div className={styles.sidebarSearch}>
          <span className={styles.sidebarSearchIcon}>🔍</span>
          <input
            type="search"
            className={styles.sidebarSearchInput}
            placeholder="Search conversations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search conversations"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <ul className={styles.convList} aria-label="Loading conversations">
          {Array.from({ length: 5 }).map((_, i) => <ConvSkeleton key={i} />)}
        </ul>
      ) : filtered.length === 0 ? (
        <div className={styles.sidebarEmpty}>
          <span className={styles.sidebarEmptyIcon}>💬</span>
          <p className={styles.sidebarEmptyText}>
            {search ? 'No conversations match your search.' : 'No conversations yet.\nBook a property to start chatting.'}
          </p>
        </div>
      ) : (
        <ul className={styles.convList} role="listbox" aria-label="Conversations">
          {filtered.map((conv) => {
            const other   = getOther(conv);
            const otherId = other._id ?? other;
            const isActive  = activeConv?._id === conv._id;
            const isOnline  = onlineUsers.has(String(otherId));
            const lastMsg   = conv.lastMessage;

            return (
              <li
                key={conv._id}
                role="option"
                aria-selected={isActive}
                className={[
                  styles.convItem,
                  isActive ? styles.convItemActive : '',
                ].join(' ')}
                onClick={() => onSelect(conv)}
              >
                {/* Avatar */}
                <div className={styles.convAvatar}>
                  {other.profilePhoto
                    ? <img src={other.profilePhoto} alt={other.name} className={styles.convAvatarImg} />
                    : (other.name?.[0]?.toUpperCase() ?? '?')
                  }
                  {isOnline && <span className={styles.onlineDot} aria-label="Online" />}
                </div>

                {/* Info */}
                <div className={styles.convInfo}>
                  <p className={styles.convName}>{other.name ?? 'Unknown'}</p>
                  <p className={styles.convLast}>
                    {lastMsg?.text ?? lastMsg?.content ?? 'No messages yet'}
                  </p>
                </div>

                {/* Time */}
                {(lastMsg?.createdAt ?? conv.updatedAt) && (
                  <span className={styles.convTime}>
                    {formatTime(lastMsg?.createdAt ?? conv.updatedAt)}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
