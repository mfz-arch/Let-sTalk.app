"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const storyRoutes_1 = __importDefault(require("./routes/storyRoutes"));
const errorMiddleware_1 = require("./middlewares/errorMiddleware");
const chatSocket_1 = require("./sockets/chatSocket");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Socket.IO setup
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});
(0, chatSocket_1.setupChatSocket)(io);
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// MongoDB Connection
(0, db_1.connectDB)();
// Health Check API
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: "Let'sTalk Real-Time Social Messaging API is running cleanly",
        timestamp: new Date().toISOString(),
    });
});
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/chats', chatRoutes_1.default);
app.use('/api/stories', storyRoutes_1.default);
// Error Middleware
app.use(errorMiddleware_1.errorHandler);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`[Let'sTalk Backend Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
exports.default = app;
