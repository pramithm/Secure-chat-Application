import { Response } from 'express';
import User from '../models/User';
import FriendRequest from '../models/FriendRequest';
import { AuthRequest } from '../middlewares/auth.middleware';

export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query = req.query.q ? String(req.query.q).trim().toLowerCase() : '';
    const currentUserId = req.user._id;

    if (!query) {
      res.json({ users: [] });
      return;
    }

    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ]
    }).select('name username avatar publicKey isOnline lastSeen friends');

    const currentUser = await User.findById(currentUserId);
    const friendsList = currentUser?.friends.map(id => id.toString()) || [];

    // Fetch friend requests involving current user
    const pendingRequests = await FriendRequest.find({
      $or: [
        { sender: currentUserId },
        { receiver: currentUserId }
      ],
      status: 'pending'
    });

    const formattedUsers = users.map(u => {
      const uId = u._id.toString();
      let friendStatus = 'none'; // 'none' | 'friends' | 'pending_sent' | 'pending_received'

      if (friendsList.includes(uId)) {
        friendStatus = 'friends';
      } else {
        const req = pendingRequests.find(
          r => (r.sender.toString() === currentUserId.toString() && r.receiver.toString() === uId) ||
               (r.receiver.toString() === currentUserId.toString() && r.sender.toString() === uId)
        );
        if (req) {
          friendStatus = req.sender.toString() === currentUserId.toString() ? 'pending_sent' : 'pending_received';
        }
      }

      return {
        id: u._id,
        name: u.name,
        username: u.username,
        avatar: u.avatar,
        publicKey: u.publicKey,
        isOnline: u.isOnline,
        lastSeen: u.lastSeen,
        friendStatus
      };
    });

    res.json({ users: formattedUsers });
  } catch (error: any) {
    console.error('User Search Error:', error);
    res.status(500).json({ error: 'Failed to search users.' });
  }
};

export const getUserPublicKey = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('name username publicKey avatar');
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch public key.' });
  }
};
