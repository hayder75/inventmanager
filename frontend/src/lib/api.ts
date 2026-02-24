import axios from 'axios';

// Remove /api suffix if present, as all routes already include /api prefix
const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_URL = envUrl.endsWith('/api') ? envUrl.replace(/\/api$/, '') : envUrl;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Only redirect to login if it's a verify or auth-related 401
        // Don't redirect for admin actions like password reset, user updates, etc.
        const requestUrl = error.config?.url || '';
        const isAuthCheck = requestUrl.includes('/auth/verify') || requestUrl.includes('/auth/login');

        if (isAuthCheck) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        // For other 401s (like expired token on data fetch), just reject the promise
        // The AuthContext will handle session management
      }
    }
    return Promise.reject(error);
  }
);

export default api;

