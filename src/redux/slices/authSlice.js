import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from "../../utils/axios";
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ fullName, email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        full_name: fullName,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get('refreshToken');
      if (!token) {
        return rejectWithValue('No refresh token found');
      }
      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refresh_token: token,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  user: Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null,
  accessToken: Cookies.get('accessToken') || null,
  refreshToken: Cookies.get('refreshToken') || null,
  isAuthenticated: !!Cookies.get('accessToken'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      Cookies.remove('user');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        const { user, access_token, refresh_token } = action.payload;
        state.loading = false;
        state.isAuthenticated = true;
        state.user = user;
        state.accessToken = access_token;
        state.refreshToken = refresh_token;

        Cookies.set('accessToken', access_token, { expires: 1 / 96, secure: true }); // 15 minutes
        Cookies.set('refreshToken', refresh_token, { expires: 7, secure: true });
        Cookies.set('user', JSON.stringify(user), { expires: 7, secure: true });
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || 'Login failed';
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        const { user, access_token, refresh_token } = action.payload;
        state.loading = false;
        state.isAuthenticated = true;
        state.user = user;
        state.accessToken = access_token;
        state.refreshToken = refresh_token;

        Cookies.set('accessToken', access_token, { expires: 1 / 96, secure: true }); // 15 minutes
        Cookies.set('refreshToken', refresh_token, { expires: 7, secure: true });
        Cookies.set('user', JSON.stringify(user), { expires: 7, secure: true });
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || 'Registration failed';
      })
      // Get Me
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        Cookies.set('user', JSON.stringify(action.payload), { expires: 7, secure: true });
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || 'Failed to fetch user';
        // This could indicate a token is invalid, so we log out
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('user');
      })
      // Refresh Token
      .addCase(refreshToken.fulfilled, (state, action) => {
        const { access_token, refresh_token } = action.payload;
        state.accessToken = access_token;
        state.refreshToken = refresh_token;
        Cookies.set('accessToken', access_token, { expires: 1 / 96, secure: true });
        if (refresh_token) {
           Cookies.set('refreshToken', refresh_token, { expires: 7, secure: true });
        }
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('user');
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer; 
