import apiClient from './apiClient';

export const createBooking = (propertyId) => apiClient.post('/bookings', { propertyId });
export const getBookings = (params) => apiClient.get('/bookings', { params });
export const updateBookingStatus = (bookingId, status) =>
  apiClient.put(`/bookings/${bookingId}`, { status });
