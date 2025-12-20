import express from 'express';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  resetUserPassword,
  deleteUser,
  resetUserCommission,
} from '../controllers/users.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticate, requireRole('ADMIN'), createUser);
router.get('/', authenticate, requireRole('ADMIN'), getUsers);
router.get('/:id', authenticate, requireRole('ADMIN'), getUserById);
router.put('/:id', authenticate, requireRole('ADMIN'), updateUser);
router.post('/:id/reset-password', authenticate, requireRole('ADMIN'), resetUserPassword);
router.post('/:id/reset-commission', authenticate, requireRole('ADMIN'), resetUserCommission);
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteUser);

export default router;


