// DEPRECATED: This file is deprecated. Please use the new API structure in /api/ directory.
// This file is kept for backward compatibility only.

// Re-export from new API structure
export { default as apiClient } from '../api/apiClient';
export { authAPI } from '../api/authAPI';
export { profileAPI } from '../api/profileAPI';

// Default export for backward compatibility
export { default } from '../api/apiClient'; 