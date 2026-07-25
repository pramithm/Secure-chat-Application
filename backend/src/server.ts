import express, { Application, Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';

import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import friendRoutes from './routes/friend.routes';
import chatRoutes from './routes/chat.routes';
import adminRoutes from './routes/admin.routes';
import { setupSocketHandlers } from './socket/chatSocket';

dotenv.config();

const app: Application = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security Middlewares
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: [CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:5173'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', apiLimiter);

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', system: 'Secure Encrypted Communication Server', timestamp: new Date() });
});

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});
setupSocketHandlers(io);

// Start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`[Server] Secure E2EE Chat Server running on http://localhost:${PORT}`);
  });
});
