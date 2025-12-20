import express from 'express';
import {
  createContact,
  getContacts,
  updateContact,
  deleteContact,
} from '../controllers/contacts.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticate, requireRole('ADMIN', 'SALES'), createContact);
router.get('/', authenticate, requireRole('ADMIN', 'SALES'), getContacts);
router.put('/:id', authenticate, requireRole('ADMIN', 'SALES'), updateContact);
router.delete('/:id', authenticate, requireRole('ADMIN', 'SALES'), deleteContact);

export default router;


