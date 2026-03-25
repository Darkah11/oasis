'use client';

import { Phone, Video, Pin, Users, ChevronDown } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { cn } from '@/lib/utils';

export default function RightPanel() {
  const activeChatId = useSelector((state: RootState) => state.chat.activeChatId);
  const chats = useSelector((state: RootState) => state.chat.chats);
  const activeChat = chats.find(c => c.id === activeChatId);

  if (!activeChatId || !activeChat) return null;

  return (
    <div className="w-80 bg-[#0d0d0d] border-l border-[#222] flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#222]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black italic tracking-tighter text-white">OASIS INFO</h2>
          <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500">
             <ChevronDown size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
           <div className="w-24 h-24 rounded-[32px] bg-gold-200 flex items-center justify-center text-[#0d0d0d] font-black text-3xl mb-4 shadow-2xl">
              {activeChat.name?.charAt(0) || 'U'}
           </div>
           <h3 className="text-lg font-bold text-white">{activeChat.name}</h3>
           <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-medium">
             {activeChat.type === 'direct' ? 'Direct Message' : 'Group Chat'}
           </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
         {/* Actions */}
         <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Phone, label: 'Call' },
              { icon: Video, label: 'Video' },
              { icon: Pin, label: 'Pin' },
              { icon: Users, label: 'Add' },
            ].map((action, i) => (
              <button key={i} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-2xl bg-[#151515] flex items-center justify-center text-zinc-400 group-hover:bg-gold-200 group-hover:text-[#0d0d0d] transition-all">
                   <action.icon size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-500 group-hover:text-gold-200">{action.label}</span>
              </button>
            ))}
         </div>

         {/* Empty Media Section */}
         <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Media & Links</h4>
            <div className="grid grid-cols-3 gap-2">
               {[1,2,3].map(i => (
                 <div key={i} className="aspect-square rounded-xl bg-[#151515] border border-[#222] flex items-center justify-center text-zinc-800">
                   <span className="text-[10px] font-bold">EMPTY</span>
                 </div>
               ))}
            </div>
            <button className="w-full py-3 text-xs font-bold text-zinc-500 hover:text-white transition-colors">
               View all media
            </button>
         </div>

         {/* Members Section Placeholder (Non-static) */}
         {activeChat.type === 'group' && (
           <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Members</h4>
              <div className="p-4 bg-[#151515] rounded-2xl border border-[#222] text-center italic text-xs text-zinc-600">
                Member list coming soon
              </div>
           </div>
         )}
      </div>
    </div>
  );
}
