import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Read initial token & user from localStorage if present
const savedToken = localStorage.getItem('tf_token') || null;
let savedUser = null;
try {
  savedUser = JSON.parse(localStorage.getItem('tf_user')) || null;
} catch (e) {
  savedUser = null;
}

const initialState = {
  user: savedUser,
  token: savedToken,
  isAuthenticated: !!savedToken,
  loading: false,
  error: null,
};

// Helper to configure authorization headers
const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Async Thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      const { token, data } = response.data;
      
      localStorage.setItem('tf_token', token);
      localStorage.setItem('tf_user', JSON.stringify(data.user));
      
      return { token, user: data.user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password, rememberMe }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { token, data } = response.data;

      if (rememberMe) {
        localStorage.setItem('tf_token', token);
        localStorage.setItem('tf_user', JSON.stringify(data.user));
      } else {
        sessionStorage.setItem('tf_token', token);
        sessionStorage.setItem('tf_user', JSON.stringify(data.user));
      }

      return { token, user: data.user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || sessionStorage.getItem('tf_token');
      if (!token) throw new Error('No authentication token available');

      const response = await axios.get(`${API_URL}/profile`, getAuthConfig(token));
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || sessionStorage.getItem('tf_token');
      if (!token) throw new Error('No authentication token available');

      const response = await axios.put(`${API_URL}/profile`, profileData, getAuthConfig(token));
      const updatedUser = response.data.data.user;

      // Update stored user details
      if (localStorage.getItem('tf_user')) {
        localStorage.setItem('tf_user', JSON.stringify(updatedUser));
      } else {
        sessionStorage.setItem('tf_user', JSON.stringify(updatedUser));
      }

      return updatedUser;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('tf_token');
      localStorage.removeItem('tf_user');
      sessionStorage.removeItem('tf_token');
      sessionStorage.removeItem('tf_user');
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    initializeAuth: (state) => {
      // Sync session storage if local storage empty
      const token = localStorage.getItem('tf_token') || sessionStorage.getItem('tf_token');
      let user = null;
      try {
        user = JSON.parse(localStorage.getItem('tf_user')) || JSON.parse(sessionStorage.getItem('tf_user'));
      } catch (e) {}

      if (token && user) {
        state.token = token;
        state.user = user;
        state.isAuthenticated = true;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Profile
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserProfile.rejected, (state) => {
        // Purge invalid token session
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('tf_token');
        localStorage.removeItem('tf_user');
        sessionStorage.removeItem('tf_token');
        sessionStorage.removeItem('tf_user');
      })

      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logoutUser, clearAuthError, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
