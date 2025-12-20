import express from 'express';
import {
  getDashboardStats,
  getSalesPerformance,
} from '../controllers/dashboard.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/stats', authenticate, requireRole('ADMIN', 'SALES'), getDashboardStats);
router.get('/sales-performance', authenticate, requireRole('ADMIN'), getSalesPerformance);

export default router;


