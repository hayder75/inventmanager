import express from 'express';
import { login, register, verify, verifyAccessCode } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/verify', authenticate, verify);
router.post('/verify-access-code', verifyAccessCode);

export default router;


