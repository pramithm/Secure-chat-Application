import { Server, Socket } from 'socket.io';
import Message from '../models/Message';
import Chat from '../models/Chat';
import User from '../models/User';

interface EncryptedMessagePayload {
  chatId: string;
  senderId: string;
  receiverId: string;
  ciphertext: string;
  encryptedAesKey: string;
  iv: string;
  authTag?: string;
  hash: string;
  messageType?: 'text' | 'image' | 'voice' | 'pdf' | 'docx';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export const setupSocketHandlers = (io: Server) => {
  const onlineUsers = new Map<string, string>(); // userId -> socketId

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // User register on socket
    socket.on('register_user', async (userId: string) => {
      if (!userId) return;
      onlineUsers.set(userId, socket.id);
      socket.join(`user:${userId}`);

      try {
        await User.findByIdAndUpdate(userId, { isOnline: true });
        io.emit('user_status_change', { userId, isOnline: true });
      } catch (err) {
        console.error('Socket user status update error:', err);
      }
    });

    // Join Chat Room
    socket.on('join_chat', (chatId: string) => {
      socket.join(`chat:${chatId}`);
    });

    // Leave Chat Room
    socket.on('leave_chat', (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });

    // Send Encrypted Message Event
    socket.on('send_encrypted_message', async (data: EncryptedMessagePayload) => {
      try {
        const {
          chatId,
          senderId,
          receiverId,
          ciphertext,
          encryptedAesKey,
          iv,
          authTag,
          hash,
          messageType = 'text',
          mediaUrl = '',
          fileName = '',
          fileSize = 0
        } = data;

        if (!chatId || !senderId || !receiverId || !ciphertext || !encryptedAesKey || !iv || !hash) {
          socket.emit('message_error', { error: 'Invalid encrypted payload parameters.' });
          return;
        }

        // Check if users are friends (using string comparison for ObjectIds)
        const senderUser = await User.findById(senderId);
        const isFriend = senderUser?.friends.some(
          (fId: any) => fId.toString() === receiverId.toString()
        );

        if (!isFriend) {
          socket.emit('message_error', { error: 'You can only message confirmed friends.' });
          return;
        }

        // Save Encrypted Message to MongoDB (No plaintext stored)
        const newMessage = await Message.create({
          sender: senderId,
          receiver: receiverId,
          chatId,
          ciphertext,
          encryptedAesKey,
          iv,
          authTag: authTag || '',
          hash,
          messageType,
          mediaUrl,
          fileName,
          fileSize,
          status: 'sent'
        });

        // Update Chat lastMessage timestamp
        await Chat.findByIdAndUpdate(chatId, { lastMessage: newMessage._id, updatedAt: new Date() });

        const populatedMsg = await Message.findById(newMessage._id)
          .populate('sender', 'name username avatar')
          .populate('receiver', 'name username avatar');

        // Broadcast to chat room
        io.to(`chat:${chatId}`).emit('receive_encrypted_message', populatedMsg);

        // Also emit directly to receiver user channel if not in room
        io.to(`user:${receiverId}`).emit('new_message_notification', populatedMsg);
      } catch (error: any) {
        console.error('Socket Encrypted Message Error:', error);
        socket.emit('message_error', { error: 'Failed to process encrypted message.' });
      }
    });

    // Typing Indicators
    socket.on('typing_start', ({ chatId, userId, username }) => {
      socket.to(`chat:${chatId}`).emit('user_typing_start', { chatId, userId, username });
    });

    socket.on('typing_stop', ({ chatId, userId }) => {
      socket.to(`chat:${chatId}`).emit('user_typing_stop', { chatId, userId });
    });

    // Message Delivered & Read Receipts
    socket.on('mark_read', async ({ chatId, userId }) => {
      try {
        await Message.updateMany(
          { chatId, receiver: userId, status: { $ne: 'read' } },
          { status: 'read' }
        );
        io.to(`chat:${chatId}`).emit('messages_read_update', { chatId, userId });
      } catch (err) {
        console.error('Socket mark read error:', err);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      let disconnectedUserId: string | null = null;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          onlineUsers.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        try {
          await User.findByIdAndUpdate(disconnectedUserId, { isOnline: false, lastSeen: new Date() });
          io.emit('user_status_change', { userId: disconnectedUserId, isOnline: false });
        } catch (err) {
          console.error('Socket disconnect status update error:', err);
        }
      }
    });
  });
};
