// import { Server } from 'socket.io';
// import type { NextApiRequest, NextApiResponse } from 'next';
// import type { Server as HTTPServer } from 'http';
// import type { Socket as NetSocket } from 'net';
// import type { Server as IOServer } from 'socket.io';

// interface SocketServer extends HTTPServer {
//   io?: IOServer | undefined;
// }

// interface SocketWithIO extends NetSocket {
//   server: SocketServer;
// }

// interface NextApiResponseWithSocket extends NextApiResponse {
//   socket: SocketWithIO;
// }

// const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
//   if (res.socket.server.io) {
//     console.log('Socket is already running');
//   } else {
//     console.log('Socket is initializing');
//     const io = new Server(res.socket.server as any, {
//       path: '/api/socket',
//       addTrailingSlash: false,
//     });
//     res.socket.server.io = io;

//     io.on('connection', (socket) => {
//       console.log('Socket connected:', socket.id);

//       socket.on('join', (userId) => {
//         socket.join(userId);
//         console.log(`User ${userId} joined their room`);
//       });

//       socket.on('send-message', (data) => {
//         const { receiverId, message } = data;
//         console.log(`Sending message from ${socket.id} to room ${receiverId}`);
//         io.to(receiverId).emit('receive-message', message);
//       });

//       socket.on('typing', (data) => {
//         const { receiverId, userId } = data;
//         socket.to(receiverId).emit('user-typing', userId);
//       });

//       socket.on('stop-typing', (data) => {
//         const { receiverId, userId } = data;
//         socket.to(receiverId).emit('user-stop-typing', userId);
//       });

//       // --- WebRTC Signaling ---
//       socket.on('call-user', (data) => {
//         const { userToCall, signalData, from, name } = data;
//         io.to(userToCall).emit('incoming-call', { signal: signalData, from, name });
//       });

//       socket.on('answer-call', (data) => {
//         io.to(data.to).emit('call-accepted', data.signal);
//       });

//       socket.on('end-call', (data) => {
//         io.to(data.to).emit('call-ended');
//       });

//       socket.on('disconnect', () => {
//         console.log('Socket disconnected:', socket.id);
//       });
//     });
//   }
//   res.end();
// };

// export default SocketHandler;


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

const connectedUsers = new Map<string, string>();

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  // Check if Socket.io is already running
  if (res.socket.server.io) {
    console.log('✅ Socket.io server already running');
    res.end();
    return;
  }

  console.log('🚀 Initializing Socket.io server...');

  const io = new Server(res.socket.server as any, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  res.socket.server.io = io;

  io.on('connection', (socket) => {
    console.log('✅ New socket connection:', socket.id);

    // User joins their personal room
    socket.on('join', (userId) => {
      if (!userId) {
        console.error('❌ No userId provided in join event');
        return;
      }

      socket.join(userId);
      connectedUsers.set(userId, socket.id);
      console.log(`👤 User ${userId} joined with socket ${socket.id}`);
      console.log('📊 Connected users:', connectedUsers.size, Array.from(connectedUsers.keys()));
    });

    // Handle message sending
    socket.on('send-message', (data, callback) => {
      const { receiverId, message } = data;
      
      console.log('📤 Received send-message event');
      console.log('  From:', message.senderId);
      console.log('  To:', receiverId);
      console.log('  Content:', message.content);
      
      if (!receiverId) {
        console.error('❌ No receiver ID in message data');
        if (callback) callback({ success: false, error: 'No receiver ID' });
        return;
      }

      // Emit to receiver's room
      console.log(`📡 Emitting to room: ${receiverId}`);
      io.to(receiverId).emit('receive-message', message);
      
      console.log('✉️ Message emitted successfully');
      if (callback) callback({ success: true });
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { receiverId, userId } = data;
      if (receiverId) {
        socket.to(receiverId).emit('user-typing', userId);
      }
    });

    socket.on('stop-typing', (data) => {
      const { receiverId, userId } = data;
      if (receiverId) {
        socket.to(receiverId).emit('user-stop-typing', userId);
      }
    });

    // WebRTC Signaling
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

    // Disconnect
    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id);
      
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          console.log(`❌ Removed user ${userId} from connected users`);
          break;
        }
      }
    });
  });

  res.end();
};

export default SocketHandler;