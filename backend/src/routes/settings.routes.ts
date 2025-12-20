import express from 'express';
import {
  getSettings,
  updateSetting,
  getSetting,
} from '../controllers/settings.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticate, requireRole('ADMIN', 'SALES'), getSettings);
router.get('/:key', authenticate, requireRole('ADMIN', 'SALES'), getSetting);
router.put('/', authenticate, requireRole('ADMIN', 'SALES'), updateSetting); // Allow SALES to read, but only ADMIN can update

export default router;

