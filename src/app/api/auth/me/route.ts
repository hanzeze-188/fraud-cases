import { getCurrentUser } from '@/lib/getCurrentUser';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errorResponse('未登录', 401);
  return successResponse(user);
}
