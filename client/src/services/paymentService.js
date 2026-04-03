import apiClient from './apiClient';

/** GET /api/payments — paginated payment history for the current user */
export const getPaymentHistory = (params) =>
  apiClient.get('/payments', { params });

/** GET /api/payments/:id — single payment with populated booking + property */
export const getPaymentById = (id) =>
  apiClient.get(`/payments/${id}`);

/**
 * POST /api/payments/create-order
 * @param {{ bookingId: string, amount: number }} data  — amount in paise
 */
export const createOrder = (data) =>
  apiClient.post('/payments/create-order', data);
