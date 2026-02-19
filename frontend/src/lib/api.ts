import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle connection refused (backend not running)
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      console.error('Backend API is not available. Make sure the backend is running on port 3001.');
      const customError = new Error('Backend server is not running. Please start it with: cd backend && npm run start:dev');
      (customError as any).isNetworkError = true;
      return Promise.reject(customError);
    }

    if (error.response?.status === 401) {
      // Handle token refresh or redirect to login
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
