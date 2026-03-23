import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../shared/Navbar';
import { getConversations, getMessages, sendMessage } from '../../services/chatService';
import { useAuth } from '../../shared/AuthContext';
import './chat.css';

export default function ChatUI() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    getConversations()
      .then((res) => setConversations(res.data.data || []))
      .catch(() => setError('Could not load conversations.'))
      .finally(() => setLoadingConvs(false));
  }, []);

  useEffect(() => {
    if (!activeConv) return;
    setLoadingMsgs(true);
    getMessages(activeConv._id)
      .then((res) => setMessages(res.data.data || []))
      .catch(() => setError('Could not load messages.'))
      .finally(() => setLoadingMsgs(false));
  }, [activeConv]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;
    setSending(true);
    try {
      const res = await sendMessage(activeConv._id, text.trim());
      setMessages((prev) => [...prev, res.data.data]);
      setText('');
    } catch {
      setError('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const otherParticipant = (conv) =>
    conv.participants?.find((p) => p._id !== user.userId) || {};

  return (
    <div>
      <Navbar />
      <div className="chat-layout page-container">
        {/* Sidebar */}
        <aside className="chat-sidebar card">
          <h2 className="chat-sidebar__title">Messages</h2>
          {loadingConvs ? (
            <div style={{ padding: 16 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 56, borderRadius: 8, marginBottom: 8 }} />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="chat-empty">No conversations yet</div>
          ) : (
            <ul className="chat-conv-list">
              {conversations.map((conv) => {
                const other = otherParticipant(conv);
                return (
                  <li
                    key={conv._id}
                    className={`chat-conv-item${activeConv?._id === conv._id ? ' active' : ''}`}
                    onClick={() => setActiveConv(conv)}
                  >
                    <div className="chat-conv-avatar">{other.name?.[0]?.toUpperCase() ?? '?'}</div>
                    <div className="chat-conv-info">
                      <p className="chat-conv-name">{other.name ?? 'Unknown'}</p>
                      <p className="chat-conv-last">{conv.lastMessage?.content ?? 'No messages yet'}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Main chat area */}
        <main className="chat-main card">
          {!activeConv ? (
            <div className="chat-placeholder">
              <p>Select a conversation to start chatting</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div className="chat-conv-avatar">{otherParticipant(activeConv).name?.[0]?.toUpperCase() ?? '?'}</div>
                <div>
                  <p className="chat-header__name">{otherParticipant(activeConv).name ?? 'Unknown'}</p>
                  <p className="chat-header__role">{otherParticipant(activeConv).role ?? ''}</p>
                </div>
              </div>

              <div className="chat-messages">
                {loadingMsgs ? (
                  <div style={{ padding: 16 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={`skeleton chat-msg-skeleton${i % 2 === 0 ? '' : ' right'}`} />
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="chat-empty">No messages yet. Say hello!</div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId === user.userId || msg.senderId?._id === user.userId;
                    return (
                      <div key={msg._id} className={`chat-bubble${isMine ? ' mine' : ''}`}>
                        <p>{msg.content}</p>
                        <span className="chat-bubble__time">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <form className="chat-input-bar" onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder="Type a message…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={sending}
                />
                <button type="submit" className="btn btn-primary" disabled={sending || !text.trim()}>
                  {sending ? '…' : 'Send'}
                </button>
              </form>
            </>
          )}
        </main>
      </div>
      {error && <div className="error-state" style={{ position: 'fixed', bottom: 16, right: 16, padding: '12px 20px', background: '#fff5f5', borderRadius: 8, border: '1px solid #fed7d7', color: 'var(--danger)' }}>{error}</div>}
    </div>
  );
}
