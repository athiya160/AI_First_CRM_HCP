import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/axiosClient';
import toast from 'react-hot-toast';

export const fetchHcps = createAsyncThunk(
  'hcps/fetchHcps',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/hcps/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  list: [],
  selectedHcp: null,
  isLoading: false,
  error: null,
};

const hcpSlice = createSlice({
  name: 'hcps',
  initialState,
  reducers: {
    selectHcp: (state, action) => {
      state.selectedHcp = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHcps.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHcps.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchHcps.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(`Failed to load doctors: ${action.payload}`);
      });
  }
});

export const { selectHcp } = hcpSlice.actions;
export default hcpSlice.reducer;
