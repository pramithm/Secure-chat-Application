import React, { useState } from 'react';
import { Shield, FileText, Image, Mic, Download, Eye, Lock, CheckCheck } from 'lucide-react';
import { Message } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { EncryptionModal } from './EncryptionModal';

interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, currentUserId }) => {
  const { demoMode } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const senderId = typeof message.sender === 'object' ? (message.sender.id || message.sender._id) : message.sender;
  const isSelf = senderId === currentUserId;
  const senderName = typeof message.sender === 'object' ? message.sender.name : 'User';

  const renderContent = () => {
    switch (message.messageType) {
      case 'image':
        return (
          <div className="space-y-2">
            {message.mediaUrl ? (
              <img
                src={message.mediaUrl}
                alt="Encrypted attachment"
                className="max-w-xs rounded-lg border border-slate-200 shadow-xs object-cover"
              />
            ) : null}
            <p className="text-sm font-medium">{message.decryptedContent || '[Encrypted Image Caption]'}</p>
          </div>
        );

      case 'voice':
        return (
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-200">
            <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">Encrypted Voice Note</p>
              {message.mediaUrl && (
                <audio controls src={message.mediaUrl} className="h-8 w-48 mt-1" />
              )}
            </div>
          </div>
        );

      case 'pdf':
      case 'docx':
        return (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-slate-800 truncate">{message.fileName || 'Encrypted File Document'}</p>
              <p className="text-[11px] text-slate-500">{message.fileSize ? `${(message.fileSize / 1024).toFixed(1)} KB` : 'Document'}</p>
            </div>
            {message.mediaUrl && (
              <a
                href={message.mediaUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="p-2 rounded-lg text-brand-600 hover:bg-brand-50 transition-colors"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
          </div>
        );

      case 'text':
      default:
        return (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.decryptedContent || '[Decrypting message...]'}
          </p>
        );
    }
  };

  return (
    <>
      <div className={`flex flex-col mb-3 ${isSelf ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-semibold text-slate-500">{isSelf ? 'You' : senderName}</span>
          <span className="text-[10px] text-slate-400">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div
          className={`max-w-md p-3.5 rounded-2xl shadow-card-light border transition-all ${
            isSelf
              ? 'bg-brand-600 text-white border-brand-700 rounded-tr-xs'
              : 'bg-white text-slate-900 border-slate-200/90 rounded-tl-xs'
          }`}
        >
          {renderContent()}

          {/* Encryption Indicator & Demo Mode View Encryption Button */}
          <div
            className={`mt-2 pt-2 border-t flex items-center justify-between text-[11px] ${
              isSelf ? 'border-brand-500/50 text-brand-100' : 'border-slate-100 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span className="font-mono-code text-[10px]">E2EE AES-256</span>
            </div>

            {demoMode && (
              <button
                onClick={() => setIsModalOpen(true)}
                className={`px-2 py-0.5 rounded-md font-semibold text-[10px] flex items-center gap-1 transition-all ${
                  isSelf
                    ? 'bg-white/20 hover:bg-white/30 text-white'
                    : 'bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200'
                }`}
              >
                <Shield className="w-3 h-3" />
                View Encryption
              </button>
            )}

            {isSelf && <CheckCheck className="w-3.5 h-3.5 text-brand-200" />}
          </div>
        </div>
      </div>

      <EncryptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message={message}
        currentUserId={currentUserId}
      />
    </>
  );
};
