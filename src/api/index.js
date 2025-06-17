// Main API exports - Clean import structure
export { default as apiClient } from './apiClient';
export { authAPI, default as authAPI } from './authAPI';
export { profileAPI, default as profileAPI } from './profileAPI';

// Re-export everything from api.js for convenience
export * from './api'; 