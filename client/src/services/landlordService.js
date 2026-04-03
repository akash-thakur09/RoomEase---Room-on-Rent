import apiClient from './apiClient';

/** GET /api/landlord/stats — full dashboard data in one request */
export const getLandlordStats = () => apiClient.get('/landlord/stats');
