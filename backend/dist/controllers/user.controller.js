"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPublicKey = exports.searchUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const FriendRequest_1 = __importDefault(require("../models/FriendRequest"));
const searchUsers = async (req, res) => {
    try {
        const query = req.query.q ? String(req.query.q).trim().toLowerCase() : '';
        const currentUserId = req.user._id;
        if (!query) {
            res.json({ users: [] });
            return;
        }
        const users = await User_1.default.find({
            _id: { $ne: currentUserId },
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } }
            ]
        }).select('name username avatar publicKey isOnline lastSeen friends');
        const currentUser = await User_1.default.findById(currentUserId);
        const friendsList = currentUser?.friends.map(id => id.toString()) || [];
        // Fetch friend requests involving current user
        const pendingRequests = await FriendRequest_1.default.find({
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
            }
            else {
                const req = pendingRequests.find(r => (r.sender.toString() === currentUserId.toString() && r.receiver.toString() === uId) ||
                    (r.receiver.toString() === currentUserId.toString() && r.sender.toString() === uId));
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
    }
    catch (error) {
        console.error('User Search Error:', error);
        res.status(500).json({ error: 'Failed to search users.' });
    }
};
exports.searchUsers = searchUsers;
const getUserPublicKey = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User_1.default.findById(userId).select('name username publicKey avatar');
        if (!user) {
            res.status(404).json({ error: 'User not found.' });
            return;
        }
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch public key.' });
    }
};
exports.getUserPublicKey = getUserPublicKey;
