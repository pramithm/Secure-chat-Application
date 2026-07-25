export interface User {
  id: string;
  _id?: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  publicKey: string;
  privateKeyEncrypted?: string;
  isOnline: boolean;
  lastSeen?: string;
  role?: 'user' | 'admin';
  friendStatus?: 'none' | 'friends' | 'pending_sent' | 'pending_received';
}

export interface Message {
  _id: string;
  sender: User | string;
  receiver: User | string;
  chatId: string;
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
  createdAt: string;
  // Decrypted client side for active UI
  decryptedContent?: string;
}

export interface Chat {
  _id: string;
  participants: User[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface FriendRequest {
  _id: string;
  sender: User;
  receiver: User;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface AdminMetrics {
  totalUsers: number;
  onlineUsers: number;
  totalMessages: number;
  totalFriendRequests: number;
  totalFilesShared: number;
  serverStatus: string;
  uptime: number;
  timestamp: string;
}

export interface EncryptionVisualStep {
  stepNumber: number;
  title: string;
  description: string;
  codeSnippet: string;
  type: 'plaintext' | 'aes_gen' | 'aes_enc' | 'rsa_enc' | 'sha_hash' | 'network' | 'rsa_dec' | 'aes_dec';
}
