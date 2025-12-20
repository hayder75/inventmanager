import express from 'express';
import {
  getSuppliersOwed,
  recordSupplierPayment,
  getSupplierPayments,
} from '../controllers/suppliers.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/owed', authenticate, requireRole('ADMIN'), getSuppliersOwed);
router.post('/pay', authenticate, requireRole('ADMIN'), recordSupplierPayment);
router.get('/payments', authenticate, requireRole('ADMIN'), getSupplierPayments);

export default router;


