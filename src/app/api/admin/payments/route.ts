import { connectDatabase } from '@/server/config/db';
import { handleApiError, json } from '@/server/api-response';
import { requireAdmin } from '@/server/auth';
import { Payment } from '@/server/models';
import { createPaginatedResponse, getPagination } from '@/server/utils/pagination';

export async function GET(request: Request) {
  try {
    await connectDatabase();
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams, { limit: 10, maxLimit: 50 });

    const [items, total] = await Promise.all([
      Payment.find()
        .populate('userId', 'name email')
        .populate('recipeId', 'recipeName')
        .sort({ paidAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(),
    ]);

    return json(createPaginatedResponse({ items, total, page, limit }));
  } catch (error) {
    return handleApiError(error);
  }
}
