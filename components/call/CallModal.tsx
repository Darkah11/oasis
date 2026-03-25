'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { cn, goldGradient } from '@/lib/utils';

interface CallModalProps {
  isOpen: boolean;
  isIncoming: boolean;
  callerName?: string;
  onAccept: () => void;
  onReject: () => void;
  myVideoRef: React.RefObject<HTMLVideoElement | null>;
  userVideoRef: React.RefObject<HTMLVideoElement | null>;
  callAccepted: boolean;
  stream: MediaStream | null;
}

export default function CallModal({
  isOpen,
  isIncoming,
  callerName,
  onAccept,
  onReject,
  myVideoRef,
  userVideoRef,
  callAccepted,
  stream
}: CallModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      >
        <div className="bg-card w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-gold-400/20">
          <div className="relative aspect-video bg-black">
            {/* Remote Video */}
            {callAccepted ? (
              <video playsInline ref={userVideoRef as any} autoPlay className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white space-y-4">
                <div className="w-24 h-24 rounded-full bg-gold-400/20 flex items-center justify-center animate-pulse">
                  <Phone size={48} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold">{isIncoming ? `Calling: ${callerName}` : 'Connecting...'}</h2>
              </div>
            )}

            {/* Local Video - PiP */}
            <div className="absolute bottom-6 right-6 w-48 aspect-video rounded-xl overflow-hidden border-2 border-primary shadow-xl bg-muted">
              {stream && (
                <video playsInline muted ref={myVideoRef as any} autoPlay className="w-full h-full object-cover" />
              )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 p-4 bg-white/10 backdrop-blur-lg rounded-full border border-white/20">
              <button className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
                <Mic size={24} />
              </button>
              <button className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
                <Video size={24} />
              </button>
              
              {isIncoming && !callAccepted ? (
                <>
                  <button 
                    onClick={onAccept}
                    className="p-4 rounded-full bg-green-500 hover:bg-green-600 text-white transition-all shadow-lg shadow-green-500/50"
                  >
                    <Phone size={24} />
                  </button>
                  <button 
                    onClick={onReject}
                    className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg shadow-red-500/50"
                  >
                    <PhoneOff size={24} />
                  </button>
                </>
              ) : (
                <button 
                  onClick={onReject}
                  className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg shadow-red-500/50"
                >
                  <PhoneOff size={24} />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
