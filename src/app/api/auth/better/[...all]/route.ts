import { createBetterAuth } from '@/server/better-auth';

async function handle(request: Request) {
  const auth = await createBetterAuth();
  return auth.handler(request);
}

export const GET = handle;
export const POST = handle;
