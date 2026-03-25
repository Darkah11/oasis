import { useState } from 'react';
import { Settings, Plus, LayoutGrid, MessageSquare, Users, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import GlobalSearchModal from '@/components/modals/GlobalSearchModal';

export default function NavSidebar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navItems = [
    { icon: LayoutGrid, label: 'Work', color: 'bg-zinc-800' },
    { icon: MessageSquare, label: 'ICG', color: 'bg-gold-200/20', active: true },
    { icon: Star, label: 'SP', color: 'bg-zinc-800' },
    { icon: Users, label: 'BFF', color: 'bg-zinc-800' },
  ];

  return (
    <>
      <div className="w-20 bg-[#0d0d0d] flex flex-col items-center py-6 gap-6 h-full border-r border-[#222]">
        {/* App Logo / Home */}
        <div className="w-12 h-12 rounded-2xl bg-gold-200 flex items-center justify-center text-[#0d0d0d] font-black text-2xl mb-2 cursor-pointer hover:scale-105 transition-transform">
          S
        </div>

        <div className="flex-1 flex flex-col items-center gap-4 w-full px-2">
          {navItems.map((item, i) => (
            <div key={i} className="group relative flex flex-col items-center gap-1 cursor-pointer">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200",
                item.active 
                  ? "bg-gold-200 text-[#0d0d0d] shadow-[0_0_15px_rgba(226,241,99,0.3)]" 
                  : "bg-[#1a1a1a] text-zinc-500 hover:bg-zinc-800 hover:text-white"
              )}>
                <item.icon size={22} />
              </div>
              <span className={cn(
                "text-[10px] font-medium uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity",
                item.active ? "text-gold-200 opacity-100" : "text-zinc-500"
              )}>
                {item.label}
              </span>
              {item.active && (
                <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-1 h-8 bg-gold-200 rounded-r-full" />
              )}
            </div>
          ))}
          
          <div className="mt-2 w-8 h-[1px] bg-[#222]" />
          
          <div className="w-12 h-12 rounded-full bg-[#1a1a1a] text-zinc-500 flex items-center justify-center cursor-pointer hover:bg-zinc-800 hover:text-white transition-all">
            <Settings size={22} />
          </div>
        </div>

        <button 
          onClick={() => setIsSearchOpen(true)}
          className="w-12 h-12 rounded-2xl bg-gold-200 flex items-center justify-center text-[#0d0d0d] shadow-[0_0_20px_rgba(226,241,99,0.2)] hover:scale-105 transition-transform"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      <GlobalSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
}
