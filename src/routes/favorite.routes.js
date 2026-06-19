import { Router } from 'express';
import {
  getFavoriteStatus,
  getFavorites,
  removeFavorite,
  toggleFavorite,
} from '../controllers/favorite.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.use(verifyToken);
router.get('/', asyncHandler(getFavorites));
router.get('/:recipeId', asyncHandler(getFavoriteStatus));
router.post('/:recipeId', asyncHandler(toggleFavorite));
router.delete('/:recipeId', asyncHandler(removeFavorite));

export default router;
