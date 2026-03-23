import apiClient from './apiClient';

export const getConversations = () => apiClient.get('/chat/conversations');
export const getMessages = (conversationId) => apiClient.get(`/chat/${conversationId}/messages`);
export const sendMessage = (conversationId, content) =>
  apiClient.post(`/chat/${conversationId}/messages`, { content });
