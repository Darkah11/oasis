import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  createdAt?: string;
}

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
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  activeChatId: null,
  messages: {},
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
      state.messages[action.payload.chatId] = action.payload.messages;
    },
    addMessage: (
      state,
      action: PayloadAction<{ chatId: string; message: Message }>
    ) => {
      const { chatId, message } = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      state.messages[chatId].push(message);
      
      // Update last message in chat list
      const chat = state.chats.find((c) => c.id === chatId);
      if (chat) {
        chat.lastMessage = message;
      }
    },
    setChatLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setChats, setActiveChat, setMessages, addMessage, setChatLoading } =
  chatSlice.actions;

export default chatSlice.reducer;
