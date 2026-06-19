import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { jwt } from 'better-auth/plugins';
import { connectDatabase } from './config/db';
import { betterAuthTrustedOrigins, env, googleAuthEnabled } from './config/env';

export async function createBetterAuth() {
  const mongoose = await connectDatabase();
  const socialProviders = googleAuthEnabled
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
    trustedOrigins: betterAuthTrustedOrigins,
    database: mongodbAdapter(mongoose.connection.getClient().db()),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
    },
    socialProviders,
    plugins: [jwt()],
  });
}
