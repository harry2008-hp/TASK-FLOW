import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Default theme is dark to showcase the gorgeous dark slate/indigo gradient!
const isDarkSaved = localStorage.getItem('tf_dark') !== 'false';

const initialState = {
  darkMode: isDarkSaved,
  sidebarOpen: true,
  notifications: [],
  logs: [],
  loading: false,
};

// Helper to configure authorization headers
const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
  'ui/fetchNotifications',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || sessionStorage.getItem('tf_token');
      if (!token) return [];
      const response = await axios.get('http://localhost:5000/api/notifications', getAuthConfig(token));
      return response.data.data.notifications;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

// Mark notification as read
export const markNotificationRead = createAsyncThunk(
  'ui/markNotificationRead',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || sessionStorage.getItem('tf_token');
      const response = await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, getAuthConfig(token));
      return { id, isAll: id === 'all' };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification');
    }
  }
);

// Fetch activity logs
export const fetchActivityLogs = createAsyncThunk(
  'ui/fetchLogs',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || sessionStorage.getItem('tf_token');
      if (!token) return [];
      const response = await axios.get('http://localhost:5000/api/activity', getAuthConfig(token));
      return response.data.data.logs;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch logs');
    }
  }
);

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('tf_dark', state.darkMode);
      
      // Update HTML class
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    syncTheme: (state) => {
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })

      // Mark notification as read
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const { id, isAll } = action.payload;
        if (isAll) {
          state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
        } else {
          const index = state.notifications.findIndex(n => n._id === id);
          if (index !== -1) {
            state.notifications[index].isRead = true;
          }
        }
      })

      // Fetch Logs
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.logs = action.payload;
      });
  },
});

export const { toggleDarkMode, toggleSidebar, setSidebarOpen, syncTheme } = uiSlice.actions;
export default uiSlice.reducer;
