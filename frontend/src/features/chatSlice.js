import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/axiosClient';

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ message, hcp_id }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const history = state.chat.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      const response = await apiClient.post('/chat/', { message, hcp_id, history });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  messages: [
    { 
      id: 1, 
      role: 'ai', 
      content: "👋 **Welcome to CRM Copilot**\n\nI can help you:\n\n✓ Log doctor interactions\n\n✓ Summarize meetings\n\n✓ Search previous conversations\n\n✓ Schedule follow-ups\n\n✓ Generate AI insights\n\n**Try asking:**\n\n\"Log today's meeting\"\n\n\"Summarize my previous meetings\"\n\n\"Schedule a follow-up next Friday\"" 
    }
  ],
  isOpen: false,
  isLoading: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push({
        id: Date.now(),
        ...action.payload
      });
    },
    toggleCopilot: (state) => {
      state.isOpen = !state.isOpen;
    },
    openCopilot: (state) => {
      state.isOpen = true;
    },
    closeCopilot: (state) => {
      state.isOpen = false;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        
        state.messages.push({
          id: Date.now(),
          role: 'ai',
          content: action.payload.reply
        });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.messages.push({
          id: Date.now(),
          role: 'ai',
          content: "Sorry, I encountered an error connecting to the Copilot."
        });
      });
  },
});
export const { addMessage, toggleCopilot, openCopilot, closeCopilot, setLoading } = chatSlice.actions;
export default chatSlice.reducer;
