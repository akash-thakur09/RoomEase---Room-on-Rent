import apiClient from './apiClient';

export const getProperties = (params) => apiClient.get('/properties', { params });
export const getUserRooms = (userId) => apiClient.get(`/room/user/${userId}`);
export const addRoom = (userId, formData) =>
  apiClient.post(`/room/user/${userId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteRoom = (roomId) => apiClient.delete(`/room/user/${roomId}`);
