import { Response } from 'express';
import User from '../models/User';
import Message from '../models/Message';
import FriendRequest from '../models/FriendRequest';
import File from '../models/File';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getAdminMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const onlineUsers = await User.countDocuments({ isOnline: true });
    const totalMessages = await Message.countDocuments();
    const totalFriendRequests = await FriendRequest.countDocuments();
    const totalFilesShared = await File.countDocuments();

    res.json({
      metrics: {
        totalUsers,
        onlineUsers,
        totalMessages,
        totalFriendRequests,
        totalFilesShared,
        serverStatus: 'Online',
        uptime: process.uptime(),
        timestamp: new Date()
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch admin metrics.' });
  }
};
