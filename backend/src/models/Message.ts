import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  chatId: mongoose.Types.ObjectId;
  ciphertext: string;
  encryptedAesKey: string;
  iv: string;
  authTag?: string;
  hash: string;
  messageType: 'text' | 'image' | 'voice' | 'pdf' | 'docx';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  status: 'sent' | 'delivered' | 'read';
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
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
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>('Message', MessageSchema);
