"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const authenticateJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized. No token provided.' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'super_secret_secure_e2ee_jwt_key_2026';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const user = await User_1.default.findById(decoded.id).select('-password');
        if (!user) {
            res.status(401).json({ error: 'Unauthorized. User not found.' });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
    }
};
exports.authenticateJWT = authenticateJWT;
