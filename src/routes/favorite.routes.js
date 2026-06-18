import { Router } from 'express';
import { toggleFavorite } from '../controllers/favorite.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.post('/:recipeId', verifyToken, asyncHandler(toggleFavorite));

export default router;
