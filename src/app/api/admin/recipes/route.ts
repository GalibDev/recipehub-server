import { connectDatabase } from '@/server/config/db';
import { handleApiError, json } from '@/server/api-response';
import { requireAdmin } from '@/server/auth';
import { Recipe } from '@/server/models';
import { createPaginatedResponse, getPagination } from '@/server/utils/pagination';
import { buildRecipeQuery } from '@/server/recipe-query';

export async function GET(request: Request) {
  try {
    await connectDatabase();
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams, { limit: 10, maxLimit: 50 });
    const filters = buildRecipeQuery(searchParams, true);

    const [items, total] = await Promise.all([
      Recipe.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Recipe.countDocuments(filters),
    ]);

    return json(createPaginatedResponse({ items, total, page, limit }));
  } catch (error) {
    return handleApiError(error);
  }
}
