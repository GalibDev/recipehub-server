import { connectDatabase } from '@/server/config/db';
import { handleApiError, json } from '@/server/api-response';
import { requireAdmin } from '@/server/auth';
import { User } from '@/server/models';
import { assertObjectId } from '@/server/object-id';
import { updateBlockSchema } from '@/server/validations';
import { AppError } from '@/server/utils/app-error';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await connectDatabase();
    await requireAdmin();
    const { id } = await context.params;
    assertObjectId(id);
    const data = updateBlockSchema.parse(await request.json());
    const user = await User.findByIdAndUpdate(id, { isBlocked: data.isBlocked }, { new: true });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return json(user);
  } catch (error) {
    return handleApiError(error);
  }
}
