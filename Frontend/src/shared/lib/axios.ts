import axios from 'axios';
import { useAuthStore } from '../../features/auth/store';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BACKUP_URL || '/api',
});

export const mlClient = axios.create({
  baseURL: import.meta.env.VITE_API_ML_URL,
});

// Automatically attach Token to every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 Unauthorized (Token expired)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);