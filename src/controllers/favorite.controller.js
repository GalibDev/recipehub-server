import { Favorite, Recipe } from '../models/index.js';
import { AppError } from '../utils/app-error.js';

export async function toggleFavorite(req, res) {
  const recipe = await Recipe.findById(req.params.recipeId);

  if (!recipe) {
    throw new AppError(404, 'Recipe not found');
  }

  const existingFavorite = await Favorite.findOne({
    userId: req.user._id,
    recipeId: req.params.recipeId,
  });

  if (existingFavorite) {
    await existingFavorite.deleteOne();
    return res.json({ favorite: false });
  }

  await Favorite.create({
    userId: req.user._id,
    userEmail: req.user.email,
    recipeId: req.params.recipeId,
  });

  return res.status(201).json({ favorite: true });
}
