"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const friend_routes_1 = __importDefault(require("./routes/friend.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const chatSocket_1 = require("./socket/chatSocket");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
// Security Middlewares
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use((0, cors_1.default)({ origin: [CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:5173'], credentials: true }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Rate Limiter
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', apiLimiter);
// Static uploads folder
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/friends', friend_routes_1.default);
app.use('/api/chats', chat_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', system: 'Secure Encrypted Communication Server', timestamp: new Date() });
});
// Socket.IO setup
const io = new socket_io_1.Server(server, {
    cors: {
        origin: [CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:5173'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});
(0, chatSocket_1.setupSocketHandlers)(io);
// Start server
(0, db_1.connectDB)().then(() => {
    server.listen(PORT, () => {
        console.log(`[Server] Secure E2EE Chat Server running on http://localhost:${PORT}`);
    });
});
