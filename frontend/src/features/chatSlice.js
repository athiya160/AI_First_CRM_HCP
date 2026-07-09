import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/axiosClient';

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ message, hcp_id }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/chat/', { message, hcp_id });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  messages: [
    { id: 1, role: 'ai', content: 'Hello! I am your CRM Copilot. How can I assist you today?' }
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
        
        let richContent = null;
        if (action.payload.summary || (action.payload.action_items && action.payload.action_items.length > 0)) {
          richContent = {
            status: "Interaction Logged",
            doctor: action.payload.doctor,
            interactionId: action.payload.interaction_id,
            summary: {
              topic: action.payload.summary,
              sentiment: action.payload.sentiment,
              confidence: action.payload.confidence
            },
            entities: action.payload.entities || [],
            actionItems: action.payload.action_items || []
          };
        }

        state.messages.push({
          id: Date.now(),
          role: 'ai',
          content: action.payload.reply,
          richContent
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
