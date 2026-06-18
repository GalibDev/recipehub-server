import { Router } from 'express';
import {
  createRecipe,
  deleteRecipe,
  getRecipeById,
  getRecipes,
  toggleRecipeLike,
  updateRecipe,
} from '../controllers/recipe.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.get('/', asyncHandler(getRecipes));
router.get('/:id', asyncHandler(getRecipeById));
router.post('/', verifyToken, asyncHandler(createRecipe));
router.patch('/:id', verifyToken, asyncHandler(updateRecipe));
router.delete('/:id', verifyToken, asyncHandler(deleteRecipe));
router.post('/:id/like', verifyToken, asyncHandler(toggleRecipeLike));

export default router;
