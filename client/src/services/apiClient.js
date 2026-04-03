import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Cancelled requests — don't treat as errors
    if (axios.isCancel(error)) return Promise.reject(error);

    const status = error.response?.status;

    if (status === 401) {
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Normalise error shape so callers always get error.message
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      (status === 404 ? 'Resource not found.' :
       status === 500 ? 'Server error. Please try again later.' :
       error.message || 'Something went wrong.');

    error.message = message;
    return Promise.reject(error);
  }
);

export default apiClient;
