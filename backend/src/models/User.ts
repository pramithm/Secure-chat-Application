import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  username: string;
  email: string;
  password?: string;
  avatar: string;
  publicKey: string;
  privateKeyEncrypted?: string;
  isOnline: boolean;
  lastSeen: Date;
  role: 'user' | 'admin';
  friends: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String, default: '' },
    publicKey: { type: String, default: '' },
    privateKeyEncrypted: { type: String, default: '' },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
