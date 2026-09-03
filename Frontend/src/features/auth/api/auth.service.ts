import { apiClient } from '../../../shared/lib/axios';
import type { LoginCredentials, RegisterCredentials, AuthResponse, PasswordInput, ForgotPasswordInput, ResetPasswordInput } from '../types';
import { showToast } from '../../../shared/store/toastStore';

const mapBackendUser = (backendUser: any) => ({
  name: backendUser.email.split('@')[0],
  email: backendUser.email,
  initials: backendUser.email[0].toUpperCase(),
  role: backendUser.role || 'user',
});

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/signin', credentials);
    showToast('Login successful', 'success');
    data.user = mapBackendUser(data.user) as any;
    return data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const { confirmPassword, ...signupData } = credentials;
    const { data } = await apiClient.post<AuthResponse>('/auth/signup', signupData);
    data.user = mapBackendUser(data.user) as any;
    return data;
  },

  changePassword: async (passwords: PasswordInput) => {
    const { data } = await apiClient.post('/auth/change-password', {
      current_password: passwords.currentPassword,
      new_password: passwords.newPassword,
    });
    showToast('Password changed successfully', 'success');
    return data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
    showToast('Logout successful', 'success');
  },

  deleteAccount: async () => {
    await apiClient.delete('/auth/me');
    showToast('Account deleted permanently', 'success');
  },

  /**
   * POST /api/auth/forgot-password
   * Sends a password reset link to the given email.
   */
  forgotPassword: async (payload: ForgotPasswordInput): Promise<void> => {
    await apiClient.post('/auth/forgot-password', payload);
  },

  /**
   * POST /api/auth/reset-password
   * Resets the password using the token from the email link.
   */
  resetPassword: async (payload: ResetPasswordInput): Promise<void> => {
    const { confirmPassword, ...body } = payload;
    await apiClient.post('/auth/reset-password', body);
  },

  getMe: async () => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },

  socialLoginGoogle: async (token: string) => {
    const { data } = await apiClient.post('/auth/social/google', { token });
    data.user = mapBackendUser(data.user) as any;
    return data;
  },

  socialLoginGithub: async (token: string) => {
    const { data } = await apiClient.post('/auth/social/github', { token });
    data.user = mapBackendUser(data.user) as any;
    return data;
  },

  refreshToken: async () => {
    const { data } = await apiClient.post('/auth/refresh');
    return data;
  }
};