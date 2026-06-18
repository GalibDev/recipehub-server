import { Router } from 'express';
import { createReport } from '../controllers/report.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.post('/', verifyToken, asyncHandler(createReport));

export default router;
