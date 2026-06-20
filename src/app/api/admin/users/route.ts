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
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const filters: Record<string, unknown> = {};

    if (searchRegex) {
      filters.$or = ['name', 'email'].map((field) => ({
        [field]: searchRegex,
      }));
    }

    if (role === 'admin' || role === 'user') {
      filters.role = role;
    }

    if (status === 'active' || status === 'blocked') {
      filters.isBlocked = status === 'blocked';
    }

    const [items, total, totalUsers, adminUsers, premiumUsers] = await Promise.all([
      User.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filters),
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ isPremium: true }),
    ]);

    return json({
      ...createPaginatedResponse({ items, total, page, limit }),
      summary: {
        totalUsers,
        adminUsers,
        premiumUsers,
        freeUsers: Math.max(0, totalUsers - premiumUsers),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
