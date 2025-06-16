import axios from "axios";
import { store } from '../redux/store';
import { refreshToken, getMe } from '../redux/slices/authSlice';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Check if token needs refresh on app load
export const checkAndRefreshToken = async () => {
  const accessToken = Cookies.get('accessToken');
  const refreshTokenExists = Cookies.get('refreshToken');
  
  if (accessToken) {
    // If access token exists, just fetch user data
    await store.dispatch(getMe());
  } else if (refreshTokenExists) {
    // If no access token, but refresh token exists, try to refresh
    try {
      await store.dispatch(refreshToken());
      await store.dispatch(getMe()); // Fetch user data after successful refresh
    } catch (error) {
      store.dispatch({ type: 'auth/logout' });
    }
  }
};

// Call token check on initialization - MOVED TO main.jsx
// checkAndRefreshToken();

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await store.dispatch(refreshToken());
        
        // Get the new token
        const newToken = store.getState().auth.accessToken;
        
        // Update the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, redirect to login
        store.dispatch({ type: 'auth/logout' });
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 