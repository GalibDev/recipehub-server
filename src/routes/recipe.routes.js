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
import { validateObjectId } from '../middleware/validate-object-id.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.get('/', asyncHandler(getRecipes));
router.get('/:id', validateObjectId('id'), asyncHandler(getRecipeById));
router.post('/', verifyToken, asyncHandler(createRecipe));
router.patch('/:id', verifyToken, validateObjectId('id'), asyncHandler(updateRecipe));
router.delete('/:id', verifyToken, validateObjectId('id'), asyncHandler(deleteRecipe));
router.post('/:id/like', verifyToken, validateObjectId('id'), asyncHandler(toggleRecipeLike));

export default router;
