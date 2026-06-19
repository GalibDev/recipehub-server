import { connectDatabase } from '@/server/config/db';
import { handleApiError, json } from '@/server/api-response';
import { requireAdmin } from '@/server/auth';
import { Recipe, Report, User } from '@/server/models';

export async function GET() {
  try {
    await connectDatabase();
    await requireAdmin();
    const [users, recipes, premium, reports] = await Promise.all([
      User.countDocuments(),
      Recipe.countDocuments(),
      User.countDocuments({ isPremium: true }),
      Report.countDocuments({ status: 'pending' }),
    ]);

    return json({ users, recipes, premium, reports });
  } catch (error) {
    return handleApiError(error);
  }
}
