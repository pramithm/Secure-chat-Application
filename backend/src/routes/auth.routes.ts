import { Router } from 'express';
import { register, login, getMe, updateKeys, logout } from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateJWT, getMe);
router.put('/keys', authenticateJWT, updateKeys);
router.post('/logout', authenticateJWT, logout);

export default router;
