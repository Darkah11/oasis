'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setActiveChat, setChats } from '@/store/slices/chatSlice';
import axios from 'axios';
import { 
  MessageSquare, 
  LogOut
} from 'lucide-react';
import { logout } from '@/store/slices/authSlice';
import { cn, goldTextGradient } from '@/lib/utils';

interface SidebarProps {
  closeMobileMenu: () => void;
}

export default function Sidebar({ closeMobileMenu }: SidebarProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const chats = useSelector((state: RootState) => state.chat.chats);
  const activeChatId = useSelector((state: RootState) => state.chat.activeChatId);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchChats = async () => {
      if (!token) return;
      try {
        const response = await axios.get('/api/chats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        dispatch(setChats(response.data.chats));
      } catch (error) {
        console.error('Failed to fetch chats:', error);
        dispatch(setChats([]));
      }
    };

    fetchChats();
  }, [token, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="flex flex-col h-full bg-[#151515]">
      {/* Header */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-1">Messages</h2>
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <span>{chats.length} conversations</span>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 no-scrollbar">
        {chats.length > 0 ? (
          chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => {
                dispatch(setActiveChat(chat.id));
                closeMobileMenu();
              }}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative overflow-hidden group",
                activeChatId === chat.id 
                  ? "bg-[#222] shadow-lg scale-[1.02]" 
                  : "hover:bg-[#1a1a1a]"
              )}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-lg text-zinc-400 group-hover:bg-zinc-700 transition-colors">
                  {chat.name?.charAt(0) || 'U'}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-gold-200 border-2 border-[#151515] rounded-full" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-bold truncate pr-2">{chat.name}</span>
                  <span className="text-[10px] text-zinc-500 font-medium">12:30 PM</span>
                </div>
                <p className="text-xs text-zinc-500 truncate">
                  {chat.lastMessage?.content || 'Started a new conversation'}
                </p>
              </div>
              {chat.unreadCount > 0 && (
                <div className="w-5 h-5 bg-gold-200 text-[#0d0d0d] text-[10px] flex items-center justify-center rounded-full font-black shadow-[0_0_10px_rgba(226,241,99,0.4)]">
                  {chat.unreadCount}
                </div>
              )}
              {activeChatId === chat.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold-200" />
              )}
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center text-zinc-600 p-4">
            <MessageSquare size={32} className="mb-2 opacity-20" />
            <p className="text-sm">No conversations yet</p>
          </div>
        )}
      </div>

      {/* User Mini Profile */}
      <div className="p-6 bg-[#0d0d0d]/30 border-t border-[#222]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold-200 flex items-center justify-center text-[#0d0d0d] font-bold">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{user?.name}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-none mt-1">Online</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-zinc-600 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
