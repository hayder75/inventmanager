import express from 'express';
import {
  addStock,
  adjustStock,
  getStockEntries,
  getStockAdjustments,
} from '../controllers/stock.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/add', authenticate, requireRole('ADMIN'), addStock);
router.post('/adjust', authenticate, requireRole('ADMIN'), adjustStock);
router.get('/entries', authenticate, requireRole('ADMIN'), getStockEntries);
router.get('/adjustments', authenticate, requireRole('ADMIN'), getStockAdjustments);

export default router;


