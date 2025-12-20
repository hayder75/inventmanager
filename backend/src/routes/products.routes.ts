import express from 'express';
import {
  getProducts,
  getProductById,
  updateProduct,
} from '../controllers/products.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticate, requireRole('ADMIN', 'SALES'), getProducts);
router.get('/:id', authenticate, requireRole('ADMIN', 'SALES'), getProductById);
router.patch('/:id', authenticate, requireRole('ADMIN'), updateProduct);

export default router;


