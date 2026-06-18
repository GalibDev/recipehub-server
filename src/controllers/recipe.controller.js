import { Favorite, Recipe, Report } from '../models/index.js';
import { AppError } from '../utils/app-error.js';
import { createPaginatedResponse, getPagination } from '../utils/pagination.js';
import { createRecipeSchema, updateRecipeSchema } from '../validations/recipe.validation.js';
import { buildRecipeQuery } from './recipe.query.js';

export async function getRecipes(req, res) {
  const { page, limit, skip } = getPagination(req.query, { limit: 8, maxLimit: 24 });
  const filters = buildRecipeQuery(req.query);
  const sort = req.query.sort === 'popular' ? { likesCount: -1 } : { createdAt: -1 };

  const [items, total] = await Promise.all([
    Recipe.find(filters).sort(sort).skip(skip).limit(limit).lean(),
    Recipe.countDocuments(filters),
  ]);

  return res.json(createPaginatedResponse({ items, total, page, limit }));
}

export async function getRecipeById(req, res) {
  const recipe = await Recipe.findById(req.params.id).lean();

  if (!recipe) {
    throw new AppError(404, 'Recipe not found');
  }

  return res.json(recipe);
}

export async function createRecipe(req, res) {
  const data = createRecipeSchema.parse(req.body);

  if (!req.user.isPremium) {
    const totalRecipes = await Recipe.countDocuments({ authorId: req.user._id });

    if (totalRecipes >= 2) {
      throw new AppError(403, 'Free members can publish up to 2 recipes');
    }
  }

  const recipe = await Recipe.create({
    ...data,
    authorId: req.user._id,
    authorName: req.user.name,
    authorEmail: req.user.email,
  });

  return res.status(201).json(recipe);
}

export async function updateRecipe(req, res) {
  const data = updateRecipeSchema.parse(req.body);
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    throw new AppError(404, 'Recipe not found');
  }

  if (req.user.role !== 'admin' && String(recipe.authorId) !== String(req.user._id)) {
    throw new AppError(403, 'Not allowed');
  }

  Object.assign(recipe, data);
  await recipe.save();

  return res.json(recipe);
}

export async function deleteRecipe(req, res) {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    throw new AppError(404, 'Recipe not found');
  }

  if (req.user.role !== 'admin' && String(recipe.authorId) !== String(req.user._id)) {
    throw new AppError(403, 'Not allowed');
  }

  await Promise.all([
    recipe.deleteOne(),
    Favorite.deleteMany({ recipeId: recipe._id }),
    Report.deleteMany({ recipeId: recipe._id }),
  ]);

  return res.json({ ok: true });
}

export async function toggleRecipeLike(req, res) {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    throw new AppError(404, 'Recipe not found');
  }

  const existingIndex = recipe.likedBy.findIndex(
    (likedUserId) => String(likedUserId) === String(req.user._id)
  );

  if (existingIndex >= 0) {
    recipe.likedBy.splice(existingIndex, 1);
  } else {
    recipe.likedBy.push(req.user._id);
  }

  recipe.likesCount = recipe.likedBy.length;
  await recipe.save();

  return res.json({
    likesCount: recipe.likesCount,
    liked: existingIndex < 0,
  });
}
