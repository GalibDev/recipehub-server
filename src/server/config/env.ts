import { z } from 'zod';

const requiredEnvKeys = ['MONGODB_URI', 'JWT_SECRET', 'BETTER_AUTH_SECRET'] as const;

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/recipehub'),
  JWT_SECRET: z.string().min(16).default('recipehub-build-placeholder-jwt-secret'),
  JWT_COOKIE_NAME: z.string().min(1).default('recipehub_token'),
  JWT_EXPIRES_IN: z.string().min(1).default('7d'),
  BETTER_AUTH_SECRET: z.string().min(16).default('recipehub-build-placeholder-better-auth-secret'),
  BETTER_AUTH_URL: z.string().url().default('http://localhost:3000'),
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

export const missingRequiredEnv = requiredEnvKeys.filter((key) => !process.env[key]);

export function assertRuntimeEnv(...keys: Array<(typeof requiredEnvKeys)[number]>) {
  const missing = keys.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export const betterAuthTrustedOrigins = [
  env.NEXT_PUBLIC_APP_URL,
  ...env.BETTER_AUTH_TRUSTED_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
];

export const googleAuthEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
