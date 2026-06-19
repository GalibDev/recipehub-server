import { connectDatabase } from '@/server/config/db';
import { handleApiError, json } from '@/server/api-response';
import { requireUser } from '@/server/auth';
import { Recipe } from '@/server/models';
import { assertObjectId } from '@/server/object-id';
import { AppError } from '@/server/utils/app-error';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    await connectDatabase();
    const user = await requireUser();
    const { id } = await context.params;
    assertObjectId(id);
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      throw new AppError(404, 'Recipe not found');
    }

    const existingIndex = recipe.likedBy.findIndex(
      (likedUserId) => String(likedUserId) === String(user._id)
    );

    if (existingIndex >= 0) {
      recipe.likedBy.splice(existingIndex, 1);
    } else {
      recipe.likedBy.push(user._id);
    }

    recipe.likesCount = recipe.likedBy.length;
    await recipe.save();

    return json({
      likesCount: recipe.likesCount,
      liked: existingIndex < 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
