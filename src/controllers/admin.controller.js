import { Payment, Recipe, Report, User } from '../models/index.js';
import { AppError } from '../utils/app-error.js';
import { createPaginatedResponse, getPagination } from '../utils/pagination.js';
import { buildRecipeQuery } from './recipe.query.js';
import { updateBlockSchema, updateFeatureSchema } from '../validations/admin.validation.js';
import { updateReportSchema } from '../validations/report.validation.js';

export async function getAdminStats(req, res) {
  const [users, recipes, premium, reports] = await Promise.all([
    User.countDocuments(),
    Recipe.countDocuments(),
    User.countDocuments({ isPremium: true }),
    Report.countDocuments({ status: 'pending' }),
  ]);

  return res.json({
    users,
    recipes,
    premium,
    reports,
  });
}

export async function getUsers(req, res) {
  const { page, limit, skip } = getPagination(req.query, { limit: 10, maxLimit: 50 });
  const search = req.query.search
    ? {
        $or: ['name', 'email'].map((field) => ({
          [field]: { $regex: String(req.query.search), $options: 'i' },
        })),
      }
    : {};

  const [items, total] = await Promise.all([
    User.find(search).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(search),
  ]);

  return res.json(createPaginatedResponse({ items, total, page, limit }));
}

export async function updateUserBlock(req, res) {
  const data = updateBlockSchema.parse(req.body);
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked: data.isBlocked },
    { new: true }
  );

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return res.json(user);
}

export async function getAdminRecipes(req, res) {
  const { page, limit, skip } = getPagination(req.query, { limit: 10, maxLimit: 50 });
  const filters = buildRecipeQuery(req.query, true);

  const [items, total] = await Promise.all([
    Recipe.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Recipe.countDocuments(filters),
  ]);

  return res.json(createPaginatedResponse({ items, total, page, limit }));
}

export async function updateRecipeFeature(req, res) {
  const data = updateFeatureSchema.parse(req.body);
  const recipe = await Recipe.findByIdAndUpdate(
    req.params.id,
    { isFeatured: data.isFeatured },
    { new: true }
  );

  if (!recipe) {
    throw new AppError(404, 'Recipe not found');
  }

  return res.json(recipe);
}

export async function getReports(req, res) {
  const { page, limit, skip } = getPagination(req.query, { limit: 10, maxLimit: 50 });
  const status = req.query.status ? { status: req.query.status } : {};

  const [items, total] = await Promise.all([
    Report.find(status)
      .populate('recipeId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Report.countDocuments(status),
  ]);

  return res.json(createPaginatedResponse({ items, total, page, limit }));
}

export async function updateReport(req, res) {
  const data = updateReportSchema.parse(req.body);
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status: data.status },
    { new: true }
  );

  if (!report) {
    throw new AppError(404, 'Report not found');
  }

  return res.json(report);
}

export async function getPayments(req, res) {
  const { page, limit, skip } = getPagination(req.query, { limit: 10, maxLimit: 50 });

  const [items, total] = await Promise.all([
    Payment.find()
      .populate('userId', 'name email')
      .populate('recipeId', 'recipeName')
      .sort({ paidAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments(),
  ]);

  return res.json(createPaginatedResponse({ items, total, page, limit }));
}
