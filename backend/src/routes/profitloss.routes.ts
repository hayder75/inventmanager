import express from 'express';
import { getProfitLoss } from '../controllers/profitloss.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticate, requireRole('ADMIN'), getProfitLoss);

export default router;

