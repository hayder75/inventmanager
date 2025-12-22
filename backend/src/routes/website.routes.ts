import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getPublicProducts,
  getAllPublicProducts,
  createPublicProduct,
  updatePublicProduct,
  deletePublicProduct,
  upload,
} from '../controllers/website.controller';

const router = Router();

// Public route (no auth required)
router.get('/products', getPublicProducts);

// Admin routes (auth required)
router.get('/admin/products', authenticate, getAllPublicProducts);
router.post('/admin/products', authenticate, upload.single('image'), createPublicProduct);
router.put('/admin/products/:id', authenticate, upload.single('image'), updatePublicProduct);
router.delete('/admin/products/:id', authenticate, deletePublicProduct);

export default router;

