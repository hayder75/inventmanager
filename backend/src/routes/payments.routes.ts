import express from 'express';
import {
  receivePayment,
  getPayments,
  getCompaniesWithBalance,
} from '../controllers/payments.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/receive', authenticate, requireRole('ADMIN', 'SALES'), receivePayment);
router.get('/', authenticate, requireRole('ADMIN', 'SALES'), getPayments);
router.get('/companies', authenticate, requireRole('ADMIN', 'SALES'), getCompaniesWithBalance);

export default router;


