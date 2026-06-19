import { connectDatabase } from '@/server/config/db';
import { handleApiError, json } from '@/server/api-response';
import { requireAdmin } from '@/server/auth';
import { User } from '@/server/models';
import { createPaginatedResponse, getPagination } from '@/server/utils/pagination';
import { buildRegexSearch } from '@/server/utils/query';

export async function GET(request: Request) {
  try {
    await connectDatabase();
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams, { limit: 10, maxLimit: 50 });
    const searchRegex = buildRegexSearch(searchParams.get('search'));
    const search = searchRegex
      ? {
          $or: ['name', 'email'].map((field) => ({
            [field]: searchRegex,
          })),
        }
      : {};

    const [items, total] = await Promise.all([
      User.find(search).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(search),
    ]);

    return json(createPaginatedResponse({ items, total, page, limit }));
  } catch (error) {
    return handleApiError(error);
  }
}
