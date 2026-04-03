import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

/**
 * useSocket — manages a single Socket.io connection for the lifetime of the component.
 *
 * @param {string|null} token  - JWT; pass null to skip connecting
 * @returns {{
 *   socket: Socket|null,
 *   status: 'connecting'|'connected'|'disconnected',
 *   joinConversation: (recipientId: string) => void,
 *   sendMessage: (conversationId: string, text: string) => void,
 *   onMessage: (handler: Function) => () => void,
 *   onOnline: (handler: Function) => () => void,
 *   onOffline: (handler: Function) => () => void,
 * }}
 */
export default function useSocket(token) {
  const socketRef = useRef(null);
  const [status, setStatus] = useState('disconnected');

  useEffect(() => {
    if (!token) return;

    const socket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;
    setStatus('connecting');

    socket.on('connect',    () => setStatus('connected'));
    socket.on('disconnect', () => setStatus('disconnected'));
    socket.on('connect_error', () => setStatus('disconnected'));

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setStatus('disconnected');
    };
  }, [token]);

  /** Join (or create) a conversation room with a recipient */
  const joinConversation = useCallback((recipientId) => {
    socketRef.current?.emit('conversation:join', { recipientId });
  }, []);

  /** Send a message via socket */
  const sendMessage = useCallback((conversationId, text) => {
    socketRef.current?.emit('message:send', { conversationId, text });
  }, []);

  /** Subscribe to incoming messages. Returns an unsubscribe fn. */
  const onMessage = useCallback((handler) => {
    const socket = socketRef.current;
    if (!socket) return () => {};
    socket.on('message:receive', handler);
    return () => socket.off('message:receive', handler);
  }, []);

  /** Subscribe to user:online events */
  const onOnline = useCallback((handler) => {
    const socket = socketRef.current;
    if (!socket) return () => {};
    socket.on('user:online', handler);
    return () => socket.off('user:online', handler);
  }, []);

  /** Subscribe to user:offline events */
  const onOffline = useCallback((handler) => {
    const socket = socketRef.current;
    if (!socket) return () => {};
    socket.on('user:offline', handler);
    return () => socket.off('user:offline', handler);
  }, []);

  return {
    socket: socketRef.current,
    status,
    joinConversation,
    sendMessage,
    onMessage,
    onOnline,
    onOffline,
  };
}
