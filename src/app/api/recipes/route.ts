import { connectDatabase } from '@/server/config/db';
import { handleApiError, json } from '@/server/api-response';
import { requireUser } from '@/server/auth';
import { Favorite, Recipe, Report } from '@/server/models';
import { createRecipeSchema } from '@/server/validations';
import { createPaginatedResponse, getPagination } from '@/server/utils/pagination';
import { buildRecipeQuery } from '@/server/recipe-query';
import { AppError } from '@/server/utils/app-error';

export async function GET(request: Request) {
  try {
    await connectDatabase();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams, { limit: 8, maxLimit: 24 });
    const filters = buildRecipeQuery(searchParams);
    const sort: Record<string, 1 | -1> =
      searchParams.get('sort') === 'popular' ? { likesCount: -1 } : { createdAt: -1 };

    const [items, total] = await Promise.all([
      Recipe.find(filters).sort(sort).skip(skip).limit(limit).lean(),
      Recipe.countDocuments(filters),
    ]);

    return json(createPaginatedResponse({ items, total, page, limit }));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await connectDatabase();
    const user = await requireUser();
    const data = createRecipeSchema.parse(await request.json());

    if (!user.isPremium) {
      const totalRecipes = await Recipe.countDocuments({ authorId: user._id });

      if (totalRecipes >= 2) {
        throw new AppError(403, 'Free members can publish up to 2 recipes');
      }
    }

    const recipe = await Recipe.create({
      ...data,
      authorId: user._id,
      authorName: user.name,
      authorEmail: user.email,
    });

    await Promise.all([
      Favorite.deleteMany({ recipeId: recipe._id }),
      Report.deleteMany({ recipeId: recipe._id, status: 'resolved' }),
    ]);

    return json(recipe, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
