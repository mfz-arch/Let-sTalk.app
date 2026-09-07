"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupChatSocket = void 0;
const User_1 = require("../models/User");
const setupChatSocket = (io) => {
    const onlineUsers = new Map(); // userId -> socketId
    io.on('connection', (socket) => {
        console.log(`[Socket.IO] New client connected: ${socket.id}`);
        // User joins with their userId
        socket.on('user_connected', async (userId) => {
            onlineUsers.set(userId, socket.id);
            try {
                await User_1.User.findByIdAndUpdate(userId, { onlineStatus: 'online' });
            }
            catch (err) {
                console.error('Socket onlineStatus error:', err);
            }
            io.emit('user_status_changed', { userId, onlineStatus: 'online' });
        });
        // Join specific conversation room
        socket.on('join_conversation', (conversationId) => {
            socket.join(conversationId);
            console.log(`[Socket.IO] Socket ${socket.id} joined room ${conversationId}`);
        });
        // Handle instant message broadcast
        socket.on('send_message', (data) => {
            const { conversationId, message } = data;
            // Broadcast to room except sender or to all in room
            socket.to(conversationId).emit('receive_message', message);
        });
        // Handle typing indicators
        socket.on('typing', (data) => {
            socket.to(data.conversationId).emit('user_typing', data);
        });
        // Disconnect event
        socket.on('disconnect', () => {
            let disconnectedUserId = null;
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    disconnectedUserId = userId;
                    onlineUsers.delete(userId);
                    break;
                }
            }
            if (disconnectedUserId) {
                User_1.User.findByIdAndUpdate(disconnectedUserId, { onlineStatus: 'offline', lastSeen: new Date() }).catch(console.error);
                io.emit('user_status_changed', { userId: disconnectedUserId, onlineStatus: 'offline' });
            }
            console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
        });
    });
};
exports.setupChatSocket = setupChatSocket;
