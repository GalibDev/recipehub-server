import { connectDatabase } from '@/server/config/db';
import { handleApiError, json } from '@/server/api-response';
import { requireUser } from '@/server/auth';
import { Favorite, Recipe } from '@/server/models';
import { assertObjectId } from '@/server/object-id';
import { AppError } from '@/server/utils/app-error';

type RouteContext = {
  params: Promise<{ recipeId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    await connectDatabase();
    const user = await requireUser();
    const { recipeId } = await context.params;
    assertObjectId(recipeId, 'recipeId');
    const favorite = await Favorite.exists({ userId: user._id, recipeId });

    return json({ favorite: Boolean(favorite) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    await connectDatabase();
    const user = await requireUser();
    const { recipeId } = await context.params;
    assertObjectId(recipeId, 'recipeId');
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      throw new AppError(404, 'Recipe not found');
    }

    const existingFavorite = await Favorite.findOne({ userId: user._id, recipeId });

    if (existingFavorite) {
      await existingFavorite.deleteOne();
      return json({ favorite: false });
    }

    await Favorite.create({
      userId: user._id,
      userEmail: user.email,
      recipeId,
    });

    return json({ favorite: true }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await connectDatabase();
    const user = await requireUser();
    const { recipeId } = await context.params;
    assertObjectId(recipeId, 'recipeId');
    const favorite = await Favorite.findOneAndDelete({ userId: user._id, recipeId });

    if (!favorite) {
      throw new AppError(404, 'Favorite not found');
    }

    return json({ favorite: false });
  } catch (error) {
    return handleApiError(error);
  }
}
