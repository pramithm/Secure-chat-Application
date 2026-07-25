import { Router } from 'express';
import {
  sendFriendRequest,
  respondFriendRequest,
  cancelFriendRequest,
  getFriendRequests,
  getFriendsList
} from '../controllers/friend.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post('/request', authenticateJWT, sendFriendRequest);
router.post('/respond', authenticateJWT, respondFriendRequest);
router.delete('/request/:requestId', authenticateJWT, cancelFriendRequest);
router.get('/requests', authenticateJWT, getFriendRequests);
router.get('/list', authenticateJWT, getFriendsList);

export default router;
