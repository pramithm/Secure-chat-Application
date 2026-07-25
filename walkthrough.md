# Secure End-to-End Encrypted Web Application - Walkthrough

A production-ready **Secure End-to-End Encrypted Communication Web Application** featuring a **White / Porcelain Light Design System**, native **WebCrypto API E2EE Engine** (RSA-OAEP-2048 + AES-256-GCM + SHA-256), real-time Socket.IO chat, encrypted file sharing, and an interactive **Cryptographic Breakdown Visualizer** for academic demonstrations.

---

## 🎨 Key Accomplishments & Design Features

### 1. Pristine Light Aesthetic
- **Background & Canvas**: Soft porcelain `#F8FAFC`, pure white cards `#FFFFFF`, fine slate borders `#E2E8F0`, and crisp `#0F172A` typography.
- **Accents**: Electric Indigo (`#4F46E5`), Emerald Teal (`#0D9488`), and Cyber Cyan (`#0284C7`).
- **Glassmorphism**: Light glass cards with backdrop blur (`backdrop-blur-md bg-white/90 border-slate-200/80`).

### 2. Native WebCrypto E2EE Engine
- **Asymmetric Keypair**: Client-side generation of RSA-OAEP-2048 public/private keypairs upon user registration. Public keys are registered on backend, while private keys stay securely in client local storage.
- **Symmetric Encryption**: Every message generates a disposable 256-bit AES-GCM session key and a 12-byte IV for payload encryption.
- **Integrity Digest**: Calculates SHA-256 message hashes for zero-tamper verification.
- **Zero-Knowledge Backend**: Express server and MongoDB persist **only** `ciphertext`, `encryptedAesKey`, `iv`, and `hash`. No plaintext is ever received or stored on the server.

### 3. Interactive Educational Visualizer & Academic Demo Mode
- **Demo Mode Switch**: Global toggle in top navigation bar.
- **View Encryption Modal**: Interactive 8-step modal detailing:
  1. Plaintext Input Phase
  2. WebCrypto AES-256 Session Key Generation
  3. AES-GCM-256 Payload Cipher Creation
  4. Recipient RSA-2048 Public Key Encapsulation
  5. SHA-256 Integrity Hash Computation
  6. Socket.IO Network Packet Relay (Sender Browser ➔ Node.js Server ➔ Receiver Browser)
  7. Recipient RSA Private Key Key Extraction
  8. AES-GCM Payload Restoration & SHA-256 Integrity Check

### 4. Rich Real-Time Messaging & File Attachments
- **Supported Formats**: Text, Images, Voice Notes (WebM/WAV recording via `MediaRecorder`), PDF, and DOCX files.
- **Security Validation**: 20MB max file size; executables (`.exe`, `.apk`), archives (`.zip`, `.rar`), and scripts are strictly rejected.
- **User Discovery & Connections**: Instant username lookup, friend request system (send, accept, reject), and verified friend messaging gating.

---

## 💻 Codebase Summary

| Component | File Path | Description |
| :--- | :--- | :--- |
| **Backend Server** | [server.ts](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/backend/src/server.ts) | Express + Helmet + CORS + Rate Limiter + Socket.IO server |
| **User Model** | [User.ts](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/backend/src/models/User.ts) | User schema storing RSA public keys and hashed passwords |
| **Message Model** | [Message.ts](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/backend/src/models/Message.ts) | Schema storing ONLY encrypted payloads & IVs |
| **Socket Handler** | [chatSocket.ts](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/backend/src/socket/chatSocket.ts) | Real-time encrypted packet relay & typing indicators |
| **WebCrypto Engine** | [webCrypto.ts](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/frontend/src/services/webCrypto.ts) | Browser RSA-OAEP + AES-GCM + SHA-256 cryptographic suite |
| **Encryption Modal** | [EncryptionModal.tsx](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/frontend/src/components/EncryptionModal.tsx) | Educational 8-step interactive encryption breakdown |
| **Chat Window** | [ChatWindow.tsx](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/frontend/src/components/ChatWindow.tsx) | Main encrypted chat interface with voice notes & attachments |
| **Light Theme CSS** | [index.css](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/frontend/src/index.css) | Custom Tailwind light theme tokens & scrollbars |
| **Docker Compose** | [docker-compose.yml](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/docker-compose.yml) | Orchestration for MongoDB, Mongo Express, Backend & Frontend |
| **Documentation** | [README.md](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/README.md) | Comprehensive installation and API documentation |

---

## 🧪 Build & Compilation Verification Results

- **Backend Build**: Clean compilation via `tsc` (0 errors).
- **Frontend Build**: Clean production build via `vite build` (`dist/assets/index-Cf0dwJeB.js` 429 kB, `dist/assets/index-WErJWU-0.css` 23.63 kB).

---

## 🚀 Running the Application Locally

```bash
# Terminal 1 - Backend Server
cd backend
npm run dev

# Terminal 2 - Frontend Application
cd frontend
npm run dev
```

*Open browser at `http://localhost:5173`.*
