import { prisma } from '@/lib/prisma';
import { successResponse } from '@/lib/apiResponse';

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { cases: true } } },
  });
  return successResponse(categories);
}
