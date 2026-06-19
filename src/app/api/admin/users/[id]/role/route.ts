import { connectDatabase } from '@/server/config/db';
import { handleApiError, json } from '@/server/api-response';
import { requireAdmin } from '@/server/auth';
import { User } from '@/server/models';
import { assertObjectId } from '@/server/object-id';
import { updateRoleSchema } from '@/server/validations';
import { AppError } from '@/server/utils/app-error';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await connectDatabase();
    const admin = await requireAdmin();
    const { id } = await context.params;
    assertObjectId(id);
    const data = updateRoleSchema.parse(await request.json());

    if (String(admin._id) === id && data.role !== 'admin') {
      throw new AppError(400, 'You cannot remove your own admin role');
    }

    const user = await User.findByIdAndUpdate(id, { role: data.role }, { new: true });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return json(user);
  } catch (error) {
    return handleApiError(error);
  }
}
