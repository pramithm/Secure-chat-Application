import { Response } from 'express';
import Chat from '../models/Chat';
import Message from '../models/Message';
import User from '../models/User';
import File from '../models/File';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getUserChats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'name username avatar publicKey isOnline lastSeen')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json({ chats });
  } catch (error: any) {
    console.error('Fetch Chats Error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations.' });
  }
};

export const getOrCreateChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { targetUserId } = req.body;
    const currentUserId = req.user._id;

    if (!targetUserId) {
      res.status(400).json({ error: 'Target user ID is required.' });
      return;
    }

    // Verify users are friends before allowing chat session (using string comparison for ObjectIds)
    const currentUser = await User.findById(currentUserId);
    const isFriend = currentUser?.friends.some(
      (fId: any) => fId.toString() === targetUserId.toString()
    );

    if (!isFriend) {
      res.status(403).json({ error: 'Messaging is restricted to confirmed friends only.' });
      return;
    }

    let chat = await Chat.findOne({
      participants: { $all: [currentUserId, targetUserId] }
    }).populate('participants', 'name username avatar publicKey isOnline lastSeen');

    if (!chat) {
      chat = await Chat.create({
        participants: [currentUserId, targetUserId]
      });
      chat = await chat.populate('participants', 'name username avatar publicKey isOnline lastSeen');
    }

    res.json({ chat });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create or fetch chat.' });
  }
};

export const getChatMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findOne({ _id: chatId, participants: userId });
    if (!chat) {
      res.status(403).json({ error: 'Chat not found or access denied.' });
      return;
    }

    const messages = await Message.find({ chatId })
      .populate('sender', 'name username avatar')
      .populate('receiver', 'name username avatar')
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
};

export const uploadAttachment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const newFile = await File.create({
      uploader: req.user._id,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: fileUrl
    });

    res.status(201).json({
      message: 'File uploaded successfully.',
      file: {
        id: newFile._id,
        originalName: newFile.originalName,
        url: fileUrl,
        size: newFile.size,
        mimeType: newFile.mimeType
      }
    });
  } catch (error: any) {
    console.error('File Upload Error:', error);
    res.status(500).json({ error: error.message || 'File upload failed.' });
  }
};
