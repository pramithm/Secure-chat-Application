import { Router } from 'express';
import { searchUsers, getUserPublicKey } from '../controllers/user.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/search', authenticateJWT, searchUsers);
router.get('/:userId/key', authenticateJWT, getUserPublicKey);

export default router;
