import { Recipe, Report } from '../models/index.js';
import { AppError } from '../utils/app-error.js';
import { createReportSchema } from '../validations/report.validation.js';

export async function createReport(req, res) {
  const data = createReportSchema.parse(req.body);
  const recipe = await Recipe.findById(data.recipeId);

  if (!recipe) {
    throw new AppError(404, 'Recipe not found');
  }

  const report = await Report.create({
    recipeId: data.recipeId,
    reporterEmail: req.user.email,
    reason: data.reason,
  });

  return res.status(201).json(report);
}
