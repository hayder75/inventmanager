import express from 'express';
import {
  addStock,
  adjustStock,
  getStockEntries,
  getStockAdjustments,
  approveStockAdjustment,
  rejectStockAdjustment,
} from '../controllers/stock.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/add', authenticate, requireRole('ADMIN', 'SALES'), addStock);
router.post('/adjust', authenticate, requireRole('ADMIN', 'SALES'), adjustStock);
router.get('/entries', authenticate, requireRole('ADMIN', 'SALES'), getStockEntries);
router.get('/adjustments', authenticate, requireRole('ADMIN', 'SALES'), getStockAdjustments);
router.patch('/adjustments/:id/approve', authenticate, requireRole('ADMIN'), approveStockAdjustment);
router.patch('/adjustments/:id/reject', authenticate, requireRole('ADMIN'), rejectStockAdjustment);

export default router;


