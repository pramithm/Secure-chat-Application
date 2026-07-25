"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.updateKeys = exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const register = async (req, res) => {
    try {
        const { name, username, email, password, avatar, publicKey, privateKeyEncrypted } = req.body;
        if (!name || !username || !email || !password) {
            res.status(400).json({ error: 'Name, username, email, and password are required.' });
            return;
        }
        const cleanUsername = username.trim().toLowerCase();
        const cleanEmail = email.trim().toLowerCase();
        const existingUser = await User_1.default.findOne({
            $or: [{ username: cleanUsername }, { email: cleanEmail }]
        });
        if (existingUser) {
            res.status(400).json({
                error: existingUser.username === cleanUsername ? 'Username is already taken.' : 'Email is already registered.'
            });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const defaultAvatar = avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanUsername)}`;
        const newUser = await User_1.default.create({
            name,
            username: cleanUsername,
            email: cleanEmail,
            password: hashedPassword,
            avatar: defaultAvatar,
            publicKey: publicKey || '',
            privateKeyEncrypted: privateKeyEncrypted || '',
            isOnline: true
        });
        const secret = process.env.JWT_SECRET || 'super_secret_secure_e2ee_jwt_key_2026';
        const token = jsonwebtoken_1.default.sign({ id: newUser._id }, secret, { expiresIn: '7d' });
        res.status(201).json({
            message: 'User registered successfully.',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                username: newUser.username,
                email: newUser.email,
                avatar: newUser.avatar,
                publicKey: newUser.publicKey,
                privateKeyEncrypted: newUser.privateKeyEncrypted,
                role: newUser.role
            }
        });
    }
    catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: error.message || 'Server error during registration.' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { usernameOrEmail, password, publicKey, privateKeyEncrypted } = req.body;
        if (!usernameOrEmail || !password) {
            res.status(400).json({ error: 'Username/Email and password are required.' });
            return;
        }
        const input = usernameOrEmail.trim().toLowerCase();
        const user = await User_1.default.findOne({
            $or: [{ username: input }, { email: input }]
        }).select('+password');
        if (!user || !user.password) {
            res.status(401).json({ error: 'Invalid credentials.' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials.' });
            return;
        }
        // Update keys if provided on login
        if (publicKey)
            user.publicKey = publicKey;
        if (privateKeyEncrypted)
            user.privateKeyEncrypted = privateKeyEncrypted;
        user.isOnline = true;
        user.lastSeen = new Date();
        await user.save();
        const secret = process.env.JWT_SECRET || 'super_secret_secure_e2ee_jwt_key_2026';
        const token = jsonwebtoken_1.default.sign({ id: user._id }, secret, { expiresIn: '7d' });
        res.json({
            message: 'Login successful.',
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                publicKey: user.publicKey,
                privateKeyEncrypted: user.privateKeyEncrypted,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Server error during login.' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        res.json({ user: req.user });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error fetching user profile.' });
    }
};
exports.getMe = getMe;
const updateKeys = async (req, res) => {
    try {
        const { publicKey, privateKeyEncrypted } = req.body;
        if (!publicKey) {
            res.status(400).json({ error: 'Public key is required.' });
            return;
        }
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            res.status(404).json({ error: 'User not found.' });
            return;
        }
        user.publicKey = publicKey;
        if (privateKeyEncrypted)
            user.privateKeyEncrypted = privateKeyEncrypted;
        await user.save();
        res.json({ message: 'Keys updated successfully.', publicKey: user.publicKey });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update keys.' });
    }
};
exports.updateKeys = updateKeys;
const logout = async (req, res) => {
    try {
        if (req.user) {
            await User_1.default.findByIdAndUpdate(req.user._id, { isOnline: false, lastSeen: new Date() });
        }
        res.json({ message: 'Logged out successfully.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Logout failed.' });
    }
};
exports.logout = logout;
