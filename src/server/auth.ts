import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { connectDatabase } from './config/db';
import { assertRuntimeEnv, env } from './config/env';
import { User, type UserDocument } from './models';
import { AppError } from './utils/app-error';

type AuthPayload = {
  sub: string;
  email: string;
  role: string;
};

type PublicUser = {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: 'user' | 'admin';
  isBlocked?: boolean;
  isPremium?: boolean;
};

export function serializeUser(user: UserDocument): PublicUser {
  return {
    _id: String(user._id),
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role as PublicUser['role'],
    isPremium: user.isPremium,
    isBlocked: user.isBlocked,
  };
}

export function signAuthToken(user: UserDocument) {
  assertRuntimeEnv('JWT_SECRET');

  return jwt.sign(
    {
      sub: String(user._id),
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN as StringValue,
      issuer: 'recipehub',
    }
  );
}

export async function setAuthCookie(user: UserDocument) {
  const cookieStore = await cookies();

  cookieStore.set(env.JWT_COOKIE_NAME, signAuthToken(user), {
    httpOnly: true,
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(env.JWT_COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.JWT_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    await connectDatabase();

    const payload = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'recipehub',
    }) as AuthPayload;

    const user = await User.findById(payload.sub);

    if (!user || user.isBlocked) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError(401, 'Authentication required');
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== 'admin') {
    throw new AppError(403, 'Admin access required');
  }

  return user;
}
