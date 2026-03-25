import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Chatroom, Message, Participant } from '../../types';

interface ChatState {
  activeRoom: Chatroom | null;
  messages: Message[];
  nextCursor: string | null;
  participants: Participant[];
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}

const initialState: ChatState = {
  activeRoom: null,
  messages: [],
  nextCursor: null,
  participants: [],
  status: 'idle',
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setLoading(state) {
      state.status = 'loading';
      state.error = null;
    },
    setRoom(state, action: PayloadAction<Chatroom>) {
      state.activeRoom = action.payload;
      state.messages = [];
      state.participants = [];
      state.nextCursor = null;
      state.status = 'idle';
    },
    setMessages(
      state,
      action: PayloadAction<{ messages: Message[]; nextCursor: string | null }>,
    ) {
      // Merge with any messages already received via socket, deduplicating by messageId
      const existingIds = new Set(action.payload.messages.map((m) => m.messageId));
      const socketOnly = state.messages.filter((m) => !existingIds.has(m.messageId));
      state.messages = [...action.payload.messages, ...socketOnly].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
      state.nextCursor = action.payload.nextCursor;
      state.status = 'idle';
    },
    addMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },
    addParticipant(state, action: PayloadAction<Participant>) {
      const exists = state.participants.some((p) => p.userId === action.payload.userId);
      if (!exists) state.participants.push(action.payload);
    },
    removeParticipant(state, action: PayloadAction<{ userId: string }>) {
      state.participants = state.participants.filter(
        (p) => p.userId !== action.payload.userId,
      );
    },
    setError(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.error = action.payload;
    },
    clearRoom(state) {
      state.activeRoom = null;
      state.messages = [];
      state.participants = [];
      state.nextCursor = null;
      state.status = 'idle';
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setRoom,
  setMessages,
  addMessage,
  addParticipant,
  removeParticipant,
  setError,
  clearRoom,
} = chatSlice.actions;
export default chatSlice.reducer;
