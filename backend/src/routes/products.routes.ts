import express from 'express';
import {
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getCategories,
  getProductMetrics,
} from '../controllers/products.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticate, requireRole('ADMIN', 'SALES'), getProducts);
router.get('/metrics', authenticate, requireRole('ADMIN'), getProductMetrics);
router.get('/categories', authenticate, requireRole('ADMIN', 'SALES'), getCategories);

router.get('/:id', authenticate, requireRole('ADMIN', 'SALES'), getProductById);
router.patch('/:id', authenticate, requireRole('ADMIN', 'SALES'), updateProduct);
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteProduct);

export default router;


