import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { jwt } from 'better-auth/plugins/jwt';
import mongoose from 'mongoose';
import { env } from './env.js';

export function createBetterAuth() {
  const socialProviders =
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {};

  return betterAuth({
    basePath: '/api/auth/better',
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: [env.CLIENT_URL],
    database: mongodbAdapter(mongoose.connection.getClient().db()),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
    },
    socialProviders,
    plugins: [jwt()],
  });
}
