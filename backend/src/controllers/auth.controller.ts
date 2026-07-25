import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth.middleware';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, username, email, password, avatar, publicKey, privateKeyEncrypted } = req.body;

    if (!name || !username || !email || !password) {
      res.status(400).json({ error: 'Name, username, email, and password are required.' });
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ username: cleanUsername }, { email: cleanEmail }]
    });

    if (existingUser) {
      res.status(400).json({
        error: existingUser.username === cleanUsername ? 'Username is already taken.' : 'Email is already registered.'
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const defaultAvatar = avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanUsername)}`;

    const newUser = await User.create({
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
    const token = jwt.sign({ id: newUser._id }, secret, { expiresIn: '7d' });

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
  } catch (error: any) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: error.message || 'Server error during registration.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { usernameOrEmail, password, publicKey, privateKeyEncrypted } = req.body;

    if (!usernameOrEmail || !password) {
      res.status(400).json({ error: 'Username/Email and password are required.' });
      return;
    }

    const input = usernameOrEmail.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ username: input }, { email: input }]
    }).select('+password');

    if (!user || !user.password) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    // Update keys if provided on login
    if (publicKey) user.publicKey = publicKey;
    if (privateKeyEncrypted) user.privateKeyEncrypted = privateKeyEncrypted;
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    const secret = process.env.JWT_SECRET || 'super_secret_secure_e2ee_jwt_key_2026';
    const token = jwt.sign({ id: user._id }, secret, { expiresIn: '7d' });

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
  } catch (error: any) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ user: req.user });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error fetching user profile.' });
  }
};

export const updateKeys = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { publicKey, privateKeyEncrypted } = req.body;
    if (!publicKey) {
      res.status(400).json({ error: 'Public key is required.' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    user.publicKey = publicKey;
    if (privateKeyEncrypted) user.privateKeyEncrypted = privateKeyEncrypted;
    await user.save();

    res.json({ message: 'Keys updated successfully.', publicKey: user.publicKey });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update keys.' });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { isOnline: false, lastSeen: new Date() });
    }
    res.json({ message: 'Logged out successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Logout failed.' });
  }
};
