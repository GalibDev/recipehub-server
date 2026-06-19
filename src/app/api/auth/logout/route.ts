import { clearAuthCookie } from '@/server/auth';
import { json } from '@/server/api-response';

export async function POST() {
  await clearAuthCookie();
  return json({ ok: true });
}
