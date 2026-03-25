'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import CallModal from '@/components/call/CallModal';
import { useCall } from '@/hooks/useCall';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/layout/Sidebar';
import ChatArea from '@/components/chat/ChatArea';
import NavSidebar from '@/components/layout/NavSidebar';
import RightPanel from '@/components/layout/RightPanel';

export default function Home() {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const { sendMessage, emitTyping, emitStopTyping } = useSocket();
  const {
    stream,
    receivingCall,
    callerName,
    callAccepted,
    myVideo,
    userVideo,
    callUser,
    answerCall,
    leaveCall
  } = useCall();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeChatId = useSelector((state: RootState) => state.chat.activeChatId);
  const activeChat = useSelector((state: RootState) => 
    state.chat.chats.find(c => c.id === activeChatId)
  );

  const startCall = () => {
    const participantId = activeChat?.participants.find((p: any) => p._id !== user?.id);
    if (participantId) {
      callUser(participantId.toString());
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <main className="flex h-screen overflow-hidden bg-[#0d0d0d] text-[#fefefe]">
      {/* 1. Nav Sidebar (Far Left) - Always visible on desktop */}
      <div className="hidden lg:block h-full">
        <NavSidebar />
      </div>

      {/* 2. Conversations Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-[#151515] border-r border-[#222] transition-transform duration-300 transform lg:relative lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar closeMobileMenu={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* 3. Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0d0d0d]">
        <ChatArea 
          toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          onStartCall={startCall}
        />
      </div>

      {/* 4. Right Panel (Desktop only) */}
      <div className="hidden xl:block h-full">
        <RightPanel />
      </div>

      {/* Call UI */}
      <CallModal
        isOpen={receivingCall || (!!activeChatId && !callAccepted && !!myVideo.current?.srcObject) || callAccepted}
        isIncoming={receivingCall && !callAccepted}
        callerName={callerName}
        onAccept={answerCall}
        onReject={leaveCall}
        myVideoRef={myVideo}
        userVideoRef={userVideo}
        callAccepted={callAccepted}
        stream={stream}
      />

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </main>
  );
}
