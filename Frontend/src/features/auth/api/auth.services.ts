import { apiClient } from '../../../shared/lib/axios';
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '../types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/signin', credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    // Remove confirmPassword and send only what the backend expects
    const { confirmPassword, ...signupData } = credentials;
    
    // Backend handles role assignment internally
    const response = await apiClient.post<AuthResponse>('/auth/signup', signupData);
    return response.data;
  },
};