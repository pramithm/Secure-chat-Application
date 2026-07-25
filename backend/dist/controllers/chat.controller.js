"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAttachment = exports.getChatMessages = exports.getOrCreateChat = exports.getUserChats = void 0;
const Chat_1 = __importDefault(require("../models/Chat"));
const Message_1 = __importDefault(require("../models/Message"));
const User_1 = __importDefault(require("../models/User"));
const File_1 = __importDefault(require("../models/File"));
const getUserChats = async (req, res) => {
    try {
        const userId = req.user._id;
        const chats = await Chat_1.default.find({ participants: userId })
            .populate('participants', 'name username avatar publicKey isOnline lastSeen')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });
        res.json({ chats });
    }
    catch (error) {
        console.error('Fetch Chats Error:', error);
        res.status(500).json({ error: 'Failed to fetch conversations.' });
    }
};
exports.getUserChats = getUserChats;
const getOrCreateChat = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const currentUserId = req.user._id;
        if (!targetUserId) {
            res.status(400).json({ error: 'Target user ID is required.' });
            return;
        }
        // Verify users are friends before allowing chat session (using string comparison for ObjectIds)
        const currentUser = await User_1.default.findById(currentUserId);
        const isFriend = currentUser?.friends.some((fId) => fId.toString() === targetUserId.toString());
        if (!isFriend) {
            res.status(403).json({ error: 'Messaging is restricted to confirmed friends only.' });
            return;
        }
        let chat = await Chat_1.default.findOne({
            participants: { $all: [currentUserId, targetUserId] }
        }).populate('participants', 'name username avatar publicKey isOnline lastSeen');
        if (!chat) {
            chat = await Chat_1.default.create({
                participants: [currentUserId, targetUserId]
            });
            chat = await chat.populate('participants', 'name username avatar publicKey isOnline lastSeen');
        }
        res.json({ chat });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create or fetch chat.' });
    }
};
exports.getOrCreateChat = getOrCreateChat;
const getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;
        const chat = await Chat_1.default.findOne({ _id: chatId, participants: userId });
        if (!chat) {
            res.status(403).json({ error: 'Chat not found or access denied.' });
            return;
        }
        const messages = await Message_1.default.find({ chatId })
            .populate('sender', 'name username avatar')
            .populate('receiver', 'name username avatar')
            .sort({ createdAt: 1 });
        res.json({ messages });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages.' });
    }
};
exports.getChatMessages = getChatMessages;
const uploadAttachment = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded.' });
            return;
        }
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        const newFile = await File_1.default.create({
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
    }
    catch (error) {
        console.error('File Upload Error:', error);
        res.status(500).json({ error: error.message || 'File upload failed.' });
    }
};
exports.uploadAttachment = uploadAttachment;
