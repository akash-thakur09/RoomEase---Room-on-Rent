import apiClient from './apiClient';

/**
 * GET /api/verification/status/:userId
 * Returns the verification record or 404 if none exists yet.
 */
export const getVerificationStatus = (userId) =>
  apiClient.get(`/verification/status/${userId}`);

/**
 * POST /api/verification/upload
 * @param {FormData} formData  - field name: 'documents', up to 5 files
 */
export const uploadDocuments = (formData) =>
  apiClient.post('/verification/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
