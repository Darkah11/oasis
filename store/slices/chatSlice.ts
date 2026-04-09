import { Message } from '@/types/Message';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';



interface Chat {
  id: string;
  type: 'direct' | 'group';
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  name?: string;
  avatar?: string;
}

interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  messages: Record<string, Message[]>; // chatId -> messages
  lastSyncs: Record<string, number>; // chatId -> timestamp
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  activeChatId: null,
  messages: {},
  lastSyncs: {},
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    setActiveChat: (state, action: PayloadAction<string | null>) => {
      state.activeChatId = action.payload;
    },
    setMessages: (
      state,
      action: PayloadAction<{ chatId: string; messages: Message[] }>
    ) => {
      if (!state.messages) state.messages = {};
      state.messages[action.payload.chatId] = action.payload.messages;
    },
    upsertMessages: (
      state,
      action: PayloadAction<{ chatId: string; messages: Message[] }>
    ) => {
      const { chatId, messages } = action.payload;
      if (!state.messages) state.messages = {};
      const existingMessages = state.messages[chatId] || [];
      
      // Create a map of existing messages by ID for fast lookup
      const messageMap = new Map(existingMessages.map(m => [m.id, m]));
      
      // Merge new messages, overwriting duplicates
      messages.forEach(msg => {
        messageMap.set(msg.id, msg);
      });
      
      // Convert back to array and sort by createdAt
      state.messages[chatId] = Array.from(messageMap.values()).sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });
    },
    updateLastSync: (state, action: PayloadAction<string>) => {
      if (!state.lastSyncs) state.lastSyncs = {};
      state.lastSyncs[action.payload] = Date.now();
    },
    addMessage: (
      state,
      action: PayloadAction<{ chatId: string; message: Message }>
    ) => {
      const { chatId, message } = action.payload;
      if (!state.messages) state.messages = {};
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      state.messages[chatId].push(message);
      
      // Update last message in chat list
      if (!state.chats) state.chats = [];
      const chat = state.chats.find((c) => c.id === chatId);
      if (chat) {
        chat.lastMessage = message;
      }
    },
    updateMessage: (
      state,
      action: PayloadAction<{ chatId: string; tempId: string; newMessage: Message }>
    ) => {
      const { chatId, tempId, newMessage } = action.payload;
      if (!state.messages) state.messages = {};
      const messages = state.messages[chatId];
      if (messages) {
        const index = messages.findIndex((m) => m.id === tempId);
        if (index !== -1) {
          messages[index] = newMessage;
        }
      }
    },
    updateMessageStatus: (
      state,
      action: PayloadAction<{ chatId: string; messageId: string; status: "sent" | "delivered" | "read" | "sending" | "failed" }>
    ) => {
      const { chatId, messageId, status } = action.payload;
      if (!state.messages) state.messages = {};
      const messages = state.messages[chatId];
      if (messages) {
        const message = messages.find((m) => m.id === messageId);
        if (message) {
          message.status = status;
        }
      }
    },
    setChatLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setChats, setActiveChat, setMessages, upsertMessages, updateLastSync, addMessage, setChatLoading, updateMessage, updateMessageStatus } =
  chatSlice.actions;

export default chatSlice.reducer;
