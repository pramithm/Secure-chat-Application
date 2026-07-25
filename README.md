# CipherVault - Secure End-to-End Encrypted Web Application

> **Academic & Educational Secure Messaging Platform** with native WebCrypto End-to-End Encryption (E2EE) and interactive Cryptographic Breakdown Visualizer.

---

## 🌟 Overview & Key Highlights

CipherVault is a web-based secure communication system built to demonstrate modern cryptographic concepts in a practical, visual way:

- **100% Light / White-Family Design System**: Pristine white canvas (`#FFFFFF`), soft porcelain sidebars (`#F8FAFC`), crisp slate typography, and electric indigo (`#4F46E5`) / emerald teal accents.
- **Client-Side Hybrid Cryptography**: RSA-OAEP-2048 for key exchange + AES-256-GCM for message payload encryption + SHA-256 for tamper detection.
- **Zero-Knowledge Server Architecture**: The backend Node.js Express server and MongoDB database **NEVER** receive or store plaintext message contents.
- **Interactive Encryption Visualizer**: Click "View Encryption" on any message (or enable **Demo Mode** in the navigation bar) to launch an 8-step educational breakdown modal detailing session key generation, AES cipher creation, RSA key wrapping, SHA hashing, transmission packet structure, and receiver decryption.
- **Rich Media Sharing**: Support for encrypted text messages, images, voice notes, PDF, and DOCX documents with strict file extension and 20MB file validation.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + Vanilla CSS Light System Tokens
- **Icons & Animations**: Lucide React + Framer Motion
- **Cryptography Engine**: Native `window.crypto.subtle` (Web Crypto API)
- **Real-Time Communications**: Socket.IO Client + Axios

### Backend
- **Runtime**: Node.js + Express.js + TypeScript
- **Real-Time Messaging**: Socket.IO Server
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs
- **File Handling**: Multer + Cloudinary Support
- **Security Headers**: Helmet + express-rate-limit + CORS

### Database & Dev Tooling
- **Database**: MongoDB 7.0 + Mongoose ODM
- **Admin Interface**: Mongo Express (Port 8081)
- **Containerization**: Docker & Docker Compose

---

## 🔐 End-to-End Encryption Flow

```
[Sender Browser]
  ├── 1. Generate AES-256 Session Key (window.crypto.subtle)
  ├── 2. Encrypt Plaintext Message -> AES-256-GCM (Ciphertext + IV)
  ├── 3. Encrypt AES Key with Receiver RSA-2048 Public Key
  └── 4. Calculate SHA-256 Integrity Hash
                │
                ▼ (Transmit Packet over Socket.IO)
[Node.js Express Server + MongoDB Storage]
  └── Stores ONLY: { ciphertext, encryptedAesKey, iv, hash, sender, receiver, timestamp }
                │
                ▼ (Relay Socket Packet)
[Receiver Browser]
  ├── 1. Decrypt AES Key using Receiver RSA-2048 Private Key
  ├── 2. Decrypt Ciphertext Payload -> AES-256-GCM
  └── 3. Verify SHA-256 Integrity Digest & Render Plaintext
```

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017` (or Docker Desktop)

### 2. Local Installation Commands

#### Backend Setup
```bash
cd backend
npm install
npm run dev
```
*Backend server starts on `http://localhost:5000`*

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend app starts on `http://localhost:5173`*

---

## 🐳 Docker Deployment

To launch the complete application stack (MongoDB, Mongo Express, Backend, Frontend) via Docker Compose:

```bash
docker-compose up --build
```

- **Web Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Mongo Express DB Admin**: `http://localhost:8081`

---

## 📁 Repository Structure

```
Secure Chat Application/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection & Cloudinary setup
│   │   ├── controllers/     # Auth, User, Friend, Chat & Admin metrics
│   │   ├── middlewares/     # JWT Auth & Multer upload validation
│   │   ├── models/          # Mongoose Schemas (User, Message, Chat, FriendRequest, File)
│   │   ├── routes/          # Express API route endpoints
│   │   ├── socket/          # Socket.IO encrypted message relay & typing status
│   │   └── server.ts        # Express entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # EncryptionModal, ChatWindow, MessageBubble, UserSearch, FriendRequests
│   │   ├── contexts/        # AuthContext & SocketContext
│   │   ├── pages/           # ChatPage, LoginPage, RegisterPage, AdminPage
│   │   ├── services/        # webCrypto.ts (WebCrypto API E2EE engine), api.ts
│   │   ├── types/           # TypeScript Interfaces
│   │   ├── App.tsx          # Application Router & Protected Routes
│   │   └── index.css        # Tailwind Light Design System
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 🎓 Academic Demo Mode

To demonstrate encryption mechanics to faculty or reviewers:
1. Turn on **Demo Mode** using the top navigation bar toggle switch.
2. Every sent or received message bubble will reveal a **View Encryption** button.
3. Click the button to inspect the live 8-step cryptographic step breakdown and animated network transmission packet flow.
