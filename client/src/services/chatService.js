import apiClient from './apiClient';

export const getConversations = () =>
  apiClient.get('/chat/conversations');

/** Find or create a 1-on-1 conversation with another user */
export const startConversation = (recipientId) =>
  apiClient.post('/chat/conversations', { recipientId });

export const getMessages = (conversationId) =>
  apiClient.get(`/chat/messages/${conversationId}`);

export const sendMessage = (conversationId, text) =>
  apiClient.post(`/chat/${conversationId}/messages`, { text });
