import bcrypt from 'bcryptjs';
import { connectDatabase } from '@/server/config/db';
import { User } from '@/server/models';
import { handleApiError, json } from '@/server/api-response';
import { registerSchema } from '@/server/validations';
import { serializeUser, setAuthCookie } from '@/server/auth';
import { AppError } from '@/server/utils/app-error';

export async function POST(request: Request) {
  try {
    await connectDatabase();
    const data = registerSchema.parse(await request.json());
    const email = data.email.toLowerCase();
    const existingUser = await User.exists({ email });

    if (existingUser) {
      throw new AppError(409, 'Email is already registered');
    }

    const user = await User.create({
      name: data.name,
      email,
      image: data.image || '',
      passwordHash: await bcrypt.hash(data.password, 12),
    });

    await setAuthCookie(user);
    return json({ user: serializeUser(user) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
