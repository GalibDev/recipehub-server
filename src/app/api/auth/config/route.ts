import { json } from '@/server/api-response';
import { googleAuthEnabled } from '@/server/config/env';

export async function GET() {
  return json({ google: googleAuthEnabled });
}
