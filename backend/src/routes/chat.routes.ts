import { Router } from 'express';
import {
  getUserChats,
  getOrCreateChat,
  getChatMessages,
  uploadAttachment
} from '../controllers/chat.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.get('/', authenticateJWT, getUserChats);
router.post('/', authenticateJWT, getOrCreateChat);
router.get('/:chatId/messages', authenticateJWT, getChatMessages);
router.post('/upload', authenticateJWT, upload.single('file'), uploadAttachment);

export default router;
