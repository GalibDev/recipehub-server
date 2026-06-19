import { Favorite, Recipe } from '../models/index.js';
import { AppError } from '../utils/app-error.js';
import { createPaginatedResponse, getPagination } from '../utils/pagination.js';

export async function getFavorites(req, res) {
  const { page, limit, skip } = getPagination(req.query, { limit: 8, maxLimit: 50 });
  const filters = { userId: req.user._id };

  const [items, total] = await Promise.all([
    Favorite.find(filters)
      .populate('recipeId')
      .sort({ addedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Favorite.countDocuments(filters),
  ]);

  return res.json(createPaginatedResponse({ items, total, page, limit }));
}

export async function getFavoriteStatus(req, res) {
  const favorite = await Favorite.exists({
    userId: req.user._id,
    recipeId: req.params.recipeId,
  });

  return res.json({ favorite: Boolean(favorite) });
}

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

export async function removeFavorite(req, res) {
  const favorite = await Favorite.findOneAndDelete({
    userId: req.user._id,
    recipeId: req.params.recipeId,
  });

  if (!favorite) {
    throw new AppError(404, 'Favorite not found');
  }

  return res.json({ favorite: false });
}
