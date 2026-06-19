import { connectDatabase } from '@/server/config/db';
import { handleApiError, json } from '@/server/api-response';
import { requireUser } from '@/server/auth';
import { Favorite, Recipe, Report } from '@/server/models';
import { updateRecipeSchema } from '@/server/validations';
import { assertObjectId } from '@/server/object-id';
import { AppError } from '@/server/utils/app-error';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    await connectDatabase();
    const { id } = await context.params;
    assertObjectId(id);
    const recipe = await Recipe.findById(id).lean();

    if (!recipe) {
      throw new AppError(404, 'Recipe not found');
    }

    return json(recipe);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await connectDatabase();
    const user = await requireUser();
    const { id } = await context.params;
    assertObjectId(id);
    const data = updateRecipeSchema.parse(await request.json());
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      throw new AppError(404, 'Recipe not found');
    }

    if (user.role !== 'admin' && String(recipe.authorId) !== String(user._id)) {
      throw new AppError(403, 'Not allowed');
    }

    Object.assign(recipe, data);
    await recipe.save();

    return json(recipe);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await connectDatabase();
    const user = await requireUser();
    const { id } = await context.params;
    assertObjectId(id);
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      throw new AppError(404, 'Recipe not found');
    }

    if (user.role !== 'admin' && String(recipe.authorId) !== String(user._id)) {
      throw new AppError(403, 'Not allowed');
    }

    await Promise.all([
      recipe.deleteOne(),
      Favorite.deleteMany({ recipeId: recipe._id }),
      Report.deleteMany({ recipeId: recipe._id }),
    ]);

    return json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
