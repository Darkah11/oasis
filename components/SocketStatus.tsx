'use client';

import { useSocket } from '@/hooks/useSocket';

export function SocketStatus() {
  const { isConnected } = useSocket();

  return (
    <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 ${
      isConnected 
        ? 'bg-green-500/20 text-green-500' 
        : 'bg-red-500/20 text-red-500'
    }`}>
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
}