import { Router } from 'express';
import { getAdminMetrics } from '../controllers/admin.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/metrics', authenticateJWT, getAdminMetrics);

export default router;
