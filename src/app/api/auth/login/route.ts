import bcrypt from 'bcryptjs';
import { connectDatabase } from '@/server/config/db';
import { User } from '@/server/models';
import { handleApiError, json } from '@/server/api-response';
import { loginSchema } from '@/server/validations';
import { serializeUser, setAuthCookie } from '@/server/auth';
import { AppError } from '@/server/utils/app-error';

export async function POST(request: Request) {
  try {
    await connectDatabase();
    const data = loginSchema.parse(await request.json());
    const user = await User.findOne({ email: data.email.toLowerCase() }).select('+passwordHash');

    if (!user || !(await bcrypt.compare(data.password, user.passwordHash || ''))) {
      throw new AppError(401, 'Invalid email or password');
    }

    if (user.isBlocked) {
      throw new AppError(403, 'Your account is blocked');
    }

    await setAuthCookie(user);
    return json({ user: serializeUser(user) });
  } catch (error) {
    return handleApiError(error);
  }
}
