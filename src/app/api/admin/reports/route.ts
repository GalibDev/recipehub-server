import { connectDatabase } from '@/server/config/db';
import { handleApiError, json } from '@/server/api-response';
import { requireAdmin } from '@/server/auth';
import { Report } from '@/server/models';
import { createPaginatedResponse, getPagination } from '@/server/utils/pagination';

export async function GET(request: Request) {
  try {
    await connectDatabase();
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams, { limit: 10, maxLimit: 50 });
    const statusValue = searchParams.get('status');
    const allowedStatuses = ['pending', 'dismissed', 'resolved'] as const;
    const status = allowedStatuses.some((item) => item === statusValue)
      ? { status: statusValue as (typeof allowedStatuses)[number] }
      : {};

    const [items, total] = await Promise.all([
      Report.find(status).populate('recipeId').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Report.countDocuments(status),
    ]);

    return json(createPaginatedResponse({ items, total, page, limit }));
  } catch (error) {
    return handleApiError(error);
  }
}
