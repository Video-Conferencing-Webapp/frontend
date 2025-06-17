import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from '../store/slices/authSlice';
import { initializeServicesForAuth } from '../services/lazyServices';

export const useAuthState = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, isLoading, error, accessToken } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // Check if user is authenticated on app startup
    const checkAuthState = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (token && !user) {
        // If we have a token but no user data, try to get current user
        try {
          await dispatch(getCurrentUser()).unwrap();
        } catch (error) {
          // Token is invalid, will be handled by the auth slice
          console.log('Token validation failed:', error);
        }
      }
    };

    checkAuthState();
  }, [dispatch, user]);

  // Initialize services based on authentication state
  useEffect(() => {
    if (!isLoading) {
      initializeServicesForAuth(isAuthenticated).catch(error => {
        console.warn('Failed to initialize services for auth state:', error);
      });
    }
  }, [isAuthenticated, isLoading]);

  return {
    isAuthenticated: isAuthenticated || !!accessToken,
    user,
    isLoading,
    error,
  };
}; 