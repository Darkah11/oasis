import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import type { Server as IOServer } from 'socket.io';

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new Server(res.socket.server as any, {
      path: '/api/socket',
      addTrailingSlash: false,
    });
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);

      socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
      });

      socket.on('send-message', (data) => {
        const { receiverId, message } = data;
        console.log(`Sending message from ${socket.id} to room ${receiverId}`);
        io.to(receiverId).emit('receive-message', message);
      });

      socket.on('typing', (data) => {
        const { receiverId, userId } = data;
        socket.to(receiverId).emit('user-typing', userId);
      });

      socket.on('stop-typing', (data) => {
        const { receiverId, userId } = data;
        socket.to(receiverId).emit('user-stop-typing', userId);
      });

      // --- WebRTC Signaling ---
      socket.on('call-user', (data) => {
        const { userToCall, signalData, from, name } = data;
        io.to(userToCall).emit('incoming-call', { signal: signalData, from, name });
      });

      socket.on('answer-call', (data) => {
        io.to(data.to).emit('call-accepted', data.signal);
      });

      socket.on('end-call', (data) => {
        io.to(data.to).emit('call-ended');
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
      });
    });
  }
  res.end();
};

export default SocketHandler;
