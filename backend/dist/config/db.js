"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/letstalk';
        const conn = await mongoose_1.default.connect(mongoUri);
        console.log(`[MongoDB Atlas] Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`[MongoDB Atlas] Connection Error:`, error);
        // Note: In dev mode without active credentials, backend fallback continues gracefully
    }
};
exports.connectDB = connectDB;
