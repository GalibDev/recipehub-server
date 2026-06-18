import { Router } from 'express';
import { confirmPayment, createCheckoutSession } from '../controllers/payment.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.use(verifyToken);
router.post('/checkout', asyncHandler(createCheckoutSession));
router.post('/confirm', asyncHandler(confirmPayment));

export default router;
