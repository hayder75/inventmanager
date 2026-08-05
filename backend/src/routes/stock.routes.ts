import express from 'express';
import {
  addStock,
  adjustStock,
  getStockEntries,
  getStockAdjustments,
  getStockReconciliation,
} from '../controllers/stock.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/add', authenticate, requireRole('ADMIN', 'SALES'), addStock);
router.post('/adjust', authenticate, requireRole('ADMIN', 'SALES'), adjustStock);
router.get('/entries', authenticate, requireRole('ADMIN', 'SALES'), getStockEntries);
router.get('/adjustments', authenticate, requireRole('ADMIN', 'SALES'), getStockAdjustments);
router.get('/reconcile', authenticate, requireRole('ADMIN'), getStockReconciliation);

export default router;


