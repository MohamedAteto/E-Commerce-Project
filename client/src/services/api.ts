import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = error.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: error.message || 'An unexpected network error occurred.',
    };
    return Promise.reject(customError);
  }
);
