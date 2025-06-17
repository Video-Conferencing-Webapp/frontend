import apiClient from './apiClient';

export const profileAPI = {
  // Profile Management
  getProfile: async () => {
    const response = await apiClient.get('/profile/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put('/profile/me', profileData);
    return response.data;
  },

  // Preferences Management
  getPreferences: async () => {
    const response = await apiClient.get('/profile/preferences');
    return response.data;
  },

  updatePreferences: async (preferences) => {
    const response = await apiClient.put('/profile/preferences', preferences);
    return response.data;
  },

  // Password Management
  changePassword: async (passwordData) => {
    const response = await apiClient.post('/profile/change-password', passwordData);
    return response.data;
  },

  // Account Management
  deleteAccount: async (deleteData) => {
    const response = await apiClient.delete('/profile/me', { data: deleteData });
    return response.data;
  },

  // Avatar Management (for future implementation)
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiClient.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default profileAPI; 