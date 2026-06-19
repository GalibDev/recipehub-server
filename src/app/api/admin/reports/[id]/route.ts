import { connectDatabase } from '@/server/config/db';
import { handleApiError, json } from '@/server/api-response';
import { requireAdmin } from '@/server/auth';
import { Report } from '@/server/models';
import { assertObjectId } from '@/server/object-id';
import { updateReportSchema } from '@/server/validations';
import { AppError } from '@/server/utils/app-error';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await connectDatabase();
    await requireAdmin();
    const { id } = await context.params;
    assertObjectId(id);
    const data = updateReportSchema.parse(await request.json());
    const report = await Report.findByIdAndUpdate(id, { status: data.status }, { new: true });

    if (!report) {
      throw new AppError(404, 'Report not found');
    }

    return json(report);
  } catch (error) {
    return handleApiError(error);
  }
}
