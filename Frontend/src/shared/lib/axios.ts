import axios from 'axios';
import { useAuthStore } from '../../features/auth/store';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BACKUP_URL || '/api',
  withCredentials: true,
});

export const mlClient = axios.create({
  baseURL: import.meta.env.VITE_API_ML_URL,
});

// Automatically attach Token to every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Handle 401 Unauthorized (Token expired)
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.set('Authorization', 'Bearer ' + token);
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const { data } = await axios.post(
          (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BACKUP_URL || '/api') + '/auth/refresh',
          {},
          { withCredentials: true } // Need this to send the HTTP-only refresh cookie
        );
        
        const newToken = data.access_token;
        // Update the auth store with the new token
        useAuthStore.getState().login(data.user, newToken);
        
        processQueue(null, newToken);
        isRefreshing = false;
        
        originalRequest.headers.set('Authorization', 'Bearer ' + newToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);