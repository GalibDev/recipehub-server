import { getCurrentUser, serializeUser } from '@/server/auth';
import { json } from '@/server/api-response';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return json({ message: 'Authentication required' }, { status: 401 });
  }

  return json({ user: serializeUser(user) });
}
