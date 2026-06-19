import { connectDatabase } from '@/server/config/db';
import { handleApiError, json } from '@/server/api-response';
import { requireUser } from '@/server/auth';
import { Recipe, Report } from '@/server/models';
import { createReportSchema } from '@/server/validations';
import { AppError } from '@/server/utils/app-error';

export async function POST(request: Request) {
  try {
    await connectDatabase();
    const user = await requireUser();
    const data = createReportSchema.parse(await request.json());
    const recipe = await Recipe.findById(data.recipeId);

    if (!recipe) {
      throw new AppError(404, 'Recipe not found');
    }

    const existingReport = await Report.exists({
      recipeId: data.recipeId,
      reporterEmail: user.email,
      status: 'pending',
    });

    if (existingReport) {
      throw new AppError(409, 'You already have a pending report for this recipe');
    }

    const report = await Report.create({
      recipeId: data.recipeId,
      reporterEmail: user.email,
      reason: data.reason,
    });

    return json(report, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
