'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, UserPlus, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setChats, setActiveChat } from '@/store/slices/chatSlice';
import { cn } from '@/lib/utils';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setResults([]);
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get(`/api/users/search?q=${searchTerm}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(response.data.users);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, token]);

  const handleCreateChat = async (participantId: string) => {
    try {
      const response = await axios.post('/api/chats', { participantId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const newChat = response.data.chat;
      const chatsRes = await axios.get('/api/chats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(setChats(chatsRes.data.chats));
      dispatch(setActiveChat(newChat._id));
      onClose();
      setSearchTerm('');
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-[#151515] border border-[#222] rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-[#222] flex items-center justify-between">
          <h2 className="text-xl font-black italic tracking-tighter">FIND NEW OASIS</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-gold-200 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              autoFocus
              className="w-full bg-[#0d0d0d] border border-[#222] focus:border-gold-200/50 focus:outline-none rounded-2xl py-4 pl-12 pr-4 text-base transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="animate-spin text-gold-200" size={20} />
              </div>
            )}
          </div>

          <div className="mt-6 max-h-[400px] overflow-y-auto no-scrollbar space-y-2">
            {results.length > 0 ? (
              results.map((u) => (
                <button
                  key={u._id}
                  onClick={() => handleCreateChat(u._id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-[#1a1a1a] rounded-2xl transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-gold-200/10 flex items-center justify-center text-gold-200 font-bold text-lg group-hover:bg-gold-200 group-hover:text-[#0d0d0d] transition-all">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold">{u.name}</p>
                    <p className="text-xs text-zinc-500">{u.email}</p>
                  </div>
                  <UserPlus className="text-zinc-600 group-hover:text-gold-200 transition-colors" size={20} />
                </button>
              ))
            ) : searchTerm.length >= 2 && !loading ? (
              <div className="py-12 text-center opacity-30">
                <Search size={48} className="mx-auto mb-4" />
                <p className="text-lg font-bold">No users found</p>
              </div>
            ) : (
              <div className="py-12 text-center opacity-20 italic">
                <p>Type at least 2 characters to search</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
