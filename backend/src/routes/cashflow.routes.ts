import express from 'express';
import {
  getCashFlow,
  getCashFlowHistory,
  setDailyOpeningBalance,
  getDailyOpeningBalance,
  getDailySales,
} from '../controllers/cashflow.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticate, requireRole('ADMIN', 'SALES'), getCashFlow);
router.get('/history', authenticate, requireRole('ADMIN', 'SALES'), getCashFlowHistory);
router.post('/opening-balance', authenticate, requireRole('ADMIN'), setDailyOpeningBalance);
router.get('/opening-balance', authenticate, requireRole('ADMIN', 'SALES'), getDailyOpeningBalance);
router.get('/daily-sales', authenticate, requireRole('ADMIN', 'SALES'), getDailySales);

export default router;

