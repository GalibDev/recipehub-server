import { connectDatabase } from '@/server/config/db';
import { handleApiError, json } from '@/server/api-response';
import { requireUser, serializeUser } from '@/server/auth';
import { updateProfileSchema } from '@/server/validations';

export async function PATCH(request: Request) {
  try {
    await connectDatabase();
    const user = await requireUser();
    const data = updateProfileSchema.parse(await request.json());

    if (data.name !== undefined) {
      user.name = data.name;
    }

    if (data.image !== undefined) {
      user.image = data.image;
    }

    await user.save();
    return json({ user: serializeUser(user) });
  } catch (error) {
    return handleApiError(error);
  }
}
