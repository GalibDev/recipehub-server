import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { jwt } from 'better-auth/plugins/jwt';
import mongoose from 'mongoose';

const socialProviders = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  ? { google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET } }
  : {};

export const betterAuthInstance = betterAuth({
  basePath: '/api/auth/better', secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL, trustedOrigins: [process.env.CLIENT_URL],
  database: mongodbAdapter(mongoose.connection.getClient().db()),
  emailAndPassword: { enabled: true, minPasswordLength: 6 }, socialProviders,
  plugins: [jwt()]
});
