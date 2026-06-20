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
    const status: Record<string, unknown> =
      statusValue === 'pending'
        ? { status: 'pending' }
        : statusValue === 'reviewed'
          ? { status: { $in: ['dismissed', 'resolved'] } }
          : {};

    const [items, total, pendingReports, reviewedReports, allReports] = await Promise.all([
      Report.find(status).populate('recipeId').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Report.countDocuments(status),
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: { $in: ['dismissed', 'resolved'] } }),
      Report.countDocuments(),
    ]);

    return json({
      ...createPaginatedResponse({ items, total, page, limit }),
      summary: {
        pendingReports,
        reviewedReports,
        allReports,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
