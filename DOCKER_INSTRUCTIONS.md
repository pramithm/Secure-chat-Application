# CipherVault - Complete Docker & Port Access Guide

This guide explains how Docker Engine manages the CipherVault application services, why services stop/start with Docker Desktop, all exposed local ports, and exact commands to manage your local environment.

---

## 🌐 Local Access Ports & Web Interfaces

When Docker Engine is running, all services are exposed on your host machine (`localhost`):

| Service Name | Local Access URL / Host | Container Name | Port Mapping (Host ➔ Container) | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Web App** | [http://localhost:5173](http://localhost:5173) | `ciphervault-frontend` | `5173:5173` | Main Web UI (React + Vite + Light Aesthetic) |
| **Backend Express API** | [http://localhost:5000](http://localhost:5000) | `ciphervault-backend` | `5000:5000` | Node.js E2EE Socket & Express API Server |
| **API Health Check** | [http://localhost:5000/api/health](http://localhost:5000/api/health) | `ciphervault-backend` | `5000:5000` | Health check endpoint returning `{ status: "OK" }` |
| **Mongo Express GUI** | [http://localhost:8081](http://localhost:8081) | `ciphervault-mongo-express` | `8081:8081` | Web-based database management interface for MongoDB |
| **MongoDB Database** | `mongodb://localhost:27017/secure_chat_db` | `ciphervault-mongodb` | `27017:27017` | MongoDB 7.0 database engine (persistent storage) |

---

## ⚡ How Docker Engine Lifecycle Works

### 1. Why the App Stops When Docker Desktop Quits
All 4 application services (`ciphervault-frontend`, `ciphervault-backend`, `ciphervault-mongodb`, and `ciphervault-mongo-express`) run as isolated Linux containers inside Docker Engine. 

When you **close or quit Docker Desktop**:
- Docker Engine shuts down its virtualized container daemon.
- Network ports (`5173`, `5000`, `27017`, `8081`) are released.
- Browsing to `http://localhost:5173` will display `ERR_CONNECTION_REFUSED`.

### 2. Automatic Auto-Restart on Docker Desktop Startup
In our `docker-compose.yml`, all services have the flag:
```yaml
restart: always
```
**What this means:**
- Whenever you launch Docker Desktop, Docker Engine will **automatically start all 4 CipherVault containers** in the background!
- You do **not** need to re-run any commands manually every time you open Docker Desktop; simply open `http://localhost:5173` in your browser.

---

## 🛠️ Docker Commands Cheat Sheet

Run all commands from your terminal inside `c:\Users\HOME\Desktop\Secure Chat Application`.

### Start All Services (Background Mode)
If containers are stopped and you want to start them up:
```bash
docker compose up -d
```

### Rebuild & Restart All Services
Use this command if you edit code or configuration files and want to rebuild the container images:
```bash
docker compose up --build -d
```

### View Live Container Status
To check if all 4 services are running and healthy:
```bash
docker compose ps
```
*Alternatively:*
```bash
docker ps
```

### View Container Logs
To inspect logs for troubleshooting:
```bash
# View logs for all services combined
docker compose logs -f

# View logs for backend only
docker logs -f ciphervault-backend

# View logs for frontend only
docker logs -f ciphervault-frontend

# View logs for database only
docker logs -f ciphervault-mongodb
```

### Stop All Services Gracefully
To pause all services without losing your MongoDB database data:
```bash
docker compose stop
```

### Stop and Remove Containers
To completely stop and remove containers (data in MongoDB volume is preserved):
```bash
docker compose down
```

---

## 📊 Database Management with Mongo Express

To visually view collections, user records, and encrypted messages stored in MongoDB:

1. Open **[http://localhost:8081](http://localhost:8081)** in your browser.
2. Select database **`secure_chat_db`**.
3. View collections:
   - `users`: User profiles, public RSA keys, online status.
   - `messages`: Encrypted ciphertexts, IVs, encrypted AES keys, SHA-256 hashes (zero plaintext).
   - `friendrequests`: Connection requests between users.
   - `chats`: Active conversation sessions.

---

## 🚀 Summary Checklist for Daily Use

1. Start **Docker Desktop**.
2. Open **[http://localhost:5173](http://localhost:5173)** in your browser.
3. Start chatting securely!
