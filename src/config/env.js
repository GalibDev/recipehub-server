import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_URL: z.string().url().default('http://localhost:3000'),
  CORS_ORIGINS: z.string().optional().default(''),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_COOKIE_NAME: z.string().min(1).default('recipehub_token'),
  JWT_EXPIRES_IN: z.string().min(1).default('7d'),
  COOKIE_SECRET: z.string().min(16, 'COOKIE_SECRET must be at least 16 characters'),
  COOKIE_DOMAIN: z.string().optional().default(''),
  BETTER_AUTH_SECRET: z.string().min(16, 'BETTER_AUTH_SECRET must be at least 16 characters'),
  BETTER_AUTH_URL: z.string().url().default('http://localhost:5000'),
  BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional().default(''),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  STRIPE_SECRET_KEY: z.string().optional().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(''),
  PREMIUM_PRICE: z.coerce.number().int().positive().default(999),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `Invalid environment configuration: ${parsed.error.issues
      .map((issue) => issue.message)
      .join(', ')}`
  );
}

export const env = parsed.data;

export const corsOrigins = [
  env.CLIENT_URL,
  ...env.CORS_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
];

export const betterAuthTrustedOrigins = [
  env.CLIENT_URL,
  ...env.BETTER_AUTH_TRUSTED_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
];
