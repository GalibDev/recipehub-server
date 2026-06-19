import { Favorite, Payment, Recipe } from '../models/index.js';
import { createPaginatedResponse, getPagination } from '../utils/pagination.js';
import { updateProfileSchema } from '../validations/profile.validation.js';

export async function getMyRecipes(req, res) {
  const { page, limit, skip } = getPagination(req.query, { limit: 6, maxLimit: 24 });
  const filters = { authorId: req.user._id };

  const [items, total] = await Promise.all([
    Recipe.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Recipe.countDocuments(filters),
  ]);

  return res.json(createPaginatedResponse({ items, total, page, limit }));
}

export async function getMyFavorites(req, res) {
  const { page, limit, skip } = getPagination(req.query, { limit: 6, maxLimit: 50 });
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

export async function getMyPurchases(req, res) {
  const { page, limit, skip } = getPagination(req.query, { limit: 6, maxLimit: 24 });
  const filters = {
    userId: req.user._id,
    recipeId: { $ne: null },
    paymentStatus: 'paid',
  };

  const [items, total] = await Promise.all([
    Payment.find(filters)
      .populate('recipeId')
      .sort({ paidAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments(filters),
  ]);

  return res.json(createPaginatedResponse({ items, total, page, limit }));
}

export async function updateProfile(req, res) {
  const data = updateProfileSchema.parse(req.body);

  if (data.name !== undefined) {
    req.user.name = data.name;
  }

  if (data.image !== undefined) {
    req.user.image = data.image;
  }

  await req.user.save();

  return res.json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      image: req.user.image,
      role: req.user.role,
      isPremium: req.user.isPremium,
      isBlocked: req.user.isBlocked,
    },
  });
}

export async function getMyStats(req, res) {
  const [recipes, favorites, likes, purchases] = await Promise.all([
    Recipe.countDocuments({ authorId: req.user._id }),
    Favorite.countDocuments({ userId: req.user._id }),
    Recipe.aggregate([
      { $match: { authorId: req.user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: '$likesCount' },
        },
      },
    ]),
    Payment.countDocuments({ userId: req.user._id, paymentStatus: 'paid' }),
  ]);

  return res.json({
    recipes,
    favorites,
    likes: likes[0]?.total || 0,
    purchases,
  });
}
