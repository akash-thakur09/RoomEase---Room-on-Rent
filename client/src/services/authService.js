import apiClient from './apiClient';

/**
 * @param {{ email: string, password: string, role: string }} data
 */
export const login = (data) => apiClient.post('/auth/login', data);

/**
 * @param {{ name: string, email: string, password: string, role: string }} data
 */
export const register = (data) => apiClient.post('/auth/register', data);
