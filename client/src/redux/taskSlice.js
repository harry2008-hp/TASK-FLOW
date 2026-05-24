import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tasks';

const initialState = {
  tasks: [],
  filters: {
    search: '',
    status: '',
    priority: '',
    tag: '',
  },
  loading: false,
  error: null,
};

// Helper to configure authorization headers
const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Fetch tasks with filters
export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || sessionStorage.getItem('tf_token');
      if (!token) throw new Error('No authentication token available');

      const { filters } = getState().tasks;
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.tag) params.tag = filters.tag;

      const response = await axios.get(API_URL, {
        ...getAuthConfig(token),
        params,
      });

      return response.data.data.tasks;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

// Create task
export const createTask = createAsyncThunk(
  'tasks/create',
  async (taskData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || sessionStorage.getItem('tf_token');
      const response = await axios.post(API_URL, taskData, getAuthConfig(token));
      return response.data.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

// Update task
export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, taskData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || sessionStorage.getItem('tf_token');
      const response = await axios.put(`${API_URL}/${id}`, taskData, getAuthConfig(token));
      return response.data.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

// Delete task
export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || sessionStorage.getItem('tf_token');
      await axios.delete(`${API_URL}/${id}`, getAuthConfig(token));
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);

// Move task status (Optimistic UI update)
export const moveTaskStatus = createAsyncThunk(
  'tasks/moveStatus',
  async ({ id, status }, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token || sessionStorage.getItem('tf_token');
      
      // Dispatch local optimistic state change immediately
      dispatch(updateLocalTaskStatus({ id, status }));

      const response = await axios.put(`${API_URL}/${id}`, { status }, getAuthConfig(token));
      return response.data.data.task;
    } catch (error) {
      // Revert in case of API failure by fetching fresh lists
      dispatch(fetchTasks());
      return rejectWithValue(error.response?.data?.message || 'Failed to move task status');
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        status: '',
        priority: '',
        tag: '',
      };
    },
    updateLocalTaskStatus: (state, action) => {
      const { id, status } = action.payload;
      const index = state.tasks.findIndex(t => t._id === id);
      if (index !== -1) {
        state.tasks[index].status = status;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Task
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      })

      // Update Task
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })

      // Delete Task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t._id !== action.payload);
      });
  },
});

export const { setFilter, resetFilters, updateLocalTaskStatus } = taskSlice.actions;
export default taskSlice.reducer;
