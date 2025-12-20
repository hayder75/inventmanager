import express from 'express';
import { createSale, getSales, getSaleById, getBankDeposits } from '../controllers/sales.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticate, requireRole('ADMIN', 'SALES'), createSale);
router.get('/', authenticate, requireRole('ADMIN', 'SALES'), getSales);
router.get('/bank-deposits', authenticate, requireRole('ADMIN'), getBankDeposits);
router.get('/:id', authenticate, requireRole('ADMIN', 'SALES'), getSaleById);

export default router;


