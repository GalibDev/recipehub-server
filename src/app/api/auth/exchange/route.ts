import { headers } from 'next/headers';
import { fromNodeHeaders } from 'better-auth/node';
import { createBetterAuth } from '@/server/better-auth';
import { connectDatabase } from '@/server/config/db';
import { handleApiError, json } from '@/server/api-response';
import { serializeUser, setAuthCookie } from '@/server/auth';
import { User } from '@/server/models';
import { AppError } from '@/server/utils/app-error';

export async function POST() {
  try {
    await connectDatabase();
    const auth = await createBetterAuth();
    const requestHeaders = await headers();
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(Object.fromEntries(requestHeaders.entries())),
    });

    if (!session?.user?.email) {
      throw new AppError(401, 'Better Auth session not found');
    }

    const user = await User.findOneAndUpdate(
      { email: session.user.email.toLowerCase() },
      {
        $set: {
          name: session.user.name || session.user.email.split('@')[0],
          image: session.user.image || '',
        },
        $setOnInsert: {
          role: 'user',
          isPremium: false,
          isBlocked: false,
        },
      },
      { upsert: true, new: true }
    );

    if (user.isBlocked) {
      throw new AppError(403, 'Your account is blocked');
    }

    await setAuthCookie(user);
    return json({ user: serializeUser(user) });
  } catch (error) {
    return handleApiError(error);
  }
}
