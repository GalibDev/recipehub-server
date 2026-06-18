import bcrypt from 'bcryptjs';
import { fromNodeHeaders } from 'better-auth/node';
import { User } from '../models/index.js';
import { AppError } from '../utils/app-error.js';
import { clearAuthCookie, issueAuthCookie, serializeUser } from '../utils/auth.js';
import { loginSchema, registerSchema } from '../validations/auth.validation.js';

export async function register(req, res) {
  const data = registerSchema.parse(req.body);
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

  issueAuthCookie(res, user);

  return res.status(201).json({
    user: serializeUser(user),
  });
}

export async function login(req, res) {
  const data = loginSchema.parse(req.body);
  const email = data.email.toLowerCase();

  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user || !(await bcrypt.compare(data.password, user.passwordHash || ''))) {
    throw new AppError(401, 'Invalid email or password');
  }

  if (user.isBlocked) {
    throw new AppError(403, 'Your account is blocked');
  }

  issueAuthCookie(res, user);

  return res.json({
    user: serializeUser(user),
  });
}

export function logout(req, res) {
  clearAuthCookie(res);
  return res.json({ ok: true });
}

export function getSession(req, res) {
  return res.json({
    user: serializeUser(req.user),
  });
}

export async function exchangeBetterAuthSession(req, res) {
  const session = await req.betterAuth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user) {
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
    {
      upsert: true,
      new: true,
    }
  );

  if (user.isBlocked) {
    throw new AppError(403, 'Your account is blocked');
  }

  issueAuthCookie(res, user);

  return res.json({
    user: serializeUser(user),
  });
}
