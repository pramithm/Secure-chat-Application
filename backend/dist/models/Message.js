"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const MessageSchema = new mongoose_1.Schema({
    sender: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiver: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    chatId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
    ciphertext: { type: String, required: true },
    encryptedAesKey: { type: String, required: true },
    iv: { type: String, required: true },
    authTag: { type: String, default: '' },
    hash: { type: String, required: true },
    messageType: {
        type: String,
        enum: ['text', 'image', 'voice', 'pdf', 'docx'],
        default: 'text'
    },
    mediaUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' }
}, { timestamps: true });
exports.default = mongoose_1.default.model('Message', MessageSchema);
