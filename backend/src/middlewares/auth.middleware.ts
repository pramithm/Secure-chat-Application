import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'super_secret_secure_e2ee_jwt_key_2026';

    const decoded = jwt.verify(token, secret) as { id: string };
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401).json({ error: 'Unauthorized. User not found.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
  }
};
