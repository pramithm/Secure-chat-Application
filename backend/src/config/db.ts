import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/secure_chat_db';
    await mongoose.connect(connStr);
    console.log(`[MongoDB] Connected successfully to ${mongoose.connection.host}`);
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    // Proceed so app server starts even if DB connection is pending in dev
  }
};
