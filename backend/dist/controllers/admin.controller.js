"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminMetrics = void 0;
const User_1 = __importDefault(require("../models/User"));
const Message_1 = __importDefault(require("../models/Message"));
const FriendRequest_1 = __importDefault(require("../models/FriendRequest"));
const File_1 = __importDefault(require("../models/File"));
const getAdminMetrics = async (req, res) => {
    try {
        const totalUsers = await User_1.default.countDocuments();
        const onlineUsers = await User_1.default.countDocuments({ isOnline: true });
        const totalMessages = await Message_1.default.countDocuments();
        const totalFriendRequests = await FriendRequest_1.default.countDocuments();
        const totalFilesShared = await File_1.default.countDocuments();
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch admin metrics.' });
    }
};
exports.getAdminMetrics = getAdminMetrics;
