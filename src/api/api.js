// Common API exports
export { default as apiClient } from './apiClient';
export { authAPI } from './authAPI';
export { profileAPI } from './profileAPI';

// Re-export for backward compatibility and convenience
export { default as authAPI } from './authAPI';
export { default as profileAPI } from './profileAPI';

// Default export for the base client
export { default } from './apiClient'; 