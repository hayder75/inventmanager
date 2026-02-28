import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { getDailySummary } from '../controllers/daily-summary.controller';

const router = Router();

router.get('/summary', authenticate, requireRole('ADMIN', 'SALES'), getDailySummary);

export default router;
