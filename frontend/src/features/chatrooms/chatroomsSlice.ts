import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Chatroom, Message } from '../../types';

interface LastMessageEntry {
  content: string;
  timestamp: string;
  senderName: string;
}

interface ChatroomsState {
  list: Chatroom[];
  lastMessages: Record<string, LastMessageEntry>;
  unreadCounts: Record<string, number>;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}

const initialState: ChatroomsState = {
  list: [],
  lastMessages: {},
  unreadCounts: {},
  status: 'idle',
  error: null,
};

const chatroomsSlice = createSlice({
  name: 'chatrooms',
  initialState,
  reducers: {
    setLoading(state) {
      state.status = 'loading';
      state.error = null;
    },
    setChatrooms(state, action: PayloadAction<Chatroom[]>) {
      state.list = action.payload;
      state.status = 'idle';
    },
    addChatroom(state, action: PayloadAction<Chatroom>) {
      state.list.unshift(action.payload);
    },
    setLastMessage(state, action: PayloadAction<{ roomId: string; message: Message }>) {
      const { roomId, message } = action.payload;
      state.lastMessages[roomId] = {
        content: message.content,
        timestamp: message.timestamp,
        senderName: message.senderName,
      };
    },
    setError(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.error = action.payload;
    },
  },
});

export const { setLoading, setChatrooms, addChatroom, setLastMessage, setError } =
  chatroomsSlice.actions;
export default chatroomsSlice.reducer;
