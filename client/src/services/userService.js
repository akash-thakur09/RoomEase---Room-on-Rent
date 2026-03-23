import apiClient from './apiClient';

export const getUserProfile = (userId) => apiClient.get(`/user/profile/${userId}`);
export const updateUserProfile = (userId, data) => apiClient.put(`/user/profile/${userId}`, data);
export const deleteUserAccount = (email) => apiClient.delete(`/user/profile/${email}`);
export const uploadProfilePhoto = (userId, formData) =>
  apiClient.post(`/user/profile/photo/${userId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
