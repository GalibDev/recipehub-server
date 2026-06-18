import { Router } from 'express';
import {
  getMyFavorites,
  getMyPurchases,
  getMyRecipes,
  getMyStats,
  updateProfile,
} from '../controllers/me.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.use(verifyToken);
router.get('/recipes', asyncHandler(getMyRecipes));
router.get('/favorites', asyncHandler(getMyFavorites));
router.get('/purchases', asyncHandler(getMyPurchases));
router.get('/stats', asyncHandler(getMyStats));
router.patch('/profile', asyncHandler(updateProfile));

export default router;
