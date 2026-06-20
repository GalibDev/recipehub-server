import { connectDatabase } from '@/server/config/db';
import { handleApiError, json } from '@/server/api-response';
import { requireAdmin } from '@/server/auth';
import { Payment } from '@/server/models';
import { createPaginatedResponse, getPagination } from '@/server/utils/pagination';
import { buildRegexSearch } from '@/server/utils/query';

export async function GET(request: Request) {
  try {
    await connectDatabase();
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams, { limit: 10, maxLimit: 50 });
    const searchRegex = buildRegexSearch(searchParams.get('search'));
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const filters: Record<string, unknown> = {};

    if (searchRegex) {
      filters.$or = [
        { userEmail: searchRegex },
        { transactionId: searchRegex },
        { checkoutSessionId: searchRegex },
      ];
    }

    if (type === 'premium' || type === 'recipe') {
      filters.type = type;
    }

    if (status) {
      filters.paymentStatus = status;
    }

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [items, total, totals, successful, monthTotals] = await Promise.all([
      Payment.find(filters)
        .populate('userId', 'name email')
        .populate('recipeId', 'recipeName')
        .sort({ paidAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(filters),
      Payment.aggregate([{ $group: { _id: null, amount: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Payment.countDocuments({ paymentStatus: 'paid' }),
      Payment.aggregate([{ $match: { paidAt: { $gte: monthStart } } }, { $group: { _id: null, amount: { $sum: '$amount' } } }]),
    ]);

    return json({
      ...createPaginatedResponse({ items, total, page, limit }),
      summary: {
        totalTransactions: totals[0]?.count || 0,
        totalAmount: totals[0]?.amount || 0,
        successful,
        thisMonthAmount: monthTotals[0]?.amount || 0,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
