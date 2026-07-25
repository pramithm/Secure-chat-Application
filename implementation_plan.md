# Implementation Plan - Secure End-to-End Encrypted Web Application

Build a production-quality, web-based educational and functional **Secure End-to-End Encrypted Communication System** with a clean, modern **Light / White-family Design Aesthetic** (porcelain backgrounds, crisp white surfaces, vibrant indigo/teal accents, soft elevation shadows).

---

## Technical Architecture & Adaptations

### 1. Web Application Adaptation
- **Frontend**: React 18 + Vite + TypeScript, Tailwind CSS + Lucide Icons, Framer Motion (for fluid encryption animations), Web Crypto API (for native client-side RSA-OAEP and AES-256-GCM operations), Socket.IO Client.
- **Backend**: Node.js + Express + TypeScript, Socket.IO, JWT + bcrypt, Multer (file handling), Mongoose (MongoDB ODM), Helmet, express-rate-limit.
- **Database**: MongoDB + Mongo Express (dev mode).
- **Storage**: Cloudinary (for encrypted media/file blobs and user avatars).

### 2. Light / White-Family UI Design System
- **Background Palette**: Primary canvas `#F8FAFC` (Slate-50) / `#F1F5F9` (Slate-100) / Pure White `#FFFFFF`.
- **Card Surfaces**: Pure white `#FFFFFF` with ultra-fine border `#E2E8F0` (Slate-200) and soft subtle shadows (`0 4px 20px -2px rgba(15, 23, 42, 0.04)`).
- **Primary Accents**: Vibrant Electric Indigo (`#4F46E5`), Emerald Teal (`#0D9488`), Cyber Cyan (`#0284C7`).
- **Typography**: Inter / Outfit sans-serif fonts with crisp high-contrast slate text (`#0F172A` headings, `#475569` body).
- **Visual Feel**: Clean, clinical, modern SaaS web interface inspired by Linear, Stripe, and Apple web apps, completely avoiding dark backgrounds as requested.

### 3. End-to-End Encryption (E2EE) Mechanism
- **Key Pair Generation**: On user registration/login, RSA-OAEP 2048-bit keypair is generated in the browser via `window.crypto.subtle`. Public key stored in MongoDB user record; private key encrypted and stored securely in local browser storage.
- **Encryption Flow**:
  1. Sender generates disposable 256-bit AES-GCM session key.
  2. Plaintext message is encrypted client-side using AES-GCM-256.
  3. AES session key is encrypted using Receiver's RSA Public Key.
  4. SHA-256 hash generated for message integrity check.
  5. Only ciphertext, encrypted AES key, IV, auth tag, and hash sent to server.
- **Decryption Flow**:
  1. Recipient receives encrypted packet via Socket.IO.
  2. Recipient decrypts AES key using their RSA Private Key.
  3. Recipient decrypts message payload using decrypted AES key.

---

## User Review Required

> [!IMPORTANT]
> **Web Application Stack Confirmation**: The `implementation plan.txt` originally specified React Native for mobile. Based on your prompt ("this is a web application keep in mind"), we are configuring the frontend as a high-performance **React + Vite Web Application**.

> [!NOTE]
> **Light Mode Focus**: The design system strictly uses white, soft porcelain, and slate light backgrounds (`#FFFFFF`, `#F8FAFC`) with high-contrast text and glowing indigo/teal active states. Dark mode will be removed/disabled in favor of a pristine light aesthetic.

---

## Open Questions

> [!IMPORTANT]
> 1. **MongoDB Connection**: Do you have a local MongoDB instance running (e.g. `mongodb://localhost:27017`), or should we use MongoDB Atlas / Docker Compose setup?
> 2. **Cloudinary Credentials**: For file/image uploads, do you have Cloudinary API credentials, or should we include a local mock file upload service for dev testing before Cloudinary setup?

---

## Proposed Modules & Changes

```
Secure Chat Application/
├── backend/
│   ├── src/
│   │   ├── config/          (db.ts, cloudinary.ts)
│   │   ├── controllers/     (auth.controller.ts, user.controller.ts, friend.controller.ts, chat.controller.ts, admin.controller.ts)
│   │   ├── middlewares/     (auth.middleware.ts, upload.middleware.ts, rateLimit.middleware.ts)
│   │   ├── models/          (User.ts, FriendRequest.ts, Chat.ts, Message.ts, File.ts)
│   │   ├── routes/          (auth.routes.ts, user.routes.ts, friend.routes.ts, chat.routes.ts, admin.routes.ts)
│   │   ├── services/        (encryptionService.ts, cloudinaryService.ts)
│   │   ├── socket/          (chatSocket.ts)
│   │   ├── utils/           (cryptoUtils.ts, apiError.ts)
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/      (Navbar, Sidebar, ChatWindow, MessageBubble, EncryptionModal, UserSearch, FriendRequests, AdminDashboard)
│   │   ├── contexts/        (AuthContext.tsx, SocketContext.tsx, CryptoContext.tsx)
│   │   ├── hooks/           (useCrypto.ts, useSocket.ts)
│   │   ├── pages/           (LoginPage.tsx, RegisterPage.tsx, ChatPage.tsx, SettingsPage.tsx, AdminPage.tsx)
│   │   ├── services/        (api.ts, socket.ts, webCrypto.ts)
│   │   ├── types/           (index.ts)
│   │   ├── App.tsx
│   │   └── index.css        (Light Theme tokens & utilities)
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── docker-compose.yml
└── README.md
```

