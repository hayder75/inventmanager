import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { uploadBankTransfer, uploadBankTransferImage } from '../controllers/upload.controller';

const router = Router();

router.post('/bank-transfer', authenticate, requireRole('ADMIN', 'SALES'), uploadBankTransfer.single('image'), uploadBankTransferImage);

export default router;



