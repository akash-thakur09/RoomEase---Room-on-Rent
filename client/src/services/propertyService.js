import apiClient from './apiClient';

/**
 * GET /api/properties/all
 * @param {{ city?, type?, minRent?, maxRent?, page?, limit? }} params
 */
export const getProperties = (params) => {
  // Strip empty/null values so the API doesn't receive empty strings
  const clean = Object.fromEntries(
    Object.entries(params || {}).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  return apiClient.get('/properties/all', { params: clean });
};

export const getPropertyById = (id) => apiClient.get(`/properties/${id}`);

export const getUserRooms = (userId) => apiClient.get(`/room/user/${userId}`);

export const addRoom = (userId, formData) =>
  apiClient.post(`/room/user/${userId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateRoom = (roomId, formData) =>
  apiClient.put(`/room/user/${roomId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteRoom = (roomId) => apiClient.delete(`/room/user/${roomId}`);
