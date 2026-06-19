import { Router } from 'express';
import { createReport, getMyReports } from '../controllers/report.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.use(verifyToken);
router.get('/mine', asyncHandler(getMyReports));
router.post('/', asyncHandler(createReport));

export default router;
