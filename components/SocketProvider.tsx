'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addMessage } from '@/store/slices/chatSlice';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
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
  const [isConnected, setIsConnected] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (!user || !token) {
      console.log('❌ No user or token, skipping socket connection');
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    const socketInitializer = async () => {
      try {
        console.log('🔌 Priming socket server...');
        await fetch('/api/socket');
        
        console.log('🔌 Initializing Socket.io for user:', user?.id);

        const newSocket = io(socketUrl, {
          path: '/api/socket',
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          transports: ['websocket', 'polling'],
          upgrade: true,
        });

        // Connection event
        newSocket.on('connect', () => {
          console.log('✅ Socket connected with ID:', newSocket.id);
          setIsConnected(true);
          
          const userId = user?.id || (user as any)?._id;
          if (userId) {
            console.log('👤 Emitting join event with userId:', userId);
            newSocket.emit('join', userId);
          }
          
          setSocket(newSocket);
        });

        // Connection error
        newSocket.on('connect_error', (error) => {
          console.error('❌ Socket connection error:', error);
          setIsConnected(false);
        });

        // Receive message
        newSocket.on('receive-message', (message) => {
          console.log('📨 Message received via socket:', message);
          if (message.chatId) {
            dispatch(addMessage({ chatId: message.chatId, message }));
          }
        });

        // Typing indicator
        newSocket.on('user-typing', (userId) => {
          console.log('✏️ User typing:', userId);
        });

        newSocket.on('user-stop-typing', (userId) => {
          console.log('User stopped typing:', userId);
        });

        // Disconnect
        newSocket.on('disconnect', () => {
          console.log('❌ Socket disconnected');
          setIsConnected(false);
        });

        return newSocket;
      } catch (error) {
        console.error('❌ Socket initialization failed:', error);
        return null;
      }
    };

    let mounted = true;
    let activeSocket: Socket | null = null;
    
    socketInitializer().then(s => {
      if (!mounted) {
        s?.disconnect();
        return;
      }
      activeSocket = s;
    });

    return () => {
      mounted = false;
      console.log('🧹 Cleaning up socket connection');
      if (activeSocket) {
        activeSocket.disconnect();
      }
    };
  }, [user, token, dispatch]);

  const sendMessage = (receiverId: string, message: any) => {
    if (!socket) {
      console.error('❌ Socket is null');
      return;
    }

    if (!socket.connected) {
      console.error('❌ Socket is not connected');
      return;
    }

    console.log('📤 Sending message to:', receiverId);
    socket.emit('send-message', { receiverId, message }, (response: any) => {
      console.log('📬 Message sent acknowledgment:', response);
    });
  };

  const emitTyping = (receiverId: string) => {
    if (socket && socket.connected) {
      const userId = typeof user === 'object' ? user?.id : user;
      socket.emit('typing', { receiverId, userId });
    }
  };

  const emitStopTyping = (receiverId: string) => {
    if (socket && socket.connected) {
      const userId = typeof user === 'object' ? user?.id : user;
      socket.emit('stop-typing', { receiverId, userId });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, sendMessage, emitTyping, emitStopTyping }}>
      {children}
    </SocketContext.Provider>
  );
}