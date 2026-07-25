"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/secure_chat_db';
        await mongoose_1.default.connect(connStr);
        console.log(`[MongoDB] Connected successfully to ${mongoose_1.default.connection.host}`);
    }
    catch (error) {
        console.error('[MongoDB] Connection error:', error);
        // Proceed so app server starts even if DB connection is pending in dev
    }
};
exports.connectDB = connectDB;
