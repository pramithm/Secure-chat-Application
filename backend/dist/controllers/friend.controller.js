"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFriendsList = exports.getFriendRequests = exports.cancelFriendRequest = exports.respondFriendRequest = exports.sendFriendRequest = void 0;
const User_1 = __importDefault(require("../models/User"));
const FriendRequest_1 = __importDefault(require("../models/FriendRequest"));
const Chat_1 = __importDefault(require("../models/Chat"));
const sendFriendRequest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user._id;
        if (!receiverId || senderId.toString() === receiverId.toString()) {
            res.status(400).json({ error: 'Invalid receiver ID.' });
            return;
        }
        const receiver = await User_1.default.findById(receiverId);
        if (!receiver) {
            res.status(404).json({ error: 'Receiver user not found.' });
            return;
        }
        // Check if already friends using string comparison for ObjectId arrays
        const isAlreadyFriend = req.user.friends.some((fId) => fId.toString() === receiverId.toString());
        if (isAlreadyFriend) {
            res.status(400).json({ error: 'You are already friends.' });
            return;
        }
        // Check existing request
        const existingReq = await FriendRequest_1.default.findOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        });
        if (existingReq) {
            if (existingReq.status === 'pending') {
                res.status(400).json({ error: 'A friend request is already pending.' });
                return;
            }
            if (existingReq.status === 'accepted') {
                res.status(400).json({ error: 'You are already friends.' });
                return;
            }
            // If rejected earlier, update status back to pending
            existingReq.sender = senderId;
            existingReq.receiver = receiverId;
            existingReq.status = 'pending';
            await existingReq.save();
            res.json({ message: 'Friend request sent.', request: existingReq });
            return;
        }
        const newRequest = await FriendRequest_1.default.create({
            sender: senderId,
            receiver: receiverId,
            status: 'pending'
        });
        res.status(201).json({ message: 'Friend request sent successfully.', request: newRequest });
    }
    catch (error) {
        console.error('Send Request Error:', error);
        res.status(500).json({ error: 'Failed to send friend request.' });
    }
};
exports.sendFriendRequest = sendFriendRequest;
const respondFriendRequest = async (req, res) => {
    try {
        const { requestId, action } = req.body; // action: 'accept' | 'reject'
        const userId = req.user._id;
        if (!requestId || !['accept', 'reject'].includes(action)) {
            res.status(400).json({ error: 'Request ID and valid action ("accept" or "reject") are required.' });
            return;
        }
        const friendReq = await FriendRequest_1.default.findById(requestId);
        if (!friendReq) {
            res.status(404).json({ error: 'Friend request not found.' });
            return;
        }
        if (friendReq.receiver.toString() !== userId.toString()) {
            res.status(403).json({ error: 'Unauthorized to respond to this request.' });
            return;
        }
        if (action === 'reject') {
            friendReq.status = 'rejected';
            await friendReq.save();
            res.json({ message: 'Friend request rejected.' });
            return;
        }
        // Accept request
        friendReq.status = 'accepted';
        await friendReq.save();
        // Add each other to friends array
        await User_1.default.findByIdAndUpdate(userId, { $addToSet: { friends: friendReq.sender } });
        await User_1.default.findByIdAndUpdate(friendReq.sender, { $addToSet: { friends: userId } });
        // Create or find chat session
        let chat = await Chat_1.default.findOne({
            participants: { $all: [userId, friendReq.sender] }
        });
        if (!chat) {
            chat = await Chat_1.default.create({
                participants: [userId, friendReq.sender]
            });
        }
        res.json({ message: 'Friend request accepted.', chatId: chat._id });
    }
    catch (error) {
        console.error('Respond Request Error:', error);
        res.status(500).json({ error: error.message || 'Failed to process friend request.' });
    }
};
exports.respondFriendRequest = respondFriendRequest;
const cancelFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;
        const request = await FriendRequest_1.default.findOne({ _id: requestId, sender: userId });
        if (!request) {
            res.status(404).json({ error: 'Friend request not found or unauthorized.' });
            return;
        }
        await FriendRequest_1.default.findByIdAndDelete(requestId);
        res.json({ message: 'Friend request cancelled.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to cancel request.' });
    }
};
exports.cancelFriendRequest = cancelFriendRequest;
const getFriendRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        const pendingReceived = await FriendRequest_1.default.find({ receiver: userId, status: 'pending' })
            .populate('sender', 'name username avatar publicKey isOnline');
        const pendingSent = await FriendRequest_1.default.find({ sender: userId, status: 'pending' })
            .populate('receiver', 'name username avatar publicKey isOnline');
        res.json({ received: pendingReceived, sent: pendingSent });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch friend requests.' });
    }
};
exports.getFriendRequests = getFriendRequests;
const getFriendsList = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user._id).populate('friends', 'name username avatar publicKey isOnline lastSeen');
        if (!user) {
            res.status(404).json({ error: 'User not found.' });
            return;
        }
        res.json({ friends: user.friends });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch friends list.' });
    }
};
exports.getFriendsList = getFriendsList;
