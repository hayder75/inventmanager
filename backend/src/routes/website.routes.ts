import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getPublicProducts,
  getNewProducts,
  getAllPublicProducts,
  updateProductWebsiteSettings,
  toggleProductVisibility,
  toggleProductNewStatus,
  deleteProductImage,
  upload,
} from '../controllers/website.controller';

const router = Router();

// Public routes (no auth required)
router.get('/products', getPublicProducts);
router.get('/products/new', getNewProducts);

// Admin routes (auth required)
router.get('/admin/products', authenticate, getAllPublicProducts);
router.put('/admin/products/:id/website', authenticate, upload.single('image'), updateProductWebsiteSettings);
router.patch('/admin/products/:id/toggle-visibility', authenticate, toggleProductVisibility);
router.patch('/admin/products/:id/toggle-new', authenticate, toggleProductNewStatus);
router.delete('/admin/products/:id/image', authenticate, deleteProductImage);

export default router;



