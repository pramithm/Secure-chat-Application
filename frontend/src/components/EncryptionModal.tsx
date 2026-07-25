import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Key,
  Lock,
  Unlock,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Server,
  User,
  X,
  FileCode,
  Hash,
  Send,
  Zap
} from 'lucide-react';
import { Message, User as UserType } from '../types';

interface EncryptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message;
  currentUserId: string;
}

export const EncryptionModal: React.FC<EncryptionModalProps> = ({
  isOpen,
  onClose,
  message,
  currentUserId
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  if (!isOpen || !message) return null;

  const senderObj = typeof message.sender === 'object' ? (message.sender as UserType) : null;
  const receiverObj = typeof message.receiver === 'object' ? (message.receiver as UserType) : null;

  const isSender = (typeof message.sender === 'object' ? message.sender.id || message.sender._id : message.sender) === currentUserId;

  const steps = [
    {
      step: 1,
      title: 'Step 1: Original Plaintext Message',
      badge: 'Input Phase',
      icon: <FileCode className="w-5 h-5 text-brand-600" />,
      description: 'The raw, unencrypted message content typed by the sender in the web client.',
      code: message.decryptedContent || '[Decrypted Message Content]',
      tech: 'UTF-8 String Buffer'
    },
    {
      step: 2,
      title: 'Step 2: Session AES Key Generation',
      badge: 'Symmetric Crypto',
      icon: <Key className="w-5 h-5 text-amber-600" />,
      description: 'A brand-new, disposable 256-bit AES-GCM session key is generated in browser RAM using window.crypto.subtle.',
      code: `Algorithm: AES-GCM 256-bit\nRaw Secret Key (Simulated Hex):\n0f3a7c8e9b012456789abcdef0123456789abcdef0123456789abcdef012345`,
      tech: 'WebCrypto API (crypto.subtle.generateKey)'
    },
    {
      step: 3,
      title: 'Step 3: Payload AES-GCM-256 Encryption',
      badge: 'Ciphertext Creation',
      icon: <Lock className="w-5 h-5 text-indigo-600" />,
      description: 'The plaintext message is encrypted using AES-GCM with a unique 12-byte Initialization Vector (IV).',
      code: `IV (Initialization Vector):\n${message.iv}\n\nCiphertext (Stored Payload):\n${message.ciphertext}`,
      tech: 'AES-256-GCM + Random 96-bit IV'
    },
    {
      step: 4,
      title: 'Step 4: Encrypt AES Key with Receiver RSA Public Key',
      badge: 'Asymmetric Key Exchange',
      icon: <Cpu className="w-5 h-5 text-purple-600" />,
      description: 'The AES session key is encrypted with the recipient\'s 2048-bit RSA Public Key so only their Private Key can unlock it.',
      code: `Receiver RSA Public Key:\n${receiverObj?.publicKey?.slice(0, 100) || 'RSA-OAEP-2048 Public Key'}...\n\nEncrypted AES Key:\n${message.encryptedAesKey.slice(0, 120)}...`,
      tech: 'RSA-OAEP-2048 Encapsulation'
    },
    {
      step: 5,
      title: 'Step 5: Generate SHA-256 Message Integrity Hash',
      badge: 'Tamper Detection',
      icon: <Hash className="w-5 h-5 text-teal-600" />,
      description: 'A cryptographic SHA-256 digest is calculated over the plaintext to guarantee zero message tampering in transit.',
      code: `SHA-256 Hash Digest:\n${message.hash}`,
      tech: 'SHA-256 Cryptographic Hash'
    },
    {
      step: 6,
      title: 'Step 6: Network Transmission Packet Flow',
      badge: 'Zero-Knowledge Server',
      icon: <Send className="w-5 h-5 text-blue-600" />,
      description: 'The final packet containing only Ciphertext, Encrypted AES Key, IV, and Hash is transmitted through Node.js Express server to MongoDB.',
      code: `Server Persistence Schema (Strict Zero Plaintext):\n{\n  sender: "${senderObj?.username || 'Sender'}",\n  receiver: "${receiverObj?.username || 'Receiver'}",\n  ciphertext: "${message.ciphertext.slice(0, 30)}...",\n  encryptedAesKey: "${message.encryptedAesKey.slice(0, 30)}...",\n  iv: "${message.iv.slice(0, 15)}..."\n}`,
      tech: 'Socket.IO + Socket Encryption Relay'
    },
    {
      step: 7,
      title: 'Step 7: Receiver Unlocks AES Key via RSA Private Key',
      badge: 'Private Decryption',
      icon: <Unlock className="w-5 h-5 text-emerald-600" />,
      description: 'The recipient\'s browser receives the packet, imports their private RSA key, and decrypts the original AES-256 session key.',
      code: `Receiver RSA Private Key:\n[Protected Private Key stored securely in Client Local Storage]\n\nDecrypted Session Key:\n[AES-256-GCM CryptoKey Restored]`,
      tech: 'RSA-OAEP-2048 Private Decryption'
    },
    {
      step: 8,
      title: 'Step 8: Final Plaintext Restoration & Verification',
      badge: 'E2EE Complete',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      description: 'The recipient decrypts the ciphertext using the restored AES key and verifies the SHA-256 hash digest.',
      code: `Restored Plaintext Message:\n${message.decryptedContent || 'Message Decrypted Successfully'}\n\nIntegrity Verification: MATCHED (SHA-256 Valid)`,
      tech: 'AES-GCM Decryption + SHA-256 Verification'
    }
  ];

  const currentStepObj = steps.find(s => s.step === activeStep) || steps[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-modal-light border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slatebg-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Cryptographic Encryption Breakdown</h3>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Academic Visualizer
                </span>
              </div>
              <p className="text-xs text-slate-500">
                End-to-End Encryption Flow for Message ID: <span className="font-mono-code text-slate-700">{message._id.slice(-8)}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transmission Diagram Banner */}
        <div className="bg-gradient-to-r from-brand-50 via-white to-teal-50 px-6 py-3 border-b border-slate-100 flex items-center justify-around text-xs font-medium text-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center font-bold text-brand-600">
              A
            </div>
            <span>Sender ({senderObj?.username || 'You'})</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <ArrowRight className="w-4 h-4 animate-pulse text-brand-500" />
            <span className="font-mono-code text-[11px] text-brand-600 bg-white px-2 py-0.5 rounded border border-brand-200 shadow-2xs">
              AES-256 + RSA-2048 Packet
            </span>
            <ArrowRight className="w-4 h-4 animate-pulse text-brand-500" />
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-xs border border-slate-200">
            <Server className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-600 font-semibold">Zero-Knowledge Relay Server</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <ArrowRight className="w-4 h-4 animate-pulse text-teal-500" />
            <span className="font-mono-code text-[11px] text-teal-600 bg-white px-2 py-0.5 rounded border border-teal-200 shadow-2xs">
              Decryption Room
            </span>
            <ArrowRight className="w-4 h-4 animate-pulse text-teal-500" />
          </div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center font-bold text-teal-600">
              B
            </div>
            <span>Receiver ({receiverObj?.username || 'Friend'})</span>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Step Navigation Sidebar */}
          <div className="w-72 bg-slatebg-50 border-r border-slate-100 overflow-y-auto p-3 space-y-1.5">
            {steps.map(s => {
              const isActive = s.step === activeStep;
              return (
                <button
                  key={s.step}
                  onClick={() => setActiveStep(s.step)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    isActive
                      ? 'bg-white border-brand-200 shadow-sm text-brand-900 font-semibold'
                      : 'border-transparent text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-mono-code ${
                      isActive ? 'bg-brand-50 text-brand-700' : 'bg-slate-200/60 text-slate-600'
                    }`}>
                      Step {s.step}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{s.badge}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.icon}
                    <span className="text-xs truncate font-medium">{s.title.split(':')[1]}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Step Details View */}
          <div className="flex-1 p-6 overflow-y-auto bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100">
                  {currentStepObj.badge}
                </span>
                <span className="text-xs text-slate-400 font-mono-code">
                  Engine: {currentStepObj.tech}
                </span>
              </div>

              <h4 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                {currentStepObj.icon}
                {currentStepObj.title}
              </h4>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                {currentStepObj.description}
              </p>

              {/* Code Snippet Box */}
              <div className="rounded-xl bg-slate-900 text-slate-100 p-4 border border-slate-800 shadow-inner font-mono-code text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
                <div className="flex items-center justify-between text-slate-400 text-[11px] mb-2 pb-2 border-b border-slate-800">
                  <span>Cryptographic Data Inspect</span>
                  <span className="text-emerald-400">● Live Buffer</span>
                </div>
                {currentStepObj.code}
              </div>
            </div>

            {/* Step Controls */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                disabled={activeStep === 1}
                onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous Step
              </button>

              <div className="flex items-center gap-1">
                {steps.map(s => (
                  <div
                    key={s.step}
                    onClick={() => setActiveStep(s.step)}
                    className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${
                      s.step === activeStep ? 'bg-brand-600 w-5' : 'bg-slate-200 hover:bg-slate-300'
                    }`}
                  />
                ))}
              </div>

              <button
                disabled={activeStep === steps.length}
                onClick={() => setActiveStep(prev => Math.min(steps.length, prev + 1))}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors flex items-center gap-1"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
