import apiClient from './apiClient';

export const submitReview = (data) => apiClient.post('/reviews', data);

export const getBookingReviewStatus = (bookingId) =>
  apiClient.get(`/reviews/booking/${bookingId}/status`);

export const getUserReviews = (userId) => apiClient.get(`/reviews/user/${userId}`);

export const getMyReviews = () => apiClient.get('/reviews/my');

export const getPropertyReviews = (propertyId) => apiClient.get(`/reviews/property/${propertyId}`);
