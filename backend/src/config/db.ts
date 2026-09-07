import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/letstalk';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB Atlas] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Atlas] Connection Error:`, error);
    // Note: In dev mode without active credentials, backend fallback continues gracefully
  }
};
