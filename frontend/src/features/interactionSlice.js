import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/axiosClient';
import toast from 'react-hot-toast';

export const fetchInteractions = createAsyncThunk(
  'interactions/fetchInteractions',
  async (hcpId, { rejectWithValue }) => {
    try {
      const url = hcpId ? `/interactions/?hcp_id=${hcpId}` : `/interactions/`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFollowUps = createAsyncThunk(
  'interactions/fetchFollowUps',
  async (hcpId, { rejectWithValue }) => {
    try {
      const url = hcpId ? `/follow-ups/?hcp_id=${hcpId}` : `/follow-ups/`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  logs: [],
  followUps: [],
  isLoadingLogs: false,
  isLoadingTasks: false,
  error: null,
};

const interactionSlice = createSlice({
  name: 'interactions',
  initialState,
  reducers: {
    addInteraction: (state, action) => {
      // Optimistic update
      state.logs.unshift({ ...action.payload, id: Date.now() });
    },
    addFollowUp: (state, action) => {
      // Optimistic update
      state.followUps.unshift({ ...action.payload, id: Date.now(), status: 'pending' });
    },
    toggleFollowUpStatus: (state, action) => {
      const task = state.followUps.find(t => t.id === action.payload);
      if (task) task.status = task.status === 'pending' ? 'completed' : 'pending';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInteractions.pending, (state) => {
        state.isLoadingLogs = true;
      })
      .addCase(fetchInteractions.fulfilled, (state, action) => {
        state.isLoadingLogs = false;
        state.logs = action.payload;
      })
      .addCase(fetchInteractions.rejected, (state, action) => {
        state.isLoadingLogs = false;
        state.error = action.payload;
        toast.error('Failed to load interactions.');
      })
      .addCase(fetchFollowUps.pending, (state) => {
        state.isLoadingTasks = true;
      })
      .addCase(fetchFollowUps.fulfilled, (state, action) => {
        state.isLoadingTasks = false;
        state.followUps = action.payload;
      })
      .addCase(fetchFollowUps.rejected, (state, action) => {
        state.isLoadingTasks = false;
        state.error = action.payload;
        toast.error('Failed to load tasks.');
      });
  }
});

export const { addInteraction, addFollowUp, toggleFollowUpStatus } = interactionSlice.actions;
export default interactionSlice.reducer;
