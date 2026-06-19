import { connectDatabase } from '@/server/config/db';
import { handleApiError, json } from '@/server/api-response';
import { requireUser } from '@/server/auth';
import { Favorite, Payment, Recipe } from '@/server/models';

export async function GET() {
  try {
    await connectDatabase();
    const user = await requireUser();
    const [recipes, favorites, likes, purchases] = await Promise.all([
      Recipe.countDocuments({ authorId: user._id }),
      Favorite.countDocuments({ userId: user._id }),
      Recipe.aggregate([
        { $match: { authorId: user._id } },
        { $group: { _id: null, total: { $sum: '$likesCount' } } },
      ]),
      Payment.countDocuments({ userId: user._id, paymentStatus: 'paid' }),
    ]);

    return json({
      recipes,
      favorites,
      likes: likes[0]?.total || 0,
      purchases,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
