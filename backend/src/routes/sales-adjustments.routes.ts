import express from 'express';
import {
  createAdjustmentRequest,
  getAdjustmentRequests,
  getAdjustmentRequestById,
  reviewAdjustmentRequest,
} from '../controllers/sales-adjustments.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticate, requireRole('ADMIN', 'SALES'), createAdjustmentRequest);
router.get('/', authenticate, requireRole('ADMIN', 'SALES'), getAdjustmentRequests);
router.get('/:id', authenticate, requireRole('ADMIN', 'SALES'), getAdjustmentRequestById);
router.post('/:id/review', authenticate, requireRole('ADMIN'), reviewAdjustmentRequest);

export default router;