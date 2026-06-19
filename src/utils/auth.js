import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function getCookieOptions() {
  const options = {
    httpOnly: true,
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };

  if (env.COOKIE_DOMAIN) {
    options.domain = env.COOKIE_DOMAIN;
  }

  return options;
}

export function signAuthToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN,
      issuer: 'recipehub',
    }
  );
}

export function issueAuthCookie(res, user) {
  res.cookie(env.JWT_COOKIE_NAME, signAuthToken(user), getCookieOptions());
}

export function clearAuthCookie(res) {
  res.clearCookie(env.JWT_COOKIE_NAME, getCookieOptions());
}

export function serializeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    isPremium: user.isPremium,
    isBlocked: user.isBlocked,
  };
}
