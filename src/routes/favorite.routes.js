import { Router } from 'express';
import {
  getFavoriteStatus,
  getFavorites,
  removeFavorite,
  toggleFavorite,
} from '../controllers/favorite.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { validateObjectId } from '../middleware/validate-object-id.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.use(verifyToken);
router.get('/', asyncHandler(getFavorites));
router.get('/:recipeId', validateObjectId('recipeId'), asyncHandler(getFavoriteStatus));
router.post('/:recipeId', validateObjectId('recipeId'), asyncHandler(toggleFavorite));
router.delete('/:recipeId', validateObjectId('recipeId'), asyncHandler(removeFavorite));

export default router;
