import express, { Application, Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import chatRoutes from './routes/chatRoutes';
import storyRoutes from './routes/storyRoutes';
import { errorHandler } from './middlewares/errorMiddleware';
import { setupChatSocket } from './sockets/chatSocket';

dotenv.config();

const app: Application = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

setupChatSocket(io);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
connectDB();

// Health Check API
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: "Let'sTalk Real-Time Social Messaging API is running cleanly",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/stories', storyRoutes);

// Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`[Let'sTalk Backend Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

export default app;
