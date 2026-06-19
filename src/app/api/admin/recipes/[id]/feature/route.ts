import { connectDatabase } from '@/server/config/db';
import { handleApiError, json } from '@/server/api-response';
import { requireAdmin } from '@/server/auth';
import { Recipe } from '@/server/models';
import { assertObjectId } from '@/server/object-id';
import { updateFeatureSchema } from '@/server/validations';
import { AppError } from '@/server/utils/app-error';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await connectDatabase();
    await requireAdmin();
    const { id } = await context.params;
    assertObjectId(id);
    const data = updateFeatureSchema.parse(await request.json());
    const recipe = await Recipe.findByIdAndUpdate(id, { isFeatured: data.isFeatured }, { new: true });

    if (!recipe) {
      throw new AppError(404, 'Recipe not found');
    }

    return json(recipe);
  } catch (error) {
    return handleApiError(error);
  }
}
