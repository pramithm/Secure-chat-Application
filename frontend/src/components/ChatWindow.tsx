import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  Mic,
  Smile,
  Lock,
  Shield,
  Key,
  StopCircle,
  FileText,
  Image as ImageIcon,
  CheckCircle
} from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { Chat, Message, User as UserType } from '../types';
import { MessageBubble } from './MessageBubble';
import { encryptForRecipient, decryptFromSender } from '../services/webCrypto';

interface ChatWindowProps {
  chat: Chat;
  currentUserId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chat, currentUserId }) => {
  const { socket, isConnected } = useSocket();
  const { user, privateKeyJwk, demoMode } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [partnerTyping, setPartnerTyping] = useState<boolean>(false);

  // File upload state
  const [fileAttachment, setFileAttachment] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  // Voice recorder state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const recipient = chat.participants.find(p => (p.id || p._id) !== currentUserId);

  // Fetch messages & decrypt on load
  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/chats/${chat._id}/messages`);
      const rawMsgs: Message[] = res.data.messages;

      // Decrypt messages client side
      const decryptedMsgs = await Promise.all(
        rawMsgs.map(async (msg) => {
          let text = msg.ciphertext;
          if (privateKeyJwk && msg.encryptedAesKey && msg.iv) {
            text = await decryptFromSender(msg.ciphertext, msg.encryptedAesKey, msg.iv, privateKeyJwk);
          }
          return { ...msg, decryptedContent: text };
        })
      );

      setMessages(decryptedMsgs);
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chat._id) {
      loadMessages();
    }
  }, [chat._id]);

  // Ensure room join when socket is ready
  useEffect(() => {
    if (socket && isConnected && chat._id) {
      socket.emit('join_chat', chat._id);
    }

    return () => {
      if (socket && chat._id) {
        socket.emit('leave_chat', chat._id);
      }
    };
  }, [socket, isConnected, chat._id]);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = async (newMsg: Message) => {
      if (newMsg.chatId === chat._id) {
        setMessages(prev => {
          // Avoid duplicate messages if optimistic update already added it
          if (prev.some(m => m._id === newMsg._id)) return prev;

          // Decrypt if needed
          let text = newMsg.ciphertext;
          if (privateKeyJwk && newMsg.encryptedAesKey && newMsg.iv) {
            decryptFromSender(newMsg.ciphertext, newMsg.encryptedAesKey, newMsg.iv, privateKeyJwk).then(dText => {
              setMessages(currentMsgs =>
                currentMsgs.map(m => (m._id === newMsg._id ? { ...m, decryptedContent: dText } : m))
              );
            });
          }

          return [...prev, { ...newMsg, decryptedContent: text }];
        });
        scrollToBottom();
      }
    };

    const handleTypingStart = (data: { chatId: string; userId: string }) => {
      if (data.chatId === chat._id && data.userId !== currentUserId) {
        setPartnerTyping(true);
      }
    };

    const handleTypingStop = (data: { chatId: string; userId: string }) => {
      if (data.chatId === chat._id && data.userId !== currentUserId) {
        setPartnerTyping(false);
      }
    };

    socket.on('receive_encrypted_message', handleReceiveMessage);
    socket.on('user_typing_start', handleTypingStart);
    socket.on('user_typing_stop', handleTypingStop);

    return () => {
      socket.off('receive_encrypted_message', handleReceiveMessage);
      socket.off('user_typing_start', handleTypingStart);
      socket.off('user_typing_stop', handleTypingStop);
    };
  }, [socket, chat._id, privateKeyJwk, currentUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing status
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!socket || !recipient) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing_start', { chatId: chat._id, userId: currentUserId });
    }

    const timeoutId = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing_stop', { chatId: chat._id, userId: currentUserId });
    }, 2000);

    return () => clearTimeout(timeoutId);
  };

  // Send Encrypted Message
  const sendMessage = async (
    overrideText?: string,
    messageType: 'text' | 'image' | 'voice' | 'pdf' | 'docx' = 'text',
    mediaUrl: string = '',
    fileName: string = '',
    fileSize: number = 0
  ) => {
    const textToSend = overrideText !== undefined ? overrideText : inputText.trim();
    if (!textToSend && !mediaUrl) return;
    if (!recipient) return;

    try {
      const recipientPubKey = recipient.publicKey || '';

      // 1. Client-Side E2EE Encryption using WebCrypto API
      const packet = await encryptForRecipient(textToSend || '[File Attachment]', recipientPubKey);

      // 2. Transmit Encrypted Packet over Socket.IO
      const recipientId = recipient.id || recipient._id || '';

      const tempId = 'temp_' + Date.now();

      const payload = {
        chatId: chat._id,
        senderId: currentUserId,
        receiverId: recipientId,
        ciphertext: packet.ciphertext,
        encryptedAesKey: packet.encryptedAesKey,
        iv: packet.iv,
        hash: packet.hash,
        messageType,
        mediaUrl,
        fileName,
        fileSize
      };

      // 3. Optimistic local UI append for immediate message rendering
      const optimisticMsg: Message = {
        _id: tempId,
        sender: user || currentUserId,
        receiver: recipient,
        chatId: chat._id,
        ciphertext: packet.ciphertext,
        encryptedAesKey: packet.encryptedAesKey,
        iv: packet.iv,
        hash: packet.hash,
        messageType,
        mediaUrl,
        fileName,
        fileSize,
        status: 'sent',
        createdAt: new Date().toISOString(),
        decryptedContent: textToSend
      };

      setMessages(prev => [...prev, optimisticMsg]);

      if (socket) {
        socket.emit('send_encrypted_message', payload);
      }

      setInputText('');
      setFileAttachment(null);
      scrollToBottom();
    } catch (err) {
      console.error('Send message error:', err);
      alert('Encryption failed on client.');
    }
  };

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (20MB)
    if (file.size > 20 * 1024 * 1024) {
      alert('File size exceeds maximum limit of 20MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await api.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { url, originalName, size, mimeType } = res.data.file;
      let msgType: 'image' | 'voice' | 'pdf' | 'docx' = 'pdf';
      if (mimeType.startsWith('image/')) msgType = 'image';
      else if (mimeType.startsWith('audio/')) msgType = 'voice';
      else if (originalName.endsWith('.docx') || originalName.endsWith('.doc')) msgType = 'docx';

      await sendMessage(`Attachment: ${originalName}`, msgType, url, originalName, size);
    } catch (err: any) {
      alert(err.response?.data?.error || 'File upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Voice Note Recorder Controls
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });

        const formData = new FormData();
        formData.append('file', audioFile);

        setUploading(true);
        try {
          const res = await api.post('/chat/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          const { url, originalName, size } = res.data.file;
          await sendMessage('Voice Note', 'voice', url, originalName, size);
        } catch (err) {
          alert('Failed to upload voice note');
        } finally {
          setUploading(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access required to record voice notes.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slatebg-50">
      {/* Active Chat Header */}
      <div className="px-6 py-3.5 bg-white border-b border-slate-200/80 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={recipient?.avatar}
              alt={recipient?.username}
              className="w-10 h-10 rounded-full border border-slate-200 object-cover"
            />
            <span
              className={`w-3 h-3 rounded-full absolute bottom-0 right-0 border-2 border-white ${
                recipient?.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">{recipient?.name || 'Chat Partner'}</h3>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> End-to-End Encrypted
              </span>
            </div>
            <p className="text-xs text-slate-500">
              @{recipient?.username} • {recipient?.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        {/* Public Key Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slatebg-100 border border-slate-200 text-xs text-slate-600">
          <Key className="w-3.5 h-3.5 text-brand-600" />
          <span className="font-mono-code text-[11px] truncate max-w-xs">
            RSA Key: {recipient?.publicKey ? `${recipient.publicKey.slice(0, 24)}...` : 'Active'}
          </span>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 p-6 overflow-y-auto space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full text-xs text-slate-400">
            Decrypting message vault...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Secure E2EE Channel Active</h4>
            <p className="text-xs text-slate-500 max-w-sm">
              Messages are encrypted locally on your device with RSA-OAEP & AES-GCM-256 before leaving your browser.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <MessageBubble key={msg._id || idx} message={msg} currentUserId={currentUserId} />
          ))
        )}

        {partnerTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic py-1">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
            {recipient?.name} is typing an encrypted message...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Footer */}
      <div className="p-4 bg-white border-t border-slate-200/80">
        {/* Hidden File Picker */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,audio/*,.pdf,.docx,.doc"
        />

        {uploading && (
          <div className="mb-2 text-xs text-brand-600 flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" /> Uploading attachment blob...
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Attachment Button */}
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Attach Image, PDF, DOCX, or Voice"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Voice Note Recorder Trigger */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2.5 rounded-xl transition-colors ${
              isRecording
                ? 'bg-rose-100 text-rose-600 animate-pulse'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            title={isRecording ? 'Stop Recording' : 'Record Encrypted Voice Note'}
          >
            {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder={isRecording ? 'Recording voice note...' : 'Type an encrypted message...'}
            disabled={isRecording}
            className="flex-1 px-4 py-2.5 text-sm bg-slatebg-100 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900 placeholder:text-slate-400"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() && !fileAttachment}
            className="p-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow-sm transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