### Module 1: Project Setup & Authentication API
#### [NEW] [backend/package.json](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/backend/package.json)
#### [NEW] [backend/src/server.ts](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/backend/src/server.ts)
#### [NEW] [backend/src/models/User.ts](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/backend/src/models/User.ts)
#### [NEW] [backend/src/controllers/auth.controller.ts](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/backend/src/controllers/auth.controller.ts)

### Module 2: Light UI Web Frontend Foundation & Authentication UI
#### [NEW] [frontend/package.json](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/frontend/package.json)
#### [NEW] [frontend/src/index.css](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/frontend/src/index.css) - White/Light porcelain theme tokens
#### [NEW] [frontend/src/services/webCrypto.ts](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/frontend/src/services/webCrypto.ts) - Web Crypto API keygen/encrypt/decrypt
#### [NEW] [frontend/src/pages/RegisterPage.tsx](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/frontend/src/pages/RegisterPage.tsx)
#### [NEW] [frontend/src/pages/LoginPage.tsx](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/frontend/src/pages/LoginPage.tsx)

### Module 3: User Discovery & Friend Request System
#### [NEW] [backend/src/controllers/friend.controller.ts](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/backend/src/controllers/friend.controller.ts)
#### [NEW] [frontend/src/components/UserSearch.tsx](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/frontend/src/components/UserSearch.tsx)
#### [NEW] [frontend/src/components/FriendRequests.tsx](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/frontend/src/components/FriendRequests.tsx)

### Module 4: Real-Time E2EE Socket Chat & File Attachments
#### [NEW] [backend/src/socket/chatSocket.ts](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/backend/src/socket/chatSocket.ts)
#### [NEW] [frontend/src/components/ChatWindow.tsx](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/frontend/src/components/ChatWindow.tsx)
#### [NEW] [frontend/src/components/MessageBubble.tsx](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/frontend/src/components/MessageBubble.tsx)

### Module 5: Encryption Process Visualization Engine (Interactive Modal & Demo Mode)
#### [NEW] [frontend/src/components/EncryptionModal.tsx](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/frontend/src/components/EncryptionModal.tsx)
- Step-by-step breakdown:
  - Step 1: Plaintext input
  - Step 2: Session AES-256 key generation
  - Step 3: Payload AES-GCM encryption
  - Step 4: AES Key encryption with RSA Public Key
  - Step 5: SHA-256 integrity hash compute
  - Step 6: Socket transmission packet (Sender -> Server -> Receiver)
  - Step 7: Receiver RSA Private Key decryption of AES key
  - Step 8: Final AES-GCM payload decryption

### Module 6: Settings, Admin Dashboard & Security
#### [NEW] [frontend/src/pages/AdminPage.tsx](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/frontend/src/pages/AdminPage.tsx)
#### [NEW] [backend/src/controllers/admin.controller.ts](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/backend/src/controllers/admin.controller.ts)

### Module 7: Docker Compose & Comprehensive README
#### [NEW] [docker-compose.yml](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/docker-compose.yml)
#### [NEW] [README.md](file:///c:/Users/HOME/Desktop/Secure%20Chat%20Application/README.md)

---

## Verification Plan

### Automated Tests & Checks
- TypeScript compilation check (`npm run build` in both `frontend` and `backend`).
- E2EE cryptographic unit tests (verifying AES-GCM + RSA key exchange roundtrip in browser environment).
- Backend API route sanity tests.

### Manual Verification
- Register two users in separate browser tabs (Tab A & Tab B).
- Search username, send friend request, accept request.
- Send encrypted message, image, voice note, and document file.
- Inspect MongoDB / Server logs to confirm ONLY ciphertexts and encrypted AES keys are stored on server.
- Toggle "Demo Mode", click "View Encryption" on a message, and step through the 8-stage interactive visualizer modal.
- Verify Light Mode UI: pure white background (`#FFFFFF`), crisp porcelain sidebars (`#F8FAFC`), rich contrast text, zero dark mode elements.
