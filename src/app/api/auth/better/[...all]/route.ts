import { toNextJsHandler } from 'better-auth/next-js';
import { createBetterAuth } from '@/server/better-auth';

const auth = await createBetterAuth();

export const { GET, POST } = toNextJsHandler(auth.handler);
