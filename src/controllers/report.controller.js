import { Recipe, Report } from '../models/index.js';
import { AppError } from '../utils/app-error.js';
import { createPaginatedResponse, getPagination } from '../utils/pagination.js';
import { createReportSchema } from '../validations/report.validation.js';

export async function getMyReports(req, res) {
  const { page, limit, skip } = getPagination(req.query, { limit: 8, maxLimit: 50 });
  const filters = { reporterEmail: req.user.email };

  const [items, total] = await Promise.all([
    Report.find(filters)
      .populate('recipeId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Report.countDocuments(filters),
  ]);

  return res.json(createPaginatedResponse({ items, total, page, limit }));
}

export async function createReport(req, res) {
  const data = createReportSchema.parse(req.body);
  const recipe = await Recipe.findById(data.recipeId);

  if (!recipe) {
    throw new AppError(404, 'Recipe not found');
  }

  const existingReport = await Report.exists({
    recipeId: data.recipeId,
    reporterEmail: req.user.email,
    status: 'pending',
  });

  if (existingReport) {
    throw new AppError(409, 'You already have a pending report for this recipe');
  }

  const report = await Report.create({
    recipeId: data.recipeId,
    reporterEmail: req.user.email,
    reason: data.reason,
  });

  return res.status(201).json(report);
}
