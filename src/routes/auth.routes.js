import { Router } from 'express';
import {
  exchangeBetterAuthSession,
  getSession,
  login,
  logout,
  register,
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/logout', logout);
router.get('/session', verifyToken, getSession);
router.post('/exchange', asyncHandler(exchangeBetterAuthSession));

export default router;
