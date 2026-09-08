import { Server as SocketIOServer, Socket } from 'socket.io';
import { User } from '../models/User';

export const setupChatSocket = (io: SocketIOServer): void => {
  const onlineUsers = new Map<string, string>(); // userId -> socketId

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] New client connected: ${socket.id}`);

    // User joins with their userId
    socket.on('user_connected', async (userId: string) => {
      onlineUsers.set(userId, socket.id);
      try {
        await User.findByIdAndUpdate(userId, { onlineStatus: 'online' });
      } catch (err) {
        console.error('Socket onlineStatus error:', err);
      }
      io.emit('user_status_changed', { userId, onlineStatus: 'online' });
    });

    // Join specific conversation room
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(conversationId);
      console.log(`[Socket.IO] Socket ${socket.id} joined room ${conversationId}`);
    });

    // Handle instant message broadcast
    socket.on('send_message', (data: any) => {
      const { conversationId, message } = data;
      // Broadcast to room except sender or to all in room
      socket.to(conversationId).emit('receive_message', message);
    });

    // Handle typing indicators
    socket.on('typing', (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      socket.to(data.conversationId).emit('user_typing', data);
    });

    // Handle real-time instant read receipts broadcast
    socket.on('mark_read', (data: { conversationId: string; userId: string }) => {
      io.to(data.conversationId).emit('messages_read', data);
    });

    // Disconnect event
    socket.on('disconnect', () => {
      let disconnectedUserId: string | null = null;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          onlineUsers.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        User.findByIdAndUpdate(disconnectedUserId, { onlineStatus: 'offline', lastSeen: new Date() }).catch(console.error);
        io.emit('user_status_changed', { userId: disconnectedUserId, onlineStatus: 'offline' });
      }
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};
