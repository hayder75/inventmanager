import express from 'express';
import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from '../controllers/companies.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticate, requireRole('ADMIN'), createCompany);
router.get('/', authenticate, requireRole('ADMIN', 'SALES'), getCompanies); // Allow SALES to read companies
router.get('/:id', authenticate, requireRole('ADMIN'), getCompanyById);
router.put('/:id', authenticate, requireRole('ADMIN'), updateCompany);
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteCompany);

export default router;


