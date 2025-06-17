import apiClient from './apiClient';

export const authAPI = {
  // Authentication
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    console.log('AuthAPI login response:', response.data);
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    console.log('AuthAPI register response:', response.data);
    return response.data;
  },

  // User Information
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    console.log('AuthAPI getCurrentUser response:', response.data);
    return response.data;
  },

  // Token Management
  refreshToken: async (refreshToken) => {
    const response = await apiClient.post('/auth/refresh', { 
      refresh_token: refreshToken 
    });
    return response.data;
  },

  // Logout (if backend supports it)
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  // Password Reset (for future implementation)
  requestPasswordReset: async (email) => {
    const response = await apiClient.post('/auth/password-reset-request', { email });
    return response.data;
  },

  resetPassword: async (resetData) => {
    const response = await apiClient.post('/auth/password-reset', resetData);
    return response.data;
  },

  // Email Verification (for future implementation)
  verifyEmail: async (token) => {
    const response = await apiClient.post('/auth/verify-email', { token });
    return response.data;
  },

  resendVerificationEmail: async (email) => {
    const response = await apiClient.post('/auth/resend-verification', { email });
    return response.data;
  },
};

export default authAPI; 