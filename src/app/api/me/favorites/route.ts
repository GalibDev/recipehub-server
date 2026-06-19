import { connectDatabase } from '@/server/config/db';
import { handleApiError, json } from '@/server/api-response';
import { requireUser } from '@/server/auth';
import { Favorite } from '@/server/models';
import { createPaginatedResponse, getPagination } from '@/server/utils/pagination';

export async function GET(request: Request) {
  try {
    await connectDatabase();
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams, { limit: 6, maxLimit: 50 });
    const filters = { userId: user._id };

    const [items, total] = await Promise.all([
      Favorite.find(filters).populate('recipeId').sort({ addedAt: -1 }).skip(skip).limit(limit).lean(),
      Favorite.countDocuments(filters),
    ]);

    return json(createPaginatedResponse({ items, total, page, limit }));
  } catch (error) {
    return handleApiError(error);
  }
}
