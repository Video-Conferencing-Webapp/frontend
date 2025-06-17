import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import authSlice from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(
      // Add logger only in development
      import.meta.env.DEV ? logger : []
    ),
  devTools: import.meta.env.DEV,
}); 