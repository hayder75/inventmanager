import express from 'express';
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseReports,
} from '../controllers/expenses.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticate, requireRole('ADMIN', 'SALES'), createExpense);
router.get('/', authenticate, requireRole('ADMIN', 'SALES'), getExpenses);
router.get('/reports', authenticate, requireRole('ADMIN'), getExpenseReports);
router.get('/:id', authenticate, requireRole('ADMIN', 'SALES'), getExpenseById);
router.put('/:id', authenticate, requireRole('ADMIN', 'SALES'), updateExpense);
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteExpense);

export default router;

