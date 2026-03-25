import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  isSidebarOpen: boolean;
  activeTab: 'chats' | 'contacts' | 'settings';
  notifications: boolean;
  sounds: boolean;
}

const initialState: UIState = {
  theme: 'system',
  isSidebarOpen: true,
  activeTab: 'chats',
  notifications: true,
  sounds: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setActiveTab: (state, action: PayloadAction<'chats' | 'contacts' | 'settings'>) => {
      state.activeTab = action.payload;
    },
    toggleNotifications: (state) => {
      state.notifications = !state.notifications;
    },
    toggleSounds: (state) => {
      state.sounds = !state.sounds;
    },
  },
});

export const { setTheme, toggleSidebar, setActiveTab, toggleNotifications, toggleSounds } =
  uiSlice.actions;

export default uiSlice.reducer;
