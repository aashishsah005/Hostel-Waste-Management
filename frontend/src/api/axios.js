import axios from 'axios';

// Detect production environment on Vercel
const isProduction = typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('onrender.com'));

const defaultBaseURL = isProduction
  ? 'https://hostel-waste-management.onrender.com/api'
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const msg = error.response.data?.message || '';
      if (
        msg.includes('user not found') ||
        msg.includes('token invalid') ||
        msg.includes('no token provided')
      ) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
