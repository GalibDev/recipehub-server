import { connectDatabase } from '@/server/config/db';
import { handleApiError, json } from '@/server/api-response';
import { requireUser } from '@/server/auth';
import { Payment } from '@/server/models';
import { createPaginatedResponse, getPagination } from '@/server/utils/pagination';

export async function GET(request: Request) {
  try {
    await connectDatabase();
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams, { limit: 6, maxLimit: 24 });
    const filters = {
      userId: user._id,
      recipeId: { $ne: null },
      paymentStatus: 'paid',
    };

    const [items, total] = await Promise.all([
      Payment.find(filters).populate('recipeId').sort({ paidAt: -1 }).skip(skip).limit(limit).lean(),
      Payment.countDocuments(filters),
    ]);

    return json(createPaginatedResponse({ items, total, page, limit }));
  } catch (error) {
    return handleApiError(error);
  }
}
