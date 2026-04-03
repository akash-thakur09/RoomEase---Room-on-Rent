import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../shared/hooks/useAuth';
import useSocket from '../../shared/hooks/useSocket';
import { getConversations, getMessages, sendMessage as sendRest } from '../../services/chatService';
import ChatSidebar from './components/ChatSidebar';
import ChatWindow  from './components/ChatWindow';
import styles from './chat.module.css';

export default function ChatUI() {
  const { user } = useAuth();

  // ── Conversations ─────────────────────────────────────────────────────────
  const [conversations,  setConversations]  = useState([]);
  const [loadingConvs,   setLoadingConvs]   = useState(true);

  // ── Active conversation + messages ────────────────────────────────────────
  const [activeConv,     setActiveConv]     = useState(null);
  const [messages,       setMessages]       = useState([]);
  const [loadingMsgs,    setLoadingMsgs]    = useState(false);

  // ── Online presence ───────────────────────────────────────────────────────
  const [onlineUsers,    setOnlineUsers]    = useState(new Set());

  // ── Typing indicator ──────────────────────────────────────────────────────
  const [isTyping,       setIsTyping]       = useState(false);
  const typingTimer                         = useRef(null); // eslint-disable-line no-unused-vars

  // ── Sending ───────────────────────────────────────────────────────────────
  const [sending,        setSending]        = useState(false);

  // ── Mobile: show sidebar or window ───────────────────────────────────────
  const [mobileView,     setMobileView]     = useState('sidebar'); // 'sidebar' | 'window'

  // ── Socket ────────────────────────────────────────────────────────────────
  const { status: socketStatus, joinConversation, sendMessage: socketSend, onMessage, onOnline, onOffline } = useSocket(user?.token ?? null);

  // ── Load conversations on mount ───────────────────────────────────────────
  useEffect(() => {
    getConversations()
      .then((res) => setConversations(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingConvs(false));
  }, []);

  // ── Load messages when active conversation changes ────────────────────────
  useEffect(() => {
    if (!activeConv) return;
    setLoadingMsgs(true);
    setMessages([]);

    getMessages(activeConv._id)
      .then((res) => setMessages(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingMsgs(false));

    // Join socket room for this conversation
    const other = activeConv.participants?.find(
      (p) => (p._id ?? p) !== user?.userId
    );
    if (other) joinConversation(other._id ?? other);
  }, [activeConv?._id]); // eslint-disable-line

  // ── Socket: incoming messages ─────────────────────────────────────────────
  useEffect(() => {
    const unsub = onMessage((msg) => {
      // Only append if it belongs to the active conversation
      if (String(msg.conversationId) !== String(activeConv?._id)) return;

      setMessages((prev) => {
        // Deduplicate by _id
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, { ...msg, _isNew: true }];
      });

      // Update last message preview in sidebar
      setConversations((prev) =>
        prev.map((c) =>
          String(c._id) === String(msg.conversationId)
            ? { ...c, lastMessage: msg }
            : c
        )
      );
    });
    return unsub;
  }, [onMessage, activeConv?._id]);

  // ── Socket: online/offline presence ──────────────────────────────────────
  useEffect(() => {
    const unsubOn  = onOnline(({ userId }) =>
      setOnlineUsers((s) => new Set([...s, String(userId)]))
    );
    const unsubOff = onOffline(({ userId }) =>
      setOnlineUsers((s) => { const n = new Set(s); n.delete(String(userId)); return n; })
    );
    return () => { unsubOn(); unsubOff(); };
  }, [onOnline, onOffline]);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = useCallback(async (text) => {
    if (!activeConv || !text.trim()) return;

    // Optimistic message
    const tempId  = `temp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      _tempId: tempId,
      _pending: true,
      conversationId: activeConv._id,
      senderId: user.userId,
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setSending(true);

    try {
      if (socketStatus === 'connected') {
        // Socket path — server will broadcast back via message:receive
        socketSend(activeConv._id, text);
        // Remove optimistic once real message arrives (dedup handles it)
        setMessages((prev) => prev.filter((m) => m._tempId !== tempId));
      } else {
        // REST fallback
        const res = await sendRest(activeConv._id, text);
        const saved = res.data.data;
        setMessages((prev) =>
          prev.map((m) => m._tempId === tempId ? { ...saved, _isNew: true } : m)
        );
        setConversations((prev) =>
          prev.map((c) =>
            String(c._id) === String(activeConv._id)
              ? { ...c, lastMessage: saved }
              : c
          )
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) => m._tempId === tempId ? { ...m, _pending: false, _failed: true } : m)
      );
    } finally {
      setSending(false);
    }
  }, [activeConv, user?.userId, socketStatus, socketSend]);

  // ── Retry failed message ──────────────────────────────────────────────────
  const handleRetry = useCallback((failedMsg) => {
    setMessages((prev) => prev.filter((m) => m._tempId !== failedMsg._tempId));
    handleSend(failedMsg.text);
  }, [handleSend]);

  // ── Select conversation ───────────────────────────────────────────────────
  const handleSelect = (conv) => {
    setActiveConv(conv);
    setIsTyping(false);
    setMobileView('window');
  };

  // ── Typing simulation (socket-ready placeholder) ──────────────────────────
  // When socket emits 'typing:start' / 'typing:stop', update isTyping here.
  // For now the state is wired and ready.

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {/* Sidebar */}
        <div className={[
          mobileView === 'window' ? styles.sidebarHidden : '',
        ].join(' ')}>
          <ChatSidebar
            conversations={conversations}
            activeConv={activeConv}
            currentUserId={user?.userId}
            onlineUsers={onlineUsers}
            loading={loadingConvs}
            onSelect={handleSelect}
          />
        </div>

        {/* Window */}
        <div className={[
          mobileView === 'sidebar' ? styles.windowHidden : '',
        ].join(' ')} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <ChatWindow
            conversation={activeConv}
            messages={messages}
            loadingMsgs={loadingMsgs}
            sending={sending}
            isTyping={isTyping}
            currentUserId={user?.userId}
            socketStatus={socketStatus}
            onSend={handleSend}
            onRetry={handleRetry}
            onBack={() => setMobileView('sidebar')}
          />
        </div>
      </div>
    </div>
  );
}
