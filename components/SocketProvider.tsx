'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addMessage } from '@/store/slices/chatSlice';

interface SocketContextType {
  socket: Socket | null;
  sendMessage: (receiverId: string, message: any) => void;
  emitTyping: (receiverId: string) => void;
  emitStopTyping: (receiverId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (!user || !token) return;

    const socketInitializer = async () => {
      await fetch('/api/socket_init');
      const newSocket = io({
        path: '/api/socket',
      });

      newSocket.on('connect', () => {
        const userId = user.id || (user as any)._id;
        console.log('Connected to socket', newSocket.id, 'Joining room:', userId);
        if (userId) {
          newSocket.emit('join', userId);
        }
        setSocket(newSocket);
      });

      newSocket.on('receive-message', (message) => {
        console.log('Received message via socket:', message);
        dispatch(addMessage({ chatId: message.chatId, message }));
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setSocket(null);
      });
    };

    socketInitializer();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user, token, dispatch]);

  const sendMessage = (receiverId: string, message: any) => {
    if (socket) {
      socket.emit('send-message', { receiverId, message });
    }
  };

  const emitTyping = (receiverId: string) => {
    if (socket) {
      socket.emit('typing', { receiverId, userId: user?.id });
    }
  };

  const emitStopTyping = (receiverId: string) => {
    if (socket) {
      socket.emit('stop-typing', { receiverId, userId: user?.id });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, sendMessage, emitTyping, emitStopTyping }}>
      {children}
    </SocketContext.Provider>
  );
}
